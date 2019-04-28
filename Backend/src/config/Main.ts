import { path as appRoot } from "app-root-path";

class Main {
  readonly allowedEndpointMethodsBase = ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]; // add OPTIONS method?
  readonly allowedEndpointMethods: string[];
  readonly port = 3025;
  readonly baseurl: string = `/`; // use '/' for root url
  readonly defaultTimezone = "Europe/Helsinki";
  readonly cacheFile = `${appRoot}/dbs/cache.db`;

  constructor() {
    this.allowedEndpointMethods = (this.allowedEndpointMethodsBase).slice(0);
    this.allowedEndpointMethods.push("ALL");
  }
}

export default new Main();