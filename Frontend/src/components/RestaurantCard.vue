<template>
  <div class="restaurantCard">
    <div class="restaurantCard__header">
      <a :href="(restaurant.website ? restaurant.website : 'javascript:void(0);')" target="_blank">
        <h3>
          <img :src="restaurant.image" v-if="restaurant.image">
          <span v-else>{{ restaurant.name }}</span>
        </h3>
      </a>

      <i
        @click="toggleFavorite(restaurant.id)"
        class="material-icons restaurantCard__unfavorite"
        v-if="favorited"
      >favorite</i>
      <i
        @click="toggleFavorite(restaurant.id)"
        class="material-icons restaurantCard__favorite"
        v-else
      >favorite_border</i>
    </div>

    <div class="restaurantCard__body">
      <div class="restaurantCard__side">
        <p>
          <strong>Lunch på {{ restaurant.name }}</strong>
        </p>
        <div class="restaurantCard__info" v-html="restaurant.info"></div>

        <div class="restaurantCard__contact" v-if="restaurant.address || restaurant.phone">
          <p class="contact__address" v-if="restaurant.address">
            <strong>Adress:</strong>
            {{ restaurant.address }}
          </p>

          <p class="contact__phone" v-if="restaurant.phone">
            <strong>Telefon:</strong>
            {{ restaurant.phone }}
          </p>
        </div>
      </div>

      <div class="restaurantCard__menu">
        <span v-html="restaurant.menu" v-if="restaurant.menu"></span>
        <span v-else>
          <p>
            <em>(Ingen lunch meny ännu)</em>
          </p>
        </span>
      </div>
    </div>
  </div>
</template>


<style lang="scss">
.restaurantCard {
  position: relative;
  background-color: #fff;
  border-radius: 7px;
  opacity: 1;
  overflow: hidden;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.35);
  //box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
  transition: opacity 0.2s ease-in-out;

  &__header {
    position: relative;
    display: flex;
    height: 110px;
    align-items: center;
    justify-content: space-between;
    padding: 25px 35px;
    background-color: #fbfbfb;
    border-bottom: 1px solid #e5e5e5;

    h3 {
      margin: 0;
      line-height: 0;
      vertical-align: middle;

      img {
        max-height: 55px;
        max-width: 150px;
      }
    }
  }

  &__unfavorite,
  &__favorite {
    cursor: pointer;
    transform: scale(1);
    transition: color 0.2s ease-in-out, transform 0.2s ease-in-out;

    &:hover {
      transform: scale(1.2);
    }
    &:active {
      transform: scale(1);
    }
  }
  &__favorite {
    color: #212121;

    &:hover {
      color: #e53935;
    }
  }
  &__unfavorite {
    color: #e53935;
  }

  &__body {
    display: grid;
    grid-template-columns: 33% 1fr;
    grid-gap: 30px;
    padding: 35px;
  }

  &__info {
    margin-bottom: 25px;
  }

  &__contact {
    p {
      margin-bottom: 0;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__menu {
    ul {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 25px;
      }

      li:not(:last-child) {
        margin-bottom: 15px;
      }
    }
  }
}

@media all and (max-width: 991px) {
  .restaurantCard {
    &__body {
      grid-template-columns: 1fr;
      grid-gap: 0;
    }
    &__side::after {
      content: "";
      height: 1px;
      width: 90%;
      margin: 35px auto;
      display: table;
      background-color: #e5e5e5;
    }
  }
}
</style>


<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class RestaurantCard extends Vue {
  @Prop() private restaurant!: any;

  get favorited() {
    return this.$store.state.favorites.indexOf(this.restaurant.id) >= 0
      ? true
      : false;
  }

  toggleFavorite(restaurantId: number) {
    this.$store.commit("toggleFavorite", restaurantId);
  }
}
</script>