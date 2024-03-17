import * as http from "http";
import express from "express";
import expressCore from "express-serve-static-core";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import { ErrorResponse } from "../types/api";
import reactMiddleware from "./middlewares/reactMiddleware";
import wsMiddleware from "./middlewares/wsMiddleware";
import HTTPError from "./helpers/HTTPError";
import { router as apiRouter } from "./api";
import { router as pagesRouter } from "./pages";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(compression());
app.use('/static', express.static('static'));
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(require('./middlewares/webpackMiddleware').mount());
}

app.use(wsMiddleware);
app.use(reactMiddleware);

app.use('/api', apiRouter);
app.use('/', pagesRouter);

app.use((req, res, next) => {
  next(new HTTPError(404, "Route not found"));
});

app.use((err: Partial<HTTPError>, req: expressCore.RequestEx<any, any, any>, res: expressCore.ResponseEx<ErrorResponse>, _next: expressCore.NextFunction) => {
  if((err as any).code === 'EBADCSRFTOKEN') err = new HTTPError(401, "Bad CSRF token");
  if(err.message !== "Route not found") console.error(err);
  
  const knownError = err instanceof HTTPError;
  const headers = knownError && err.headers || {};
  const status = knownError && err.status || 500;
  const error: ErrorResponse = {
    status,
    message: knownError && err.message || http.STATUS_CODES[status] || "Something Happened",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  if("react" in (res as any)) res.set(headers).status(status).react({}, error);
  else res.set(headers).status(status).json(error);
});

export default app;
