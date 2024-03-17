import PromiseRouter from "express-promise-router";
import * as boardsController from "../controllers/boards";
import HTTPError from "../helpers/HTTPError";
import axios from "axios";

export const router = PromiseRouter();

router.get<{ board: string; file: string }>("/:board/:file", async (req, res) => {
  if(!boardsController.boards.has(req.params.board)) throw new HTTPError(404, "Board not found");
  if(!req.params.file.match(/[0-9]+s\.jpg/)) throw new HTTPError(400, "Bad thumbnail name");
  
  const response = await axios.request({
    url: `https://i.4cdn.org/${req.params.board}/${req.params.file}`,
    method: "GET",
    validateStatus: () => true,
    responseType: "stream",
  });
  
  res.header(response.headers);
  res.status(response.status);
  
  response.data.pipe(res);
});
