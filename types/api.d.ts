
/////////////////////////
//       Commons       //
/////////////////////////

export interface ErrorResponse {
  _error: {
    code: number;
    message: string;
    stack?: string;
  };
}

export interface InitialData {
  _csrf: string;
  _config: Config;
}

export interface Config {

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
