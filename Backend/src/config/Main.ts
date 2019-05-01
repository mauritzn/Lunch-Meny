import { path as appRoot } from "app-root-path";

class Main {
  readonly allowedEndpointMethodsBase = ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]; // add OPTIONS method?
  readonly allowedEndpointMethods: string[];
  readonly port = 3025;
  readonly baseUrl: string = `/`; // use '/' for root url
  readonly defaultTimezone = "Europe/Helsinki";

  readonly cacheCheckInterval = 120; //(5 * 3600); // hours * seconds
  readonly cacheFile = `${appRoot}/dbs/cache.db`;
  readonly requestsFile = `${appRoot}/dbs/requests.db`; // used for logging requests

  constructor() {
    this.allowedEndpointMethods = (this.allowedEndpointMethodsBase).slice(0);
    this.allowedEndpointMethods.push("ALL");
  }
}

export default new Main();