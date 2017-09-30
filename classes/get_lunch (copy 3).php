<?php

header("Content-Type: application/json");
date_default_timezone_set("Europe/Helsinki");

$cache_valid = false;
if(file_exists("../cache.json")) {
  if($cache_contents = file_get_contents("../cache.json")) {
    if(!empty($cache_contents)) {
      if($cache_obj = json_decode($cache_contents)) {
        if(!empty($cache_obj->restaurants)) {
          if($cache_obj->date === date("d.m.Y", time())) {
            $cache_valid = true;
          }
        }
      }
    }
  }
}


if($cache_valid) {
  echo $cache_contents;
} else {
  $restaurants_json = file_get_contents("../config/restaurants.json");
  $restaurants_obj_plain = json_decode($restaurants_json);
  $filtered_matches = array();
  $restaurants_obj = (object) array(
    "restaurants" => $restaurants_obj_plain
  );

  $contents = file_get_contents("http://www.aland.com/lunch/");
  $contents = preg_replace("/\n/mi", "", $contents);
  $contents = mb_convert_encoding($contents, "UTF-8", mb_detect_encoding($contents, "UTF-8, ISO-8859-1, ISO-8859-15", true));
  $contents = preg_replace("/[ ]*/mi", " €", $contents);

  preg_match('/<b>Dagens lunch ([0-9]{1,}\.[0-9]{1,}\.[0-9]{4})<\/b>/mi', $contents, $found_dates);
  $restaurants_obj->date = $found_dates[1];
  $restaurants_obj->timestap = strtotime($restaurants_obj->date);
  //$restaurants_obj->date = str_replace(".", "/", $restaurants_obj->date);
  $restaurants_obj->day = strtolower(date("l", $restaurants_obj->timestap));
  $restaurants_obj->week_number = date("W", $restaurants_obj->timestap);

  $matches_found = preg_match_all('/(<div id="restaurant_[0-9]*" class="restaurant">)(.*?)(<!--\/\.ui-accordion-content--><\/div>)/mi', $contents, $matches);

  foreach($matches[0] as $key => $value) {
    foreach($restaurants_obj->restaurants as $res_key => $res_value) {
      if(preg_match('/<div id="restaurant_' . $res_value->id . '" class="restaurant">/mi', $value)) {
        $filtered_matches[$res_value->id] = $value;
      }
    }
  }


  foreach($filtered_matches as $key => $value) {
    if(preg_match('/(<div class="restaurant_info">)(.*?)(<\/div> <!--\/\.left-->)/mi', $value, $found_match)) {
      if($restaurants_obj->restaurants->{$key}) {
        if(empty($restaurants_obj->restaurants->{$key}->image) || !file_exists("../" . $restaurants_obj->restaurants->{$key}->image)) {
          $restaurants_obj->restaurants->{$key}->image = "http://www.aland.com/img/lunchguiden/" . urlencode($key) . ".png";
          $url_check = getimagesize($restaurants_obj->restaurants->{$key}->image);
          if(!is_array($url_check)) {
            $restaurants_obj->restaurants->{$key}->image = "";
          }
        }
        $restaurants_obj->restaurants->{$key}->info = trim(preg_replace('/<img align="right"(.*?)">/i', "", $found_match[2]));
        $restaurants_obj->restaurants->{$key}->info = preg_replace('/(\((.*?)\))/i', "<em>" . "$1" . "</em>", $restaurants_obj->restaurants->{$key}->info);
      }
    }

    if(preg_match('/(<div class="restaurant_menu">)(.*?)(<\/div> <!--\/\.right-->)/mi', $value, $found_match)) {
      if($restaurants_obj->restaurants->{$key}) {
        $restaurants_obj->restaurants->{$key}->lunch = preg_replace("/[ ]*<span><\/span>/i", "", $found_match[2]);
        $restaurants_obj->restaurants->{$key}->lunch = preg_replace('/<ul><li>STÅENDE MENY<\/li>/i', '<p><b>Stående meny</b></p><ul>', $restaurants_obj->restaurants->{$key}->lunch);
        $restaurants_obj->restaurants->{$key}->lunch = preg_replace('/<li>VECKANS MENY<\/li>/i', '</ul><p><b>Veckans meny</b></p><ul>', $restaurants_obj->restaurants->{$key}->lunch);
        $restaurants_obj->restaurants->{$key}->lunch = preg_replace('/(\((.*?)\))/i', "<em>" . "$1" . "</em>", $restaurants_obj->restaurants->{$key}->lunch);
      }
    }
  }

  $json_encoded = json_encode($restaurants_obj);
  $hash_value = hash("sha512", $json_encoded);
  $restaurants_obj->content_hash = $hash_value;
  $json_encoded = json_encode($restaurants_obj);

  file_put_contents("../cache.json", $json_encoded);

  echo $json_encoded;
}

?>