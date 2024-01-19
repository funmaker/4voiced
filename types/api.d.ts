
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
}


/////////////////////////
//        Pages        //
/////////////////////////

export interface IndexPageResponse {
  kek: string;
}


/////////////////////////
//         API         //
/////////////////////////
