import ws from 'ws';

declare global {
  namespace Express {
    export interface Request {
      ws?: () => Promise<ws>;
    }
  }
}
