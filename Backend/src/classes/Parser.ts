import * as cheerio from "cheerio";
import * as encoding from "encoding";
import * as moment from "moment-timezone";
import axios from "axios";
import MAIN_CONFIG from "../config/Main";

moment.tz.setDefault(MAIN_CONFIG.defaultTimezone);
moment.locale("sv");


export interface ParseResult {
  day: string;
  weekNumber: number;
  date: string;
  timestamp: number;
  restaurants: Restaurant[];
}

export interface Restaurant {
  id: number;
  image: string | null;
  website: string | null;
  name: string;
  info: string;
  address: string;
  phone: string;
  menu: string;
}

export class Parser {
  static fetchRawData() {
    return new Promise((resolve: (value: { charset: string, value: string }) => void, reject) => {
      axios({
        method: "get",
        url: `https://www.aland.com/lunch/`,
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
            value: ""
          });
        }
      }).catch((err) => {
        console.warn(err);
        reject(new Error("Failed to fetch data!"));
      });
    });
  }

  static parse() {
    return new Promise((resolve: (value: ParseResult) => void, reject) => {
      let defaultMoment = moment();
      let result: ParseResult = {
        day: defaultMoment.format("dddd"),
        weekNumber: defaultMoment.week(),
        date: defaultMoment.format("DD.MM.YYYY"),
        timestamp: defaultMoment.unix(),
        restaurants: []
      };

      Parser.fetchRawData().then((data) => {
        const converted = encoding.convert(data.value, "UTF-8", data.charset);
        const $ = cheerio.load(converted.toString("utf8"));
        const restaurantsHtml = $("#restaurants").html() || "";
        const found = restaurantsHtml.match(new RegExp(`<b>Dagens lunch ([0-9]{1,2}.[0-9]{1,2}.[0-9]{4})<[/]b>`, "im"));
        let currentDate = defaultMoment.format("DD.MM.YYYY");

        if(found && found.length > 1) {
          if(new RegExp("^[0-9]{1,2}.[0-9]{1,2}.[0-9]{4}$", "i").test(found[1].trim())) {
            result.date = found[1].trim();
          }
        }
        let momentDate = moment(result.date, "DD.MM.YYYY");
        result.timestamp = momentDate.unix();
        result.day = momentDate.format("dddd");
        result.weekNumber = momentDate.week();

        $("#restaurants .restaurant").each((i, element) => {
          // get address and phone number
          let headerInfo = $(element).find(".ui-accordion-header .header_right").text() || "";
          headerInfo = headerInfo.replace(/[ ]{2,}/gi, " ");
          const splitInfo = headerInfo.split(", tel. ");

          // get resturant website link
          let website = $(element).find(".ui-accordion-content > a").attr("href") || null;
          if(website) {
            if(!new RegExp("^[a-z]+:[/]{2}", "i").test(website)) { // make sure an HTTP protocol is defined
              website = `http://${website}`;
            }
          }

          // get restaurant image
          const image = $(element).find(".ui-accordion-content .restaurant_info > img").attr("src") || null;
          $(element).find(".ui-accordion-content .restaurant_info > img").remove();

          let restaurant: Restaurant = {
            id: parseInt($(element).attr("id").replace(/[^0-9]/gi, "")),
            image: image,
            website: website,
            name: ($(element).find(".ui-accordion-header .header_left").text() || "").trim(),
            info: ($(element).find(".ui-accordion-content .restaurant_info").html() || "").trim(),
            address: (splitInfo[0] || "").trim(),
            phone: (splitInfo[1] || "").trim(),
            menu: ($(element).find(".ui-accordion-content .restaurant_menu").html() || "").trim()
          };

          restaurant.menu = restaurant.menu.replace(/\n$/i, "");
          result.restaurants.push(restaurant);
        });

        resolve(result);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}