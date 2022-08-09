$(function() {
    $('#new_room_message').on('ajax:success', function(a, b,c ) {
      alert("ok");
      $(this).find('input[type="text"]').val('');
    });
  });