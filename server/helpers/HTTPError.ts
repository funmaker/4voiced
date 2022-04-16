import * as http from 'http';

export default class HTTPError extends Error {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  constructor(public HTTPcode: number,
              public publicMessage: string | undefined = http.STATUS_CODES[HTTPcode],
              message = publicMessage) {
    super(message);
    Error.captureStackTrace(this, HTTPError);
  }
}
