import { Pool, QueryResultRow } from 'pg';
import SQL, { SQLStatement } from "sql-template-strings";
import configs from './configs';
import migrate from './migration';

export const pool = new Pool(configs.db);

export const migration = migrate(pool).catch(console.error);

const db = {
  pool,
  
  async queryFirst<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    const { rows } = await pool.query<T>(query);
    if(rows.length <= 0) return null;
    return rows[0];
  },
  
  async queryAll<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    const { rows } = await pool.query<T>(query);
    return rows;
  },
  
  async query<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    return await pool.query<T>(query);
  },
  
  combineWhere(conditions: SQLStatement[]) {
    if(conditions.length == 0) return SQL``;
    
    let ret = SQL`WHERE `;
    let first = true;
    
    for(const condition of conditions) {
      if(!first) {
        ret = ret.append(SQL` AND `);
      }
      
      first = false;
      ret = ret.append(condition);
    }
    
    return ret;
  },
  
  updateFields<T>(fields: Partial<T>) {
    let update = SQL``;
    let first = true;
    
    for(const field of Object.keys(fields) as Array<keyof T>) {
      if(typeof field !== "string" || fields[field] === undefined) continue;
      
      if(!first) update = update.append(",\n");
      else first = false;
      
      update = update.append(`"${field}"`).append(SQL` = ${fields[field]}`);
    }
    
    if(update.query.length <= 0) return null;
    else return update.append("\n");
  },
  
  freeTextQuery: (query: string, fields: string[]) => {
    if(query === null) return [];
    const words = query.match(/\b(\w+)\b/g);
    if(!words) return [];
    
    const filters: SQLStatement[] = [];
    const document = fields.map(field => `COALESCE(${field}, '')`).join(" || ' ' || ");
    
    for(const word of words) {
      filters.push(SQL``.append(document).append(SQL` ILIKE ${"%" + word + "%"}`));
    }
    
    return filters;
  },
};

export default db;
