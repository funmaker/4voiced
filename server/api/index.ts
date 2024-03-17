import http from "http";
import PromiseRouter from "express-promise-router";
import expressCore from "express-serve-static-core";
import HTTPError from "../helpers/HTTPError";
import { ErrorResponse } from "../../types/api";
import * as boards from "./boards";
import * as proxy from "./proxy";

export const router = PromiseRouter();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=0, no-store');
  
  next();
});


router.use("/boards", boards.router);
router.use("/proxy", proxy.router);


router.use((req, res, next) => {
  next(new HTTPError(404, "Route not found"));
});

router.use((err: Partial<HTTPError>, req: expressCore.RequestEx<any, any, any>, res: expressCore.ResponseEx<ErrorResponse>, _next: expressCore.NextFunction) => {
  if(err.message !== "Route not found") console.error(err);
  
  const knownError = err instanceof HTTPError;
  const headers = knownError && err.headers || {};
  const status = knownError && err.status || 500;
  const result: ErrorResponse = {
    status,
    message: knownError && err.message || http.STATUS_CODES[status] || "Something Happened",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  res.set(headers).status(status).json(result);
});
