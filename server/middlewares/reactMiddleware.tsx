import React from "react";
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from "react-router-dom/server";
import expressCore from "express-serve-static-core";
import App from "../../client/App";
import { ErrorResponse, InitialData } from "../../types/api";
import * as boardsController from "../controllers/boards";
import index from '../views/index.handlebars';
import HTTPError from "../helpers/HTTPError";

const removeTags = /[<>]/g;
const tagsToReplace: Record<string, string> = {
  '<': `\\u003C`,
  '>': `\\u003E`,
};

export default function reactMiddleware(req: expressCore.RequestEx<any, any, any>, res: expressCore.ResponseEx<any>, next: expressCore.NextFunction) {
  res.react = <Data, >(data: Data, error?: ErrorResponse) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    
    // noinspection JSUnreachableSwitchBranches
    switch(req.accepts(['html', 'json'])) {
      case "html": {
        (async () => {
          const initialData: InitialData & Data = {
            ...data,
            _error: error,
            _config: {
              csrf: req.csrfToken ? req.csrfToken() : undefined as any,
              boards: [...boardsController.boards.values()].map(board => board.info),
            },
          };
          
          const initialDataJSON = JSON.stringify(initialData).replace(removeTags, tag => tagsToReplace[tag] || tag);
          
          res.send(index({
            reactContent: ReactDOMServer.renderToString(
              <StaticRouter location={req.originalUrl}>
                <App initialData={initialData} />
              </StaticRouter>,
            ),
            initialData: initialDataJSON,
            production: process.env.NODE_ENV === 'production',
          }));
        })().catch(next);
        break;
      }
      
      case "json":
        res.json(data);
        break;
      
      default:
        throw new HTTPError(406);
    }
    
    return res;
  };
  next();
}
