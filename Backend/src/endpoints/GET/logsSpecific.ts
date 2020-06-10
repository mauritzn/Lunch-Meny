import * as moment from "moment-timezone";
import Endpoint from "../../classes/Endpoint";
import MAIN_CONFIG from "../../config/Main";
import { Functions as Funcs } from "../../classes/Functions";
import requestsDb from "../../classes/RequestsDb";
import apiKeychain from "../../classes/ApiKeychain";

moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);
moment.locale("sv");

export default new Endpoint({
  path: "/logs/:date",
  method: (req, res) => {
    if (req.params && Funcs.existsAndNotEmpty(req.params.date)) {
      const date = Funcs.cleanString(req.params.date).replace(/[^.0-9]/gi, ""); // remove whitespace and remove everything that is not a number or a dot
      const token = Funcs.cleanString(req.token);

      if (token.length > 0) {
        if (apiKeychain.verify(token)) {
          if (new RegExp("^[0-9]{2}[.][0-9]{2}[.][0-9]{4}$", "i").test(date)) {
            let momentStartDate = moment(date, "DD.MM.YYYY");
            let momentEndDate = moment(date, "DD.MM.YYYY").add(1, "day");

            requestsDb.find({
              time: {
                $gte: new Date(momentStartDate.valueOf()),
                $lt: new Date(momentEndDate.valueOf()),
              },
            }, { _id: 0, __v: 0 }).sort({ time: 1 }).exec(
              (findErr, foundRequests) => {
                if (findErr) {
                  console.warn(findErr);
                  Funcs.sendJSON(res, {
                    status: 500,
                    message: `Kunde inte läsa log DB!`,
                  });
                } else {
                  Funcs.sendJSON(res, {
                    status: 200,
                    message: `Success!`,
                    request_count: foundRequests.length,
                    requests: foundRequests,
                  });
                }
              },
            );
          } else {
            Funcs.sendJSON(res, {
              status: 400,
              message:
                `Angivna datum är ogiltigt! Datum måste följa formatet: 'DD.MM.YYYY'!`,
            });
          }
        } else {
          Funcs.sendJSON(res, {
            status: 403,
            message: `Ogiltig API nyckel!`,
          });
        }
      } else {
        Funcs.sendJSON(res, {
          status: 400,
          message: `En API nyckel krävs!`,
        });
      }
    } else {
      Funcs.sendJSON(res, {
        status: 400,
        message: `Ett datum krävs!`,
      });
    }
  },
});
