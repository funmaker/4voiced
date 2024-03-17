import expressCore from "express-serve-static-core";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });

export default function wsMiddleware(req: expressCore.RequestEx<any, any, any>, res: expressCore.ResponseEx<any>, next: expressCore.NextFunction) {
  if(req.headers.upgrade
       ?.split(",")
       ?.map(s => s.trim())
       ?.includes('websocket')) {
    req.ws = () => {
      return new Promise((resolve) => {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), ws => {
          wss.emit('connection', ws, req);
          resolve(ws);
        });
      });
    };
  }
  
  next();
}
