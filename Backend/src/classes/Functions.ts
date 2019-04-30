import { ExpressResponse } from "../config/Interfaces";

export class Functions {
  static sendJSON(res: ExpressResponse, objectToSend: any): void {
    try {
      const jsonToSend = JSON.stringify(objectToSend);
      res.writeHead(objectToSend.status, { "Content-Type": "application/json" });
      res.write(jsonToSend);
      res.end();
    } catch(err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.write(JSON.stringify({
        status: 500,
        message: `Failed to send JSON response! Please try again later!`
      }));
      res.end();
    }
  }

  static parseNumber(toParse: any): number {
    if(typeof toParse === "number") {
      return toParse;
    } else if(typeof toParse === "string") {
      if(new RegExp("[^0-9]").test(toParse) !== true) {
        return parseInt(toParse);
      } else {
        return NaN;
      }
    } else {
      return NaN;
    }
  }

  static isNumber(toTest: any): boolean {
    if(!isNaN(this.parseNumber(toTest))) {
      return true;
    } else {
      return false;
    }
  }


  static capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  static cleanString(text: string): string { // trim string and check that it exists
    return (text ? text.trim() : "");
  }

  static existsAndNotEmpty(toCheck: any): boolean {
    if(toCheck) {
      if(typeof toCheck === "string") {
        if(this.cleanString(toCheck).length > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}