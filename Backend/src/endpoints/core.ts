import * as fs from "fs";
import Endpoint from "../classes/Endpoint";
import { Functions as Funcs } from "../classes/Functions";
import MAIN_CONFIG from "../config/Main";
import Errors from "../config/Errors";

const runningAsTypeScript = new RegExp("[.]ts$").test((require.main ? require.main.filename : ""));
const endpointsFolder = (runningAsTypeScript ? `./src/endpoints` : `./dist/endpoints`);

// inline-based endpoints
let endpoints: any = {
  GET: [],
  POST: [],
  PUT: [],
  PATCH: [],
  DELETE: [],

  ALL: [
    new Endpoint({
      path: "/*",
      method: (req, res) => {
        Funcs.sendJSON(res, Errors.ROUTE_NOT_FOUND);
      }
    })
  ]
};



// load in file-based endpoints
const files = fs.readdirSync(endpointsFolder);
if(files.length > 0) {
  files.map((file) => {
    const stats = fs.statSync(`${endpointsFolder}/${file}`);

    if(stats.isDirectory()) {
      if(MAIN_CONFIG.allowedEndpointMethods.indexOf(file.toUpperCase()) >= 0) {
        const endpointFiles = fs.readdirSync(`${endpointsFolder}/${file}`);
        if(!endpoints.hasOwnProperty(file)) {
          endpoints[file] = []; // just here to make sure it can be added (incase it does not exist)
        }

        if(endpointFiles.length > 0) {
          endpointFiles.map((endpointFile) => {
            const endpoint = require(`../endpoints/${file}/${endpointFile}`);
            //console.log(endpoint.default);
            if(endpoint.default) {
              if(endpoint.default instanceof Endpoint) {
                endpoints[file].push(endpoint.default);
              }
            }
            //console.log(allEndpoints[file]);
          });
        }

      }
    }
  });
}


export default endpoints;