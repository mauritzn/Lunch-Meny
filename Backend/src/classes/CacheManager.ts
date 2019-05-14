import * as Datastore from "nedb";
import * as cronParser from "cron-parser";
import * as moment from "moment-timezone";
import MAIN_CONFIG from "../config/Main";
import { Parser, ParseResult } from "../classes/Parser";
import { Functions as Funcs } from "../classes/Functions";

export default class CacheManager {
  private cacheDb: Nedb;
  private cacheInterval: any;
  private cronString: string;
  private timezone: string;
  private initCheckDone: boolean = false;

  constructor(cronString: string, timezone: string = MAIN_CONFIG.defaultTimezone) {
    this.cronString = Funcs.cleanString(cronString);
    this.timezone = Funcs.cleanString(timezone);
    moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);

    this.cacheDb = new Datastore({
      filename: MAIN_CONFIG.cacheFile,
      autoload: true
    });

    this.cacheInterval = cronParser.parseExpression(this.cronString, {
      tz: this.timezone
    });

    this.checkCache();
    setInterval(() => {
      this.checkCache();
    }, (1 * (60 * 1000))); // 1 minute
  }

  private checkCache(): void {
    const currentMoment = moment();
    const currentTimestamp = currentMoment.unix();
    const nextCacheTimestamp = Funcs.msToSecs(this.cacheInterval._currentDate.getTime());

    if(currentTimestamp > nextCacheTimestamp || this.initCheckDone === false) {
      console.log(`\nChecking cache (${currentMoment.format("HH:mm:ss DD.MM.YYYY")})...`);
      if(this.initCheckDone === false) {
        this.initCheckDone = true;
      }

      Parser.parse().then((data) => {
        this.cacheInterval.next();
        this.updateCache(data);
      }).catch((err) => {
        console.warn(err);
      });
    } else {
      console.log(`Next cache check date is: "${this.cacheInterval._currentDate.toString()}"`);
    }
  }

  private updateCache(data: ParseResult): void {
    this.cacheDb.findOne({ date: data.date }, { _id: 0, __v: 0 }, (findErr, found) => {
      if(findErr) throw findErr;

      if(!found) {
        this.cacheDb.insert(data, (insertErr) => {
          if(insertErr) throw insertErr;
          console.log(`Added ${data.date} to cache!`);
        });
      } else {
        let cacheMismatch = false;
        try { // used to prevent uncaught error throws from JSON.stringify (if object is invalid)
          const newHash = Funcs.hash(JSON.stringify(data), "md5");
          const currentHash = Funcs.hash(JSON.stringify(found), "md5");

          if(newHash !== currentHash) {
            cacheMismatch = true;
          }
        } catch(err) {
          console.warn(err);
        }

        if(cacheMismatch) {
          this.cacheDb.update({ date: data.date }, {
            $set: data
          }, { multi: false }, (updateErr) => {
            if(updateErr) {
              console.warn(updateErr);
              console.log(`Failed to update existing cache for date: ${data.date}!`);
            } else {
              console.log(`Updated existing cache for date: ${data.date}!`);
              this.cacheDb.persistence.compactDatafile();
            }
          });
        } else {
          console.log(`Existing cache already up-to-date (${data.date})!`);
        }
      }
    });
  }
}