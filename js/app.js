(function() {

  var current_content_hash = "";
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
  item_template += '<h4></h4>';
  item_template += '</div>';
  item_template += '</div>';
  item_template += '<div class="item_content">';
  item_template += '<div class="row">';
  item_template += '<div class="col-md-4 restaurant_lunch_info"></div><div class="col-md-8 restaurant_lunch"></div>';
  item_template += '</div>';
  item_template += '</div>';


  function get_lunch_list() {
    $.get("classes/get_lunch.php", function(data) {
      //console.log(data);
      if(current_content_hash !== data.content_hash) {
        current_content_hash = data.content_hash;
        $(".container h2 .date").html(data.date + " <small>(" + days[data.day] + " | vecka: " + data.week_number + ")</small>");

        $(".lunch_lista").html("");
        $.each(data.restaurants, function(key, value) {
          $(".lunch_lista").append('<div class="col-md-12"><div class="restaurant" data-restaurant_id="' + value.id + '"></div></li>');

          var list_item = $(".lunch_lista .restaurant[data-restaurant_id='" + value.id + "']");
          list_item.html(item_template);

          if(value.image !== "") {
            list_item.find(".restaurant_info .item_content").addClass("image_title");
            list_item.find(".restaurant_info h3").html('<img src="' + value.image + '">');
          } else {
            list_item.find(".restaurant_info h3").html(value.name);
          }
          list_item.find(".restaurant_info h4").html(value.address + " | tel. " + value.phone);
          list_item.find(".row .restaurant_lunch_info").html('<p><strong>Lunch på ' + value.name + '</strong></p>');
          list_item.find(".row .restaurant_lunch_info").append(value.info);
          list_item.find(".row .restaurant_lunch").html(value.lunch);
        });
      }
    }); 
  }

  get_lunch_list();
  setInterval(function() {
    get_lunch_list();
  }, 10000);

}());