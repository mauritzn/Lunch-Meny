import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";

import "../node_modules/normalize.css/normalize.css";
import "@/css/app.scss";

Vue.config.productionTip = false;
Vue.filter("translateDay", (value: string) => {
  switch(value.toLowerCase()) {
    case "monday":
      return "måndag";
    case "tuesday":
      return "tisdag";
    case "wednesday":
      return "onsdag";
    case "thursday":
      return "torsdag";
    case "friday":
      return "fredag";
    case "saturday":
      return "lördag";
    case "sunday":
      return "söndag";
    default:
      return value;
  }
});

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");