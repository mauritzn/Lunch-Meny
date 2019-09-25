import * as cheerio from "cheerio";
import * as moment from "moment-timezone";
import * as iconv from "iconv-lite";
import * as Jimp from "jimp";
import axios from "axios";
import Autolinker from "autolinker";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import MAIN_CONFIG from "../config/Main";
import { Functions as Funcs } from "./Functions";

moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);
moment.locale("sv");

const allowedDays: string[] = ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"];
const dayKeys: string[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export interface Restaurant {
  id: number; // 9001
  image: string; // ""
  website: string; // https://studnet.gymnasium.ax/matsedel
  name: string; // "Seaside"
  info: string; // ""
  address: string; // "Neptunigatan 6"
  phone: string; // ""
  menu: string;
}

export class SeasideParser {
  static fetchRawData() {
    return new Promise((resolve: (value: { charset: string, value: Buffer }) => void, reject) => {
      axios({
        method: "get",
        url: `https://studnet.gymnasium.ax/matsedel`,
        responseType: "arraybuffer"
      }).then((res) => {
        let charset = "utf8";
        const found = res.headers["content-type"].match(/charset=([^ ]+)/i);
        if(found && found.length > 1) {
          charset = found[1].trim();
        }

        if(res.data && res.data.length > 0) {
          resolve({
            charset: charset,
            value: res.data
          });
        } else {
          resolve({
            charset: charset,
            value: new Buffer("")
          });
        }
      }).catch((err) => {
        console.warn(err);
        reject(new Error("Failed to fetch data!"));
      });
    });
  }

  static parse(weekNumber: number, day: string) {
    function formatHtml(html: string): string { // function to fix aland.com oddities
      html = html.replace(new RegExp("<([/]?)b>", "gi"), "<$1strong>"); // convert old b tag to new strong tag
      html = html.replace(new RegExp("<([/]?)i>", "gi"), "<$1em>"); // convert old i tag to new em tag
      html = html.replace(new RegExp("[ ]*<span><[/]span>", "gi"), ""); // remove odd empty spans
      html = html.replace(new RegExp("[€]", "gi"), "€"); // fix oddly encoded euro signs

      html = html.replace(new RegExp("[(](.*?)[)]", "gi"), "<em>($1)</em>"); // make all text inside parentheses italic
      return html;
    }

    return new Promise((resolve: (value: Restaurant) => void, reject) => {
      const currentDayKey = allowedDays.indexOf(day);
      if(currentDayKey >= 0) {
        const phoneUtil = new PhoneNumberUtil();

        SeasideParser.fetchRawData().then((data) => {
          const converted = iconv.decode(data.value, data.charset); // convert aland.com's old ISO-8859-1 charset to UTF
          const $ = cheerio.load(converted, { decodeEntities: false });

          let restaurant: Restaurant = {
            id: 9001,
            image: "https://cdn.mauritzonline.com/lunch/alands_yrkesgymnasium_dark.png",
            website: "https://studnet.gymnasium.ax/matsedel",
            name: "Seaside",
            info: `<p>Studerande vid Högskolan på Åland kommer att erbjudas lunch i restaurang Seaside på Neptunigatan 6 <em>(Sjöfartsgymnasiet)</em>. I lunchen ingår förutom varmrätt också sallad, bröd, smör och måltidsdryck.</p>`,
            address: "Neptunigatan 6, 22100 Mariehamn",
            phone: "",
            menu: ""
          };

          let menuContent = $(`div[about="/content/${weekNumber}"]`)
          if(menuContent.length > 0) {
            const fieldName = `field-name-field-meal-${dayKeys[currentDayKey]}`;
            let normalMenu = $(menuContent).find(`section.${fieldName}`);
            let vegetarianMenu = $(menuContent).find(`section.${fieldName}-veg`);

            restaurant.menu += `<ul>`;
            if(normalMenu.length > 0) {
              restaurant.menu += `<li>${$(normalMenu).find(".field-item").text().trim()}</li>`;
            }
            if(vegetarianMenu.length > 0) {
              restaurant.menu += `<li><strong>Vegetariskt:</strong> ${$(vegetarianMenu).find(".field-item").text().trim()}</li>`;
            }
            restaurant.menu += `</ul>`;
          } else {
            reject(new Error("No menu found for this week!"));
          }

          if(restaurant.info) {
            restaurant.info = formatHtml(restaurant.info);
            restaurant.info = Autolinker.link(restaurant.info); // find links/emails/etc.
          }
          if(restaurant.phone) { // if a phone number exists convert it to a consistent local format
            const number = phoneUtil.parseAndKeepRawInput(restaurant.phone, "FI");
            restaurant.phone = phoneUtil.format(number, PhoneNumberFormat.NATIONAL);
          }

          if(restaurant.image) {
            Jimp.read(restaurant.image).then((image) => {
              image.write(`${MAIN_CONFIG.imageFolder}/${restaurant.id}.png`);
              restaurant.image = `${MAIN_CONFIG.apiUrl}/images/${restaurant.id}.png`;
              resolve(restaurant);
            }).catch((err) => {
              console.warn(err);
              resolve(restaurant);
            });
          } else {
            resolve(restaurant);
          }
        }).catch((err) => {
          reject(err);
        });
      } else {
        reject(new Error("Invalid day given!"));
      }
    });
  }
}