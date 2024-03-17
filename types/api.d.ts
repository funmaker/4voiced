import { Board } from "./4chan";
import { string } from "prop-types";
import { listenerCounts } from "../server/controllers/dispatch";

/////////////////////////
//       Commons       //
/////////////////////////

export interface ErrorResponse {
  status: number;
  message: string;
  stack?: string;
}

export interface InitialData {
  _config: Config;
  _error?: ErrorResponse;
}

export interface Config {
  csrf: string;
  boards: Board[];
}


/////////////////////////
//        Pages        //
/////////////////////////

export interface IndexPageResponse {

}


/////////////////////////
//         API         //
/////////////////////////

export interface ListBoardsResult {
  boards: Board[];
}

export type GetBoardResult = Board;

export interface GetBoardParams {
  board?: string;
  thread?: string;
}

export interface BoardStats {
  board: string;
  fetching: boolean;
  listeners: number;
  nextFetch: number | null;
  lastPostNo: number | null;
}

export interface BoardsStats {
  statusListeners: number;
  allListeners: number;
  boards: BoardStats[];
}
