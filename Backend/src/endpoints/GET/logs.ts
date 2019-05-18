import Endpoint from "../../classes/Endpoint";
import { Functions as Funcs } from "../../classes/Functions";
import requestsDb from "../../classes/RequestsDb";
import apiKeychain from "../../classes/ApiKeychain";

export default new Endpoint({
  path: "/logs",
  method: (req, res) => {
    const token = Funcs.cleanString(req.token);

    if(token.length > 0) {
      if(apiKeychain.verify(token)) {
        Funcs.sendJSON(res, {
          status: 200,
          message: `success!`
        });
      } else {
        Funcs.sendJSON(res, {
          status: 403,
          message: `Invalid API Key!`
        });
      }
    } else {
      Funcs.sendJSON(res, {
        status: 400,
        message: `An API Key is required!`
      });
    }
  }
});