import { Pool } from "pg";

const patches = require.context("./dbPatches", false, /\.sql$/);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const versions = patches.keys()
                        .filter(path => path.startsWith(".")) // TODO: FIX https://github.com/webpack/webpack/issues/12087
                        .sort(collator.compare)
                        .map(patches)
                        .map((mod: any) => mod.default as string);

export default async function migrate(pool: Pool) {
  const { rows } = await pool.query(`
    SELECT EXISTS
    (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'meta'
    );
  `);
  
  let version;
  
  if(!rows[0].exists) {
    version = 0;
  } else {
    const { rows } = await pool.query(`
      SELECT * FROM meta;
    `);
    
    if(rows.length === 0) {
      version = 0;
    } else {
      version = rows[0].version;
    }
  }
  
  if(version < versions.length) {
    console.log(`Upgrading database from ${version} to ${versions.length}`);
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for(let v = version; v < versions.length; v++) {
        await client.query(versions[v]);
      }
      
      await client.query(`
        UPDATE meta SET version=$1
      `, [versions.length]);
      
      await client.query('COMMIT');
    } catch(e) {
      await client.query('ROLLBACK');
      console.error(e);
      console.error("Failed to migrate, exiting...");
      process.exit(-1);
    } finally {
      client.release();
    }
    
    console.log(`Upgraded`);
  } else if(version > versions.length) {
    throw new Error(`DB Version (${version}) is larger than migration.js (${versions.length}), something went wrong!`);
  }
  
  return pool;
}
