<?php

header("Content-Type: application/json");
date_default_timezone_set("Europe/Helsinki");

$favorited_json = file_get_contents("../config/favorites.json");
$favorited_obj_plain = json_decode($favorited_json);
$filtered_matches = array();
$favorited_obj = (object) array(
  "restaurants" => $favorited_obj_plain
);

$contents = file_get_contents("http://www.aland.com/lunch/");
$contents = preg_replace("/\n/mi", "", $contents);
$contents = mb_convert_encoding($contents, "UTF-8", mb_detect_encoding($contents, "UTF-8, ISO-8859-1, ISO-8859-15", true));
$contents = preg_replace("/[ ]*/mi", " €", $contents);

preg_match('/<b>Dagens lunch ([0-9]{1,}\.[0-9]{1,}\.[0-9]{4})<\/b>/mi', $contents, $found_dates);
$favorited_obj->date = $found_dates[1];
$favorited_obj->timestap = strtotime($favorited_obj->date);
//$favorited_obj->date = str_replace(".", "/", $favorited_obj->date);
$favorited_obj->day = strtolower(date("l", $favorited_obj->timestap));
$favorited_obj->week_number = date("W", $favorited_obj->timestap);

$matches_found = preg_match_all('/(<div id="restaurant_[0-9]*" class="restaurant">)(.*?)(<!--\/\.ui-accordion-content--><\/div>)/mi', $contents, $matches);

foreach($matches[0] as $key => $value) {
  foreach($favorited_obj->restaurants as $fav_key => $fav_value) {
    if(preg_match('/<div id="restaurant_' . $fav_value->id . '" class="restaurant">/mi', $value)) {
      $filtered_matches[$fav_value->id] = $value;
    }
  }
}

foreach($filtered_matches as $key => $value) {
  if(preg_match('/(<div class="restaurant_info">)(.*?)(<\/div> <!--\/\.left-->)/mi', $value, $found_match)) {
    if($favorited_obj->restaurants->{$key}) {
      $favorited_obj->restaurants->{$key}->image = "http://www.aland.com/img/lunchguiden/" . urlencode($key) . ".png";
      $favorited_obj->restaurants->{$key}->info = trim(preg_replace('/<img align="right"(.*?)">/i', "", $found_match[2]));
      $favorited_obj->restaurants->{$key}->info = preg_replace('/(\((.*?)\))/i', "<em>" . "$1" . "</em>", $favorited_obj->restaurants->{$key}->info);
    }
  }

  if(preg_match('/(<div class="restaurant_menu">)(.*?)(<\/div> <!--\/\.right-->)/mi', $value, $found_match)) {
    if($favorited_obj->restaurants->{$key}) {
      $favorited_obj->restaurants->{$key}->lunch = preg_replace("/[ ]*<span><\/span>/i", "", $found_match[2]);
      $favorited_obj->restaurants->{$key}->lunch = preg_replace('/<ul><li>STÅENDE MENY<\/li>/i', '<p><b>Stående meny</b></p><ul>', $favorited_obj->restaurants->{$key}->lunch);
      $favorited_obj->restaurants->{$key}->lunch = preg_replace('/<li>VECKANS MENY<\/li>/i', '</ul><p><b>Veckans meny</b></p><ul>', $favorited_obj->restaurants->{$key}->lunch);
      $favorited_obj->restaurants->{$key}->lunch = preg_replace('/(\((.*?)\))/i', "<em>" . "$1" . "</em>", $favorited_obj->restaurants->{$key}->lunch);
    }
  }
}

$json_encoded = json_encode($favorited_obj);
$hash_value = hash("sha512", $json_encoded);
$favorited_obj->content_hash = $hash_value;
echo json_encode($favorited_obj);

?>