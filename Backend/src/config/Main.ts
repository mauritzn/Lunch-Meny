import { path as appRoot } from "app-root-path";

class Main {
  readonly allowedEndpointMethodsBase = ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]; // add OPTIONS method?
  readonly allowedEndpointMethods: string[];
  readonly port = 3025;
  readonly baseUrl: string = `/`; // use '/' for root url
  readonly defaultTimezone = "Europe/Helsinki";

  readonly appRoot = appRoot;
  readonly cacheCheckInterval = "30 */5 * * *"; // cron string (at minute 30 past every 5th hour)
  readonly dbFolder = `${appRoot}/dbs`;
  readonly imageFolder = `${appRoot}/public/images`;
  readonly runningAsTypeScript = new RegExp("[.]ts$").test((require.main ? require.main.filename : ""));
  readonly apiUrl = (this.runningAsTypeScript ? `http://127.0.0.1:${this.port}` : `https://mauritz.cloud/lunch-meny`);

  constructor() {
    this.allowedEndpointMethods = (this.allowedEndpointMethodsBase).slice(0);
    this.allowedEndpointMethods.push("ALL");
  }
}

export default new Main();