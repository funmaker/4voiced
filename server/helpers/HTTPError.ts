import http from "http";

export default class HTTPError extends Error {
  public headers: Record<string, string | number> = {};
  
  constructor(public status: number,
              public publicMessage: string | undefined = http.STATUS_CODES[status],
              message = publicMessage) {
    super(message);
    Error.captureStackTrace(this, HTTPError);
  }
  
  header(header: string, value: string | number) {
    this.headers[header] = value;
    return this;
  }
}
