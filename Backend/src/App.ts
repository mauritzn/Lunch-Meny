import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as bearerToken from "express-bearer-token";
import allEndpoints from "./endpoints/core";
import MAIN_CONFIG from "./config/Main";
import { ExpressRequest, ExpressResponse } from "./config/Interfaces";

class App {
  public express: any;
  public router: any;
  readonly port: number;
  readonly baseUrl: string;

  constructor() {
    this.express = express();
    this.router = express.Router();
    this.port = (process.env.PORT ? parseInt(process.env.PORT) : MAIN_CONFIG.port);
    this.baseUrl = MAIN_CONFIG.baseUrl;

    (this.express).use(helmet());
    (this.express).use(express.static("public"));
    //(this.express).use(bodyParser.urlencoded({ limit: "5mb", extended: false })); // parse application/x-www-form-urlencoded
    (this.express).use(bodyParser.text({ type: "application/json" })); // parse application/json
    //(this.express).use(bodyParser.json());
    (this.express).use(bearerToken()); // parse Authorization: Bearer <token>

    (this.express).use(cors({
      origin: "*",
      methods: MAIN_CONFIG.allowedEndpointMethodsBase,
      allowedHeaders: ["X-Requested-With", "Content-Type", "Access-Control-Allow-Headers", "Authorization"],
      credentials: true
    }));
    (this.express).options("*", cors()); // enable pre-flight across-the-board

    this.mountRoutes();
  }

  private mountRoutes(): void {
    for(const endpointMethod in allEndpoints) {
      if(MAIN_CONFIG.allowedEndpointMethods.indexOf(endpointMethod) >= 0) {
        const endpoints = allEndpoints[endpointMethod];

        for(const endpoint of endpoints) {
          let middleware = function(req: ExpressRequest, res: ExpressResponse, next: any) { next(); };
          if(endpoint.middleware) {
            middleware = endpoint.middleware;
          }

          (this.router)[endpointMethod.toLowerCase()](endpoint.path, middleware, (req: ExpressRequest, res: ExpressResponse) => {
            endpoint.method(req, res);
          });
        }
      }
    }

    (this.express).use(this.baseUrl, this.router);
  }
}

export default new App();