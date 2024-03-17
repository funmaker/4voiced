import PromiseRouter from "express-promise-router";
import { ListBoardsResult, GetBoardResult, GetBoardParams } from "../../types/api";
import * as boardsController from "../controllers/boards";
import * as dispatchController from "../controllers/dispatch";
import HTTPError from "../helpers/HTTPError";

export const router = PromiseRouter();

router.get("/status", async (req, res, next) => {
  if(req.ws) {
    console.log("WS connection from: " + req.ip);
    const ws = await req.ws();
    
    dispatchController.addListener(ws, null, null, true);
  } else next();
});

router.get<GetBoardParams, GetBoardResult, never>("/:board?/:thread?", async (req, res, next) => {
  if(req.ws) {
    console.log("WS connection from: " + req.ip);
    const ws = await req.ws();
    
    if(req.params.board !== undefined && !boardsController.boards.has(req.params.board)) throw new HTTPError(404, "Board not found");
    if(req.params.thread !== undefined && isNaN(parseInt(req.params.thread))) throw new HTTPError(404, "Thread not found");
    
    dispatchController.addListener(ws, req.params.board, req.params.thread !== undefined ? parseInt(req.params.thread) : undefined);
  } else next();
});

router.get<JustBoard, GetBoardResult, never>("/:board", async (req, res) => {
  const board = boardsController.boards.get(req.params.board);
  if(!board) throw new HTTPError(404, "Board not found");
  
  res.json(board.info);
});

router.get<never, ListBoardsResult, never>("/", async (req, res) => {
  const boards = [...boardsController.boards.values()].map(board => board.info);
  
  res.json({ boards });
});
