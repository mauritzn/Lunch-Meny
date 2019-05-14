<template>
  <div id="app">
    <div class="container">
      <h1 v-if="loading || errored">
        <strong>Lunch Meny</strong>
      </h1>
      <h1 v-else>
        <strong>Lunch för</strong>
        <span>
          {{ date }}
          <small>({{ weekDay | translateDay }} | vecka: {{ weekNumber }})</small>
        </span>
      </h1>

      <p v-if="loading">Laddar...</p>
      <p v-else-if="!loading && errored">Något gick fel! Vänligen försök igen senare</p>
      <div v-else>
        <restaurant-card
          v-for="restaurant in favoritedRestaurants"
          :key="restaurant.id"
          :restaurant="restaurant"
        ></restaurant-card>

        <hr v-if="favoritedRestaurants.length > 0 && unfavoritedRestaurants.length > 0">

        <restaurant-card
          v-for="restaurant in unfavoritedRestaurants"
          :key="restaurant.id"
          :restaurant="restaurant"
        ></restaurant-card>
      </div>

      <footer>
        <p>
          Restaurang &amp; lunch information från
          <a
            href="http://www.aland.com/lunch/"
            target="_blank"
          >http://aland.com/lunch/</a>
        </p>
        <p>
          <strong>Källkod:&nbsp;</strong>
          <a href="https://github.com/mauritzn/Lunch-Meny/tree/v0.1.0" target="_blank">GitHub</a>
          |
          <a href="https://mauritz.cloud/lunch-meny" target="_blank">API</a>
        </p>
      </footer>
    </div>
  </div>
</template>


<style lang="scss" scoped>
h1 {
  font-weight: 500;
  margin-bottom: 35px;

  strong {
    font-weight: 700;
  }

  span {
    small {
      font-size: 2rem;
      color: #777777;
    }
  }
}

.restaurantCard:not(:last-child) {
  margin-bottom: 35px;
}

footer {
  text-align: center;
  margin-top: 35px;

  p {
    margin: 0;
    font-size: 80%;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }
}
</style>


<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import RestaurantCard from "@/components/RestaurantCard.vue";

@Component({
  components: {
    "restaurant-card": RestaurantCard
  }
})
export default class App extends Vue {
  loading: boolean = true;
  errored: boolean = false;

  get date() {
    return this.$store.state.date;
  }
  get weekDay() {
    return this.$store.state.weekDay;
  }
  get weekNumber() {
    return this.$store.state.weekNumber;
  }

  get favorites() {
    return this.$store.state.favorites;
  }

  get favoritedRestaurants() {
    return this.restaurants.filter((restaurant: any) => {
      if (this.favorites.indexOf(restaurant.id) >= 0) {
        return true;
      } else {
        return false;
      }
    });
  }
  get unfavoritedRestaurants() {
    return this.restaurants.filter((restaurant: any) => {
      if (this.favorites.indexOf(restaurant.id) < 0) {
        return true;
      } else {
        return false;
      }
    });
  }
  get restaurants() {
    return this.$store.state.restaurants.filter((restaurant: any) => {
      if (restaurant.address) {
        if (new RegExp("\\bMariehamn\\b", "i").test(restaurant.address)) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    });
  }

  mounted() {
    axios({
      method: "get",
      url: this.$store.state.apiUrl
    })
      .then(res => {
        this.loading = false;

        if (res.data && res.data.cache) {
          this.$store.commit("updateCache", res.data.cache);
        }
      })
      .catch(err => {
        console.warn(err);
        this.loading = false;
        this.errored = true;
      });
  }

  /* mounted() {
    let arr: any[] = [];

    for (const key in this.restaurants) {
      if (this.restaurants.hasOwnProperty(key)) {
        const element = this.restaurants[key];
        arr.push(element);
      }
    }

    setTimeout(() => {
      console.log(JSON.stringify(arr));
    }, 2000);
  } */
}
</script>