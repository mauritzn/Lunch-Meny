import { ExpressRequest, ExpressResponse } from "../config/Interfaces";

type Middleware = (req: ExpressRequest, res: ExpressResponse, next: any) => void;
type Method = (req: ExpressRequest, res: ExpressResponse) => void;

interface EndpointOptions {
  path: string;
  middleware?: Middleware;
  method: Method;
}


class Endpoint {
  readonly path: string;
  readonly middleware: Middleware | null;
  readonly method: Method;

  constructor(options: EndpointOptions) {
    this.path = options.path || "";
    this.middleware = options.middleware || null;
    this.method = options.method;

    // make sure path starts with "/"
    if(!(new RegExp("^/").test(this.path))) {
      this.path = `/${this.path}`;
    }
  }
}

export default Endpoint;