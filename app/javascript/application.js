// Entry point for the build script in your package.json
import './add_jquery'
import "@hotwired/turbo-rails"
import "./controllers"
import * as bootstrap from "bootstrap"
import "./channels"

$(function() {
    $('#new_room_message').on('ajax:success', function(a, b,c ) {
      $(this).find('input[type="text"]').val('');
    });
  });
