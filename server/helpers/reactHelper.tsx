import React from "react";
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from "react-router";
import expressCore from "express-serve-static-core";
import App from "../../client/App";
import { InitialData } from "../../types/api";
import index from '../views/index.handlebars';
import HTTPError from "./HTTPError";

const removeTags = /[<>]/g;
const tagsToReplace: Record<string, string> = {
  '<': `\\u003C`, // eslint-disable-line @typescript-eslint/naming-convention
  '>': `\\u003E`, // eslint-disable-line @typescript-eslint/naming-convention
};

export function reactMiddleware(req: expressCore.Request, ogRes: expressCore.Response, next: expressCore.NextFunction) {
  const res = ogRes as expressCore.ResponseEx<any>;
  
  res.react = <Data, >(data: Data) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    
    // noinspection JSUnreachableSwitchBranches
    switch(req.accepts(['html', 'json'])) {
      case "html": {
        (async () => {
          const initialData: InitialData & Data = {
            ...data,
            _csrf: req.csrfToken ? req.csrfToken() : undefined as any,
          };
          
          const initialDataJSON = JSON.stringify(initialData).replace(removeTags, tag => tagsToReplace[tag] || tag);
          
          res.send(index({
            reactContent: ReactDOMServer.renderToString(
              <StaticRouter location={req.originalUrl} context={{}}>
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
