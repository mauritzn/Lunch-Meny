import * as Datastore from "nedb";
import { UAParser } from "ua-parser-js";
import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import MAIN_CONFIG from "../../config/Main";

const cacheDb = new Datastore({
  filename: MAIN_CONFIG.cacheFile
});

export default new Endpoint({
  path: "/:date",
  method: (req, res) => {
    if(req.params && Funcs.existsAndNotEmpty(req.params.date)) {
      const date = Funcs.cleanString(req.params.date).replace(/[^.0-9]/gi, ""); // remove whitespace and remove everything that is not a number or a dot

      if(new RegExp("^[0-9]{2}[.][0-9]{2}[.][0-9]{4}$", "i").test(date)) {
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
            cacheDb.findOne({ date: date }, { _id: 0, __v: 0 }, (findErr, found: any) => {
              if(findErr) {
                Funcs.sendJSON(res, {
                  status: 500,
                  message: `Kunde inte hämta cache för datumet! Vänligen försök igen senare`
                });
              } else {
                if(found) {
                  if(plainMode) {
                    found.restaurants = found.restaurants.map((restaurant: any) => {
                      restaurant.info = Funcs.htmlToPlaintext(restaurant.info);
                      restaurant.menu = Funcs.htmlToPlaintext(restaurant.menu);
                      return restaurant;
                    });
                  }

                  Funcs.sendJSON(res, {
                    status: 200,
                    message: `Success!`,
                    cache: found
                  });
                  requestsDb.insert({
                    endpoint: req.route.path,
                    message: `Client successfully grabbed a copy of cached data for specific date`,
                    lunchDate: date,
                    client: uaParser.getResult(),
                    time: new Date()
                  }, Funcs.logCallback);
                } else {
                  Funcs.sendJSON(res, {
                    status: 404,
                    message: `Ingen lunch information kunde hittas för datumet: ${date}`
                  });
                }
              }
            });
          }
        });
      } else {
        Funcs.sendJSON(res, {
          status: 400,
          message: `Angivna datum är ogiltigt! Datum måste följa formatet: 'DD.MM.YYYY'!`
        });
      }
    } else {
      Funcs.sendJSON(res, {
        status: 400,
        message: `Ett datum krävs!`
      });
    }
  }
});