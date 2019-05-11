import * as Datastore from "nedb";
import * as moment from "moment-timezone";
import { UAParser } from "ua-parser-js";
import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import MAIN_CONFIG from "../../config/Main";

moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);
moment.locale("sv");

const cacheDb = new Datastore({
  filename: MAIN_CONFIG.cacheFile
});

export default new Endpoint({
  path: "/:date",
  method: (req, res) => {
    if(req.params && Funcs.existsAndNotEmpty(req.params.date)) {
      const date = Funcs.cleanString(req.params.date).replace(/[^.0-9]/gi, ""); // remove whitespace and remove everything that is not a number or a dot

      if(new RegExp("^[0-9]{2}[.][0-9]{2}[.][0-9]{4}$", "i").test(date)) {
        const uaParser = new UAParser(req.headers["user-agent"]);
        const requestsDb = new Datastore({
          filename: MAIN_CONFIG.requestsFile,
          autoload: true
        });

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