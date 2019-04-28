import Vue from "vue";
import App from "@/App.vue";
import store from "@/store";
import { Parser } from "@/classes/Parser";

import "../node_modules/normalize.css/normalize.css";
import "@/css/app.scss";

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
  mounted() {
    Parser.parse().then((restaurants) => {
      console.log(restaurants);
    });
  }
}).$mount("#app");