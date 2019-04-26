<template>
  <div id="app">
    <div class="container">
      <h1>
        <strong>Lunch för</strong>
        <span>
          {{ date }}
          <small>({{ weekDay | translateDay }} | vecka: {{ weekNumber }})</small>
        </span>
      </h1>

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
</style>


<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RestaurantCard from "@/components/RestaurantCard.vue";

@Component({
  components: {
    "restaurant-card": RestaurantCard
  }
})
export default class App extends Vue {
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
    return this.$store.state.restaurants;
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