import { Pool, PoolClient } from "pg";
import chalk from "chalk";
import SQL from "sql-template-strings";

const patches = require.context("./dbPatches", false, /^(.\/).*\.sql$/);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const versions = patches.keys()
                        .sort(collator.compare)
                        .map(patches)
                        .map((mod: any) => mod.default as string);

export default async function migrate(pool: Pool) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const version = await checkVersion(client);
    
    if(version < versions.length) {
      console.log(chalk.white.bold(`Upgrading database from ${version} to ${versions.length}`));
      
      for(let v = version; v < versions.length; v++) {
        await client.query(versions[v]);
      }
      
      await client.query(SQL`UPDATE meta SET version=${versions.length}`);
      
      await client.query('COMMIT');
      
      console.log(chalk.green.bold(`Upgraded`));
    } else if(version > versions.length) {
      throw new Error(`Database version (${version}) is greater than migration.js (${versions.length}). Something went wrong!`);
    }
    
    await client.query('COMMIT');
  } catch(e) {
    console.error(e);
    console.error(chalk.red.bold("Failed to migrate, exiting..."));
    
    try {
      await client.query('ROLLBACK');
    } catch(e) {
      console.error(e);
    }
    
    process.exit(-1);
  } finally {
    client.release();
  }
  
  return pool;
}

async function checkVersion(client: PoolClient) {
  const { rows } = await client.query(SQL`
    SELECT EXISTS
    (
       SELECT 1
       FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relname = 'meta'
         AND c.relkind = 'r'    -- only tables
    );
  `);
  
  if(!rows[0].exists) {
    return 0;
  } else {
    const response = await client.query(`
      SELECT version FROM meta;
    `);
    
    if(response.rows.length === 0) {
      return 0;
    } else {
      return response.rows[0].version as number;
    }
  }
}
