import * as Datastore from "nedb";
import * as moment from "moment-timezone";
import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import MAIN_CONFIG from "../../config/Main";
import { Parser, ParseResult } from "../../classes/Parser";

moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);
moment.locale("sv");

const cacheDb = new Datastore({
  filename: MAIN_CONFIG.cacheFile
});

export default new Endpoint({
  path: "/",
  method: (req, res) => {
    cacheDb.loadDatabase((loadErr) => {
      if(loadErr) {
        console.warn(loadErr);

        Funcs.sendJSON(res, {
          status: 500,
          message: `Kunde inte ladda in database! Vänligen försök igen senare`
        });
      } else {
        const currentTimestamp = moment(moment().format("DD.MM.YYYY"), "DD.MM.YYYY").unix();
        cacheDb.findOne({ timestamp: { $gte: currentTimestamp } }, (findErr, found: any) => {
          if(findErr) {
            Funcs.sendJSON(res, {
              status: 500,
              message: `Kunde inte hämta senast cache! Vänligen försök igen senare`
            });
          } else {
            if(found) {
              delete found._id;
              delete found.__v;

              Funcs.sendJSON(res, {
                status: 200,
                message: `Success!`,
                cache: found
              });
            } else {
              Parser.parse().then((data: ParseResult) => {
                Funcs.sendJSON(res, {
                  status: 200,
                  message: `Success! Grabbed fresh cache!`,
                  cache: data
                });
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