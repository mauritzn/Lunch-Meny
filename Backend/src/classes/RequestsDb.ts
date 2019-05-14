import * as Datastore from "nedb";
import MAIN_CONFIG from "../config/Main";

export default new Datastore({ // used for logging requests
  filename: `${MAIN_CONFIG.dbFolder}/requests.db`,
  autoload: true
});