const storage_name = "lunch_db";
const favorites_db_name = "lunch_favorites";



const app = new Vue({
  el: "#app",
  data: {
    day: "",
    week_number: "0",
    date: "00.00.0000",
    favorites: (localStorage.getItem(favorites_db_name) !== null ? JSON.parse(localStorage.getItem(favorites_db_name)) : []),
    restaurants: {},
    content_hash: "",
    timestap: 0
  }
});

Vue.component("restaurant", {
  props: ["r", "action", "fav_icon"],
  computed: {
    // a computed getter
    has_lunch: function() {
      // `this` points to the vm instance
      return ((this.r.lunch !== undefined) ? "true" : "false")
    }
  },
  
  template: `<div class="col-md-12">
<div class="restaurant" v-bind:data-restaurant_id="r.id" v-bind:data-has_lunch="has_lunch">
<div class="restaurant_info">
<div class="item_content image_title">
<h3><a v-bind:href="r.website" target="_blank"><img v-bind:src="r.image"></a></h3>
<div class="restaurant_menu"><i class="material-icons" v-bind:data-action="action">{{ fav_icon }}</i></div>
</div>
</div>

<div class="item_content">
<div class="row">
<div class="col-md-4 restaurant_lunch_info">
<p><strong>Lunch på {{ r.name }}</strong></p>

<span v-html="r.info"></span>

<div class="restaurant_contact">
<p class="address"><strong>Adress:</strong> <span>{{ r.address }}</span></p>
<p class="phone"><strong>Telefon:</strong> <span>{{ r.phone }}</span></p>
</div>
</div>

<div class="col-md-8 restaurant_lunch">
<span v-html="r.lunch"></span>
<span v-if="has_lunch === 'false'"><p><em>(Ingen lunch meny ännu)</em></p></span>
</div>
</div>
</div>
</div>
</div>`
});




(function() {
  let getting_list = false;
  let grab_list_at = 0;
  //app["favorites"] = (localStorage.getItem(favorites_db_name) !== null ? JSON.parse(localStorage.getItem(favorites_db_name)) : []);


  function set_app_data(data) {
    app.day = data.day;
    app.week_number = data.week_number;
    app.date = data.date;
    app.restaurants = data.restaurants;
    app.content_hash = data.content_hash;
    app.timestap = data.timestap;
  }

  function manage_favorites(action, restaurant_id) {
    let index = -1;
    restaurant_id = parseInt(restaurant_id);

    if(action === "favorite") {
      app["favorites"].push(restaurant_id);
    } else if(action === "unfavorite") {
      if((index = app["favorites"].indexOf(restaurant_id)) !== -1) {
        app["favorites"].splice(index, 1);
      }
    }

    localStorage.setItem(favorites_db_name, JSON.stringify(app["favorites"]));
  }


  if(localStorage.getItem(storage_name) !== null) {
    set_app_data(JSON.parse(localStorage.getItem(storage_name)));
    console.log("Cache found, rendering list!");
  }


  function get_lunch_list() {
    //console.log("Getting lunch list...");
    $.get("classes/get_lunch.php", function(data) {
      getting_list = false;
      grab_list_at = 0;

      //console.log("## LIST GRABBED ##");
      //console.log(data);
      if(app.content_hash !== data.content_hash) {
        set_app_data(data);
        localStorage.setItem(storage_name, JSON.stringify(data));

        console.warn("Missmatch, reloading list!");
      }
    }); 
  }





  $("body").on("click", ".restaurant_menu i[data-action]", function(event) {
    event.preventDefault();
    const btnThis = this;
    const action = $(btnThis).attr("data-action");
    const restaurant_id = parseInt($(btnThis).parent().parent().parent().parent().attr("data-restaurant_id"));

    if(action === "favorite") {
      console.log("Favorite: " + restaurant_id);
      manage_favorites(action, restaurant_id);
    } else if(action === "unfavorite") {
      console.log("Unfavorite: " + restaurant_id);
      manage_favorites(action, restaurant_id);
    }
  });





  get_lunch_list();
  setInterval(function() {
    get_lunch_list();
  }, 10000);

  setInterval(function() {
    if(getting_list === false || (get_timestamp() - grab_list_at) > 10000) {
      //console.log("ran check mem, interval");
      getting_list = false;
      grab_list_at = 0;

      if(localStorage.getItem(storage_name) !== null) {
        set_app_data(JSON.parse(localStorage.getItem(storage_name)));
        const current_date = new Date();
        let old_list_in_memory = false;
        let stored_list_date_exploded = app["date"].split(".");

        if(parseInt(stored_list_date_exploded[2]) < current_date.getFullYear()) old_list_in_memory = true;
        if(parseInt(stored_list_date_exploded[1]) < (current_date.getMonth() + 1)) old_list_in_memory = true;
        if(parseInt(stored_list_date_exploded[0]) < current_date.getDate()) old_list_in_memory = true;


        if(old_list_in_memory) {
          //console.warn("Old list in memory, forcing early refresh!");
          // SHOW MESSAGE TO USER (in form of "uppdaterar lista" notification)
          getting_list = true;
          grab_list_at = get_timestamp();
          get_lunch_list();
        }
      } else {
        //console.warn("Old list in memory, forcing early refresh!");
        // SHOW MESSAGE TO USER (in form of "uppdaterar lista" notification)
        getting_list = true;
        grab_list_at = get_timestamp();
        get_lunch_list();
      }
    }
  }, 500);

}());