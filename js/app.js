(function() {

  var storage_name = "lunch_db", favorites_db_name = "lunch_favorites";

  var favorites = (localStorage.getItem(favorites_db_name) !== null ? JSON.parse(localStorage.getItem(favorites_db_name)) : []);
  var current_content = {};

  var days = {
    monday: "måndag",
    tuesday: "tisdag",
    wednesday: "onsdag",
    thursday: "torsdag",
    friday: "fredag",
    saturday: "lördag",
    sunday: "söndag"
  };

  var item_template = '<div class="restaurant_info">';
  item_template += '<div class="item_content">';
  item_template += '<h3></h3>';
  // item_template += '<h4></h4>';
  item_template += '<div class="restaurant_menu">';
  item_template += '<i class="material-icons" data-action="{{ACTION_FAVORITE_TYPE}}">{{ACTION_FAVORITE_ICON}}</i>';
  item_template += '</div>';
  item_template += '</div>';
  item_template += '</div>';
  item_template += '<div class="item_content">';
  item_template += '<div class="row">';
  item_template += '<div class="col-md-4 restaurant_lunch_info"></div><div class="col-md-8 restaurant_lunch"></div>';
  item_template += '</div>';
  item_template += '</div>';


  function manage_favorites(action, restaurant_id) {
    restaurant_id = parseInt(restaurant_id);

    if(action === "favorite") {
      favorites.push(restaurant_id);
    } else if(action === "unfavorite") {
      $.each(favorites, function(key, value) {
        if(value === restaurant_id) favorites.splice(key, 1);
      });
    }

    localStorage.setItem(favorites_db_name, JSON.stringify(favorites));
    render_list(current_content);
  }


  function render_list(content) {
    $(".container h2 .date").html(content.date + " <small>(" + days[content.day] + " | vecka: " + content.week_number + ")</small>");

    $(".lunch_list").html("");
    if(favorites.length <= 0) $(".lunch_list[data-list='favorites']").hide();
    else $(".lunch_list[data-list='favorites']").show();

    $.each(content.restaurants, function(key, value) {
      var item_template_copy = item_template;
      var lunch_list = ".lunch_list[data-list='other']";
      if($.inArray(parseInt(value.id), favorites) !== -1) {
        lunch_list = ".lunch_list[data-list='favorites']";
        item_template_copy = item_template_copy.replace(new RegExp("{{ACTION_FAVORITE_TYPE}}", "gi"), "unfavorite");
        item_template_copy = item_template_copy.replace(new RegExp("{{ACTION_FAVORITE_ICON}}", "gi"), "favorite");
      }

      item_template_copy = item_template_copy.replace(new RegExp("{{ACTION_FAVORITE_TYPE}}", "gi"), "favorite");
      item_template_copy = item_template_copy.replace(new RegExp("{{ACTION_FAVORITE_ICON}}", "gi"), "favorite_border");


      $(lunch_list).append('<div class="col-md-12"><div class="restaurant" data-restaurant_id="' + value.id + '"></div></li>');

      var list_item = $(lunch_list + " .restaurant[data-restaurant_id='" + value.id + "']");
      list_item.html(item_template_copy);
      //console.log(list_item);

      if(value.image !== "") {
        list_item.find(".restaurant_info .item_content").addClass("image_title");
        if(value.website !== "") list_item.find(".restaurant_info h3").html('<a href="' + value.website + '" target="_blank"><img src="' + value.image + '"></a>');
        else list_item.find(".restaurant_info h3").html('<img src="' + value.image + '">');
      } else {
        if(value.website !== "") list_item.find(".restaurant_info h3").html('<a href="' + value.website + '" target="_blank">' + value.name + '</a>');
        else list_item.find(".restaurant_info h3").html(value.name);
      }
      
      //list_item.find(".restaurant_info h4").html(value.address + " | tel. " + value.phone);
      list_item.find(".row .restaurant_lunch_info").html('<p><strong>Lunch på ' + value.name + '</strong></p>');
      list_item.find(".row .restaurant_lunch_info").append(value.info);
      list_item.find(".row .restaurant_lunch_info").append('<div class="restaurant_contact"></div>');
      list_item.find(".row .restaurant_lunch_info .restaurant_contact").html('<p class="address"><strong>Adress:</strong> <span></span></p><p class="phone"><strong>Telefon:</strong> <span></span></p>');
      list_item.find(".row .restaurant_lunch_info .restaurant_contact .address span").html(value.address);
      list_item.find(".row .restaurant_lunch_info .restaurant_contact .phone span").html(value.phone);
      list_item.find(".row .restaurant_lunch").html((value.lunch ? value.lunch : '<p><em>(Ingen lunch meny ännu)</em></p>'));
      list_item.attr("data-has_lunch", (value.lunch ? "true" : "false"));
    });
  }


  if(localStorage.getItem(storage_name) !== null) {
    current_content = JSON.parse(localStorage.getItem(storage_name));
    console.log("Cache found, rendering list!");
    render_list(current_content);
  }


  function get_lunch_list() {
    //console.log("Getting lunch list...");
    $.get("classes/get_lunch.php", function(data) {
      //console.log("## LIST GRABBED ##");
      //console.log(data);
      if(current_content.content_hash !== data.content_hash) {
        current_content = data;
        localStorage.setItem(storage_name, JSON.stringify(data));

        console.warn("Missmatch, reloading list!");

        render_list(data);
      }
    }); 
  }





  $("body").on("click", ".restaurant_menu i[data-action]", function(event) {
    event.preventDefault();
    var btnThis = this;
    var action = $(btnThis).data("action");
    var restaurant_id = parseInt($(btnThis).parent().parent().parent().parent().data("restaurant_id"));

    if(action === "favorite") {
      console.log("Favorite: " + restaurant_id);
      $(btnThis).html("favorite");
      $(btnThis).attr("data-action", "unfavorite");
      $(btnThis).data("action", "unfavorite");
      manage_favorites(action, restaurant_id);
    } else if(action === "unfavorite") {
      console.log("Unfavorite: " + restaurant_id);
      $(btnThis).html("favorite_border");
      $(btnThis).attr("data-action", "favorite");
      $(btnThis).data("action", "favorite");
      manage_favorites(action, restaurant_id);
    }
  });





  get_lunch_list();
  setInterval(function() {
    get_lunch_list();
  }, 10000);

}());