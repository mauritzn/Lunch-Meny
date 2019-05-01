export interface ExpressRequest extends Request {
  body: any;
  headers: any;
  [key: string]: any;
}

export interface ExpressResponse extends Response {
  [key: string]: any;
}


export interface ErrorResponse {
  status: number,
  message: string,
  error?: string,
  [index: string]: any
}