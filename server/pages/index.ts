import PromiseRouter from "express-promise-router";
import { IndexPageResponse } from "../../types/api";
import * as boardsController from "../controllers/boards";

export const router = PromiseRouter();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=0, no-store');
  
  next();
});

router.get<never, IndexPageResponse, never>(['/', "/board/:board"], async (req, res) => {
  const boards = [...boardsController.boards.values()].map(board => board.info);
  
  res.react({ boards });
});

