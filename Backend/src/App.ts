import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as moment from "moment-timezone";
import * as Datastore from "nedb";
import allEndpoints from "./endpoints/core";
import MAIN_CONFIG from "./config/Main";
import { ExpressRequest, ExpressResponse } from "./config/Interfaces";
import { Parser, ParseResult } from "./classes/Parser";
import { Functions as Funcs } from "./classes/Functions";


class App {
  public express: any;
  public router: any;
  readonly port: number;
  readonly baseUrl: string;
  private lastCacheUpdate: number = -Infinity; // timestamp
  private cacheDb: Nedb;

  constructor() {
    this.express = express();
    this.router = express.Router();
    this.port = (process.env.PORT ? parseInt(process.env.PORT) : MAIN_CONFIG.port);
    this.baseUrl = MAIN_CONFIG.baseUrl;
    moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);

    (this.express).use(helmet());
    //(this.express).use(express.static("public"));
    (this.express).use(bodyParser.urlencoded({ limit: "5mb", extended: false })); // parse application/x-www-form-urlencoded
    (this.express).use(bodyParser.text({ type: "application/json" })); // parse application/json
    //(this.express).use(bodyParser.json());

    (this.express).use(cors({
      origin: "*",
      methods: MAIN_CONFIG.allowedEndpointMethodsBase,
      allowedHeaders: ["X-Requested-With", "Content-Type", "Access-Control-Allow-Headers", "Authorization"],
      credentials: true
      //res.setHeader("Access-Control-Allow-Credentials", true); || credentials: Configures the Access-Control-Allow-Credentials CORS header. Set to true to pass the header, otherwise it is omitted.
    }));
    (this.express).options("*", cors()); // enable pre-flight across-the-board

    this.cacheDb = new Datastore({
      filename: MAIN_CONFIG.cacheFile,
      autoload: true
    });

    this.mountRoutes();
  }


  private mountRoutes(): void {
    //console.log(allEndpoints);

    for(const endpointMethod in allEndpoints) {
      if(MAIN_CONFIG.allowedEndpointMethods.indexOf(endpointMethod) >= 0) {
        const endpoints = allEndpoints[endpointMethod];

        for(const endpoint of endpoints) {
          let middleware = function(req: ExpressRequest, res: ExpressResponse, next: any) { next(); };
          if(endpoint.middleware) {
            middleware = endpoint.middleware;
          }

          //console.log(`${endpointMethod} => ${endpoint.path}`);
          (this.router)[endpointMethod.toLowerCase()](endpoint.path, middleware, (req: ExpressRequest, res: ExpressResponse) => {
            endpoint.method(req, res);
          });
        }
      }
    }

    (this.express).use(this.baseUrl, this.router);
  }


  // runs from server.ts (this makes sure everything else has be run before running cache checks)
  public initCacheChecking(): void {
    this.checkCache();

    setInterval(() => {
      this.checkCache();
    }, (1 * (60 * 1000))); // 1 minute
  }

  private checkCache(): void {
    const currentMoment = moment();
    const currentTimestamp = currentMoment.unix();

    if((this.lastCacheUpdate + MAIN_CONFIG.cacheCheckInterval) <= currentTimestamp) {
      console.log(`\nChecking cache (${currentMoment.format("HH:mm:ss DD.MM.YYYY")})...`);
      Parser.parse().then((data) => {
        this.lastCacheUpdate = currentTimestamp;
        this.updateCache(data);
      }).catch((err) => {
        console.warn(err);
      });
    } else {
      console.log(`Cache is up-to-date`);
    }
  }

  private updateCache(data: ParseResult): void {
    this.cacheDb.findOne({ date: data.date }, { _id: 0, __v: 0 }, (findErr, found) => {
      if(findErr) throw findErr;

      if(!found) {
        this.cacheDb.insert(data, (insertErr) => {
          if(insertErr) throw insertErr;
          console.log(`Added ${data.date} to cache!`);
        });
      } else {
        let cacheMismatch = false;
        try { // used to prevent uncaught error throws from JSON.stringify (if object is invalid)
          const newHash = Funcs.hash(JSON.stringify(data), "md5");
          const currentHash = Funcs.hash(JSON.stringify(found), "md5");

          if(newHash !== currentHash) {
            cacheMismatch = true;
          }
        } catch(err) {
          console.warn(err);
        }

        if(cacheMismatch) {
          this.cacheDb.update({ date: data.date }, {
            $set: data
          }, { multi: false }, (updateErr) => {
            if(updateErr) {
              console.warn(updateErr);
              console.log(`Failed to update existing cache for date: ${data.date}!`);
            } else {
              console.log(`Updated existing cache for date: ${data.date}!`);
              this.cacheDb.persistence.compactDatafile();
            }
          });
        } else {
          console.log(`Existing cache already up-to-date (${data.date})!`);
        }
      }
    });
  }
}

export default new App();