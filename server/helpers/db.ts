import { Pool, PoolClient, QueryResultRow, types } from 'pg';
import SQL, { SQLStatement } from "sql-template-strings";
import configs from './configs';
import migrate from './migration';

types.setTypeParser(20, val => BigInt(val));

export const pool = new Pool(configs.db);

export const migration = migrate(pool).catch(console.error);

type Callback = () => any;
type ErrCallback = (err: Error) => any;

export class Db {
  constructor(public inner: Pool | PoolClient) {}
  
  async queryFirst<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    const { rows } = await this.inner.query<T>(query);
    if(rows.length <= 0) return null;
    return rows[0];
  }
  
  async queryAll<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    const { rows } = await this.inner.query<T>(query);
    return rows;
  }
  
  async query<T extends QueryResultRow>(query: SQLStatement) {
    await migration;
    return await this.inner.query<T>(query);
  }
  
  async transaction<R>(callback: (client: DbTransaction) => Promise<R>): Promise<R> {
    const client = await pool.connect();
    const transaction = new DbTransaction(client);
    let committed = false;
    let cleanExit = false;
    
    try {
      await client.query(SQL`BEGIN`);
      const ret = await callback(transaction);
      await client.query(SQL`COMMIT`);
      committed = true;
      
      for(const fun of transaction.onCommitFns) { await fun(); }
      
      return ret;
    } catch(err) {
      cleanExit = false;
      
      if(!committed) await client.query(SQL`ROLLBACK`);
      for(const fun of transaction.onErrorFns) { await fun(err as Error); }
      
      cleanExit = true;
      throw err;
    } finally {
      for(const fun of transaction.onFinallyFns) {
        try {
          await fun();
        } catch(e) {
          console.error("Error in finally!");
          console.error(e);
          
          cleanExit = false;
        }
      }
      
      client.release(!cleanExit);
    }
  }
  
  combineWhere(conditions: SQLStatement[]) {
    if(conditions.length == 0) return SQL``;
    
    let ret = SQL`\nWHERE `;
    let first = true;
    
    for(const condition of conditions) {
      if(!first) {
        ret = ret.append(SQL` AND `);
      }
      
      first = false;
      ret = ret.append("(").append(condition).append(")");
    }
    
    ret.append(SQL`\n`);
    
    return ret;
  }
  
  updateFields<T>(fields: Partial<T>) {
    let update = SQL``;
    let first = true;
    
    for(const field of Object.keys(fields) as Array<keyof T>) {
      if(typeof field !== "string" || fields[field] === undefined) continue;
      
      if(!first) update = update.append(",\n");
      else first = false;
      
      const value = fields[field];
      const sqlValue = value instanceof SQLStatement ? value : SQL`${fields[field]}`;
      
      update = update.append(`"${field}" = `).append(sqlValue);
    }
    
    if(update.query.length <= 0) return null;
    else return update.append("\n");
  }
  
  freeTextQuery(query: string, fields: string[]) {
    if(query === null) return [];
    const words = query.match(/\b(\w+)\b/g);
    if(!words) return [];
    
    const filters: SQLStatement[] = [];
    const document = fields.map(field => `COALESCE(${field}, '')`).join(" || ' ' || ");
    
    for(const word of words) {
      filters.push(SQL``.append(document).append(SQL` ILIKE ${"%" + word + "%"} COLLATE pg_catalog."default"`));
    }
    
    return filters;
  }
}

export class DbTransaction extends Db {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(inner: PoolClient) {
    super(inner);
  }
  
  onCommitFns: Callback[] = [];
  onErrorFns: ErrCallback[] = [];
  onFinallyFns: Callback[] = [];
  
  onCommit(callback: Callback) {
    this.onCommitFns.push(callback);
  }
  
  onError(callback: ErrCallback) {
    this.onErrorFns.push(callback);
  }
  
  onFinally(callback: Callback) {
    this.onFinallyFns.push(callback);
  }
  
  async transaction<R>(callback: (client: DbTransaction) => Promise<R>): Promise<R> {
    return callback(this);
  }
}

export default new Db(pool);

export function toTimestampMs(timestamp: number | undefined | null) {
  if(timestamp === undefined || timestamp === null) return timestamp;
  else return SQL`to_timestamp_ms(${timestamp})`;
}

export function currentTimestamp() {
  return SQL`CURRENT_TIMESTAMP`;
}
