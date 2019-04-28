import * as cheerio from "cheerio";
import * as encoding from "encoding";
import axios from "axios";
import moment from "moment";
moment.locale("sv");

export interface Restaurant {
  id: number;
  image: string | null;
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
    return new Promise((resolve: (value: Restaurant[]) => void, reject) => {
      let restaurants: Restaurant[] = [];

      Parser.fetchRawData().then((data) => {
        const converted = encoding.convert(data.value, "UTF-8", data.charset);
        const $ = cheerio.load(converted.toString("utf8"));

        $("#restaurants .restaurant").each((i, element) => {
          // get address and phone number
          let headerInfo = $(element).find(".ui-accordion-header .header_right").text() || "";
          headerInfo = headerInfo.replace(/[ ]{2,}/gi, " ");
          const splitInfo = headerInfo.split(", tel. ");

          // get restaurant image
          const image = $(element).find(".ui-accordion-content .restaurant_info > img").attr("src") || null;
          $(element).find(".ui-accordion-content .restaurant_info > img").remove();

          let restaurant: Restaurant = {
            id: parseInt($(element).attr("id").replace(/[^0-9]/gi, "")),
            image: image,
            name: ($(element).find(".ui-accordion-header .header_left").text() || "").trim(),
            info: ($(element).find(".ui-accordion-content .restaurant_info").html() || "").trim(),
            address: (splitInfo[0] || "").trim(),
            phone: (splitInfo[1] || "").trim(),
            menu: ($(element).find(".ui-accordion-content .restaurant_menu").html() || "").trim()
          };

          restaurant.menu = restaurant.menu.replace(/\n$/i, "");
          restaurants.push(restaurant);
        });

        resolve(restaurants);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}