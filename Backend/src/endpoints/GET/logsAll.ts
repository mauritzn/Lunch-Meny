import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import requestsDb from "../../classes/RequestsDb";
import apiKeychain from "../../classes/ApiKeychain";

export default new Endpoint({
  path: "/logs",
  method: (req, res) => {
    const token = Funcs.cleanString(req.token);

    if (token.length > 0) {
      if (apiKeychain.verify(token)) {
        requestsDb.find({}, { _id: 0, __v: 0 }).sort({ time: 1 }).exec(
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
  },
});
