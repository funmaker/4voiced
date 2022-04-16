import http from "http";
import PromiseRouter from "express-promise-router";
import expressCore from "express-serve-static-core";
import HTTPError from "../helpers/HTTPError";
import { ErrorResponse } from "../../types/api";

export const router = PromiseRouter();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=0, no-store');
  
  next();
});


// API Routes go here


router.use((req, res, next) => {
  next(new HTTPError(404));
});

router.use((err: Partial<HTTPError>, req: expressCore.Request, ogRes: expressCore.Response, _next: expressCore.NextFunction) => {
  const res = ogRes as expressCore.ResponseEx<ErrorResponse>;
  if(err.HTTPcode !== 404) console.error(err);
  
  const code = err.HTTPcode || 500;
  const result = {
    _error: {
      code,
      message: err.publicMessage || http.STATUS_CODES[code] || "Something Happened",
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };
  res.status(code).json(result);
});
