import * as Datastore from "nedb";
import { UAParser } from "ua-parser-js";
import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import MAIN_CONFIG from "../../config/Main";
import { Parser, ParseResult } from "../../classes/Parser";

const cacheDb = new Datastore({
  filename: MAIN_CONFIG.cacheFile
});

export default new Endpoint({
  path: "/",
  method: (req, res) => {
    let plainMode = false;
    const uaParser = new UAParser(req.headers["user-agent"]);
    const requestsDb = new Datastore({
      filename: MAIN_CONFIG.requestsFile,
      autoload: true
    });

    if(req.query.plain) {
      if(["1", "true"].indexOf(req.query.plain) >= 0) {
        plainMode = true;
      }
    }

    cacheDb.loadDatabase((loadErr) => {
      if(loadErr) {
        console.warn(loadErr);

        Funcs.sendJSON(res, {
          status: 500,
          message: `Kunde inte ladda in database! Vänligen försök igen senare`
        });
      } else {
        cacheDb.find({}, { _id: 0, __v: 0 }).sort({ timestamp: -1 }).limit(1).exec((findErr, found: any) => {
          if(findErr) {
            Funcs.sendJSON(res, {
              status: 500,
              message: `Kunde inte hämta senast cache! Vänligen försök igen senare`
            });
          } else {
            if(found && found.length > 0) {
              let foundCache: ParseResult = found[0];
              if(plainMode) {
                foundCache.restaurants = foundCache.restaurants.map((restaurant) => {
                  restaurant.info = Funcs.htmlToPlaintext(restaurant.info);
                  restaurant.menu = Funcs.htmlToPlaintext(restaurant.menu);
                  return restaurant;
                });
              }

              Funcs.sendJSON(res, {
                status: 200,
                message: `Success!`,
                cache: foundCache
              });
              requestsDb.insert({
                endpoint: req.route.path,
                message: `Client successfully grabbed a copy of cached data`,
                client: uaParser.getResult(),
                time: new Date()
              }, Funcs.logCallback);
            } else {
              Parser.parse().then((data: ParseResult) => {
                if(plainMode) {
                  data.restaurants = data.restaurants.map((restaurant) => {
                    restaurant.info = Funcs.htmlToPlaintext(restaurant.info);
                    restaurant.menu = Funcs.htmlToPlaintext(restaurant.menu);
                    return restaurant;
                  });
                }

                Funcs.sendJSON(res, {
                  status: 200,
                  message: `Success! Grabbed fresh cache!`,
                  cache: data
                });

                requestsDb.insert({
                  endpoint: req.route.path,
                  message: `No cache found, successfully grabbed fresh data from aland.com`,
                  client: uaParser.getResult(),
                  time: new Date()
                }, Funcs.logCallback);
              }).catch((err) => {
                Funcs.sendJSON(res, {
                  status: 500,
                  message: `Kunde inte hämta data från aland.com! Vänligen försök igen senare`
                });
              });
            }
          }
        });
      }
    });
  }
});