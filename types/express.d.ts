
// Promise Websocket Fix
//
// declare module 'express-promise-router' {
//   import { RouterOptions } from 'express';
//   import { Router } from 'express-ws';
//
//   function PromiseRouter(options?: RouterOptions): Router;
//
//   export default PromiseRouter;
// }

import * as core from "express-serve-static-core";
import { User } from "./api";

declare module "express-serve-static-core" {
  export interface RequestEx<P, ResBody, ReqData> extends core.Request<P, ResBody, any, any, any> {
    body: ReqData;
    user?: User | null;
  }
  
  export interface ResponseEx<ResBody> extends core.Response<ResBody, any, any> {
    react: (initialData: ResBody) => void;
  }
  
  export interface RequestHandlerEx<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqData = any,
  > {
    (
      req: RequestEx<P, ResBody, ReqData>,
      res: ResponseEx<ResBody>,
      next: core.NextFunction,
    ): void;
  }
  
  export interface ErrorRequestHandlerEx<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqData = any,
  > {
    (
      err: any,
      req: RequestEx<P, ResBody, ReqData>,
      res: ResponseEx<ResBody>,
      next: core.NextFunction,
    ): void;
  }
  
  export interface IRouterMatcher<T> {
    <P, ResBody, ReqData = never>(handler: ErrorRequestHandlerEx<P, ResBody, ReqData>): T;
    <P, ResBody, ReqData = never>(...middlewares: Array<RequestHandlerEx<P, ResBody, ReqData>>): T;
    <P, ResBody, ReqData = never>(p: string, ...middlewares: Array<RequestHandlerEx<P, ResBody, ReqData>>): T;
    <P, ResBody, ReqData = never>(p: string[], ...middlewares: Array<RequestHandlerEx<P, ResBody, ReqData>>): T;
  }
}

declare module 'express-session' {
  interface SessionData {
  
  }
}
