import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);
const favoritesStorageKey = "lunch_favorites";

export default new Vuex.Store({
  state: {
    date: "",
    weekDay: "",
    weekNumber: 0,
    restaurants: [],

    favorites: (localStorage.getItem(favoritesStorageKey) ? JSON.parse(localStorage.getItem(favoritesStorageKey) as string) : []) as number[],
    apiUrl: (process.env.NODE_ENV === "production" ? `https://mauritz.cloud/lunch-meny` : `http://127.0.0.1:3025`)
  },

  mutations: {
    toggleFavorite(state, restaurantId: number) {
      let found = state.favorites.find((id: number, key: number) => {
        if(id === restaurantId) {
          state.favorites.splice(key, 1);
          return true;
        } else {
          return false;
        }
      });

      if(!found) {
        state.favorites.push(restaurantId);
      }

      localStorage.setItem(favoritesStorageKey, JSON.stringify(state.favorites));
    },

    updateCache(state, cache: any) {
      if(cache.date) state.date = cache.date;
      if(cache.day) state.weekDay = cache.day;
      if(cache.weekNumber) state.weekNumber = cache.weekNumber;
      if(cache.restaurants) state.restaurants = cache.restaurants;
    }
  },
  actions: {

  }
});