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


class App {
  public express: any;
  public router: any;
  public port: number;
  private lastCacheUpdate: string = ""; // date
  private cacheDb: Nedb;

  constructor() {
    this.express = express();
    this.router = express.Router();
    this.port = (process.env.PORT ? parseInt(process.env.PORT) : MAIN_CONFIG.port);
    moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);

    (this.express).use(helmet());
    (this.express).use(express.static("public"));
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
    this.checkCache();

    setInterval(() => {
      this.checkCache();
    }, (1 * (60 * 1000))); // 1 minute
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

    (this.express).use(MAIN_CONFIG.baseurl, this.router);
  }


  private checkCache(): void {
    const currentDate = moment().format("DD.MM.YYYY");

    if(this.lastCacheUpdate !== currentDate) {
      console.log(`Cache updating (${currentDate})...`);
      Parser.parse().then((data) => {
        this.lastCacheUpdate = currentDate;
        this.updateCache(data);
      }).catch((err) => {
        console.warn(err);
      });
    } else {
      console.log(`Cache is up-to-date`);
    }
  }

  private updateCache(data: ParseResult): void {
    // TODO: update cache content if data has changed
    this.cacheDb.findOne({ date: data.date }, (findErr, found) => {
      if(findErr) throw findErr;

      if(!found) {
        this.cacheDb.insert(data, (insertErr) => {
          if(insertErr) throw insertErr;
          console.log(`Added ${data.date} to cache!`);
        });
      } else {
        console.log(`Cache already exists for date: ${data.date}!`);
      }
    });


    /* this.cacheDb.remove({}, { multi: true }, (removeErr) => {
      if(removeErr) throw removeErr;

      this.cacheDb.insert(restaurants, (insertErr) => {
        if(insertErr) throw insertErr;
        console.log(`Updated cache, ${restaurants.length} restaurant(s) are now cached!`);
        this.cacheDb.persistence.compactDatafile();
      });
    }); */

    /* const ids = restaurants.map((restaurant) => restaurant.id);

    this.cacheDb.find({
      id: {
        $in: ids
      }
    }).exec((findErr, found) => {
      if(findErr) throw findErr;

      const foundIds = found.map((item: any) => item.id);
      const idsToAdd = ids.filter((id) => {
        return (foundIds.indexOf(id) < 0 ? true : false);
      });
      const idsToUpdate = ids.filter((id) => {
        return (foundIds.indexOf(id) >= 0 ? true : false);
      });

      const restaurantsToAdd = restaurants.filter((restaurant) => {
        return (idsToAdd.indexOf(restaurant.id) >= 0 ? true : false);
      });
      const restaurantsToUpdate = restaurants.filter((restaurant) => {
        return (idsToUpdate.indexOf(restaurant.id) >= 0 ? true : false);
      });

      this.cacheDb.remove({}, (removeErr) => {
        if(removeErr) throw removeErr;
      });
      this.cacheDb.insert(restaurantsToAdd, (insertErr) => {
        if(insertErr) throw insertErr;
        console.log(`Added ${restaurantsToAdd.length} restaurant(s)!`);
      });
    }); */
  }
}

export default new App();