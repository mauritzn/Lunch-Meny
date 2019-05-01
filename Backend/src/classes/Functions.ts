import * as crypto from "crypto";
import { ExpressResponse } from "../config/Interfaces";

const supportedHashAlgos: string[] = ["RSA-MD4", "RSA-MD5", "RSA-MDC2", "RSA-RIPEMD160", "RSA-SHA1", "RSA-SHA1-2", "RSA-SHA224", "RSA-SHA256", "RSA-SHA384", "RSA-SHA512", "blake2b512", "blake2s256", "md4", "md4WithRSAEncryption", "md5", "md5-sha1", "md5WithRSAEncryption", "mdc2", "mdc2WithRSA", "ripemd", "ripemd160", "ripemd160WithRSA", "rmd160", "sha1", "sha1WithRSAEncryption", "sha224", "sha224WithRSAEncryption", "sha256", "sha256WithRSAEncryption", "sha384", "sha384WithRSAEncryption", "sha512", "sha512WithRSAEncryption", "ssl3-md5", "ssl3-sha1", "whirlpool"];

export class Functions {
  static logCallback(err: any) {
    if(err) console.warn(err);
  }

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


  static hash(toHash: string, hashAlgo: string = "sha256") {
    if((supportedHashAlgos).indexOf(hashAlgo) < 0) {
      hashAlgo = "sha256";
    }

    const cryptoHash = crypto.createHash(hashAlgo);
    return cryptoHash.update(toHash, "utf8").digest("hex");
  }
}