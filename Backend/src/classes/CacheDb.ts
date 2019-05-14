import * as Datastore from "nedb";
import MAIN_CONFIG from "../config/Main";

export default new Datastore({
  filename: `${MAIN_CONFIG.dbFolder}/cache.db`,
  autoload: true
});