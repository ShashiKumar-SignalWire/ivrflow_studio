import consumer from "./consumer"
const element = document.getElementById("conversation-room-id");
console.log(element);

if (element !== null){
  $('[data-channel-subscribe="conversation"]').each(function(index, element) {
    console.log(element);
    var $element = $(element)
    $element.animate({ scrollTop: $element.prop("scrollHeight")}, 1000) 
  });
    
  consumer.subscriptions.create({channel:"MessageRoomChannel",message_room_id: element.getAttribute("data-conversation-id")} ,{
    connected() {
      console.log("Connected to MessageRoom channel -> " + element.getAttribute("data-conversation-id"));
      // Called when the subscription is ready for use on the server
    },
  
    disconnected() {
      // Called when the subscription has been terminated by the server
    },
  
    received(data) {
      // Called when there's incoming data on the websocket for this channel
      console.log(data);
     
      $('[data-channel-subscribe="conversation"]').each(function(index, element) {
        console.log(element);
        var $element = $(element)
        messageTemplate = $('[data-role="message-template"]');
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        console.log(messageTemplate);
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        var content = messageTemplate.children().clone(true, true);
        content.find('[data-role="message-text"]').text(data.message);
        content.find('[data-role="message-date"]').text(data.updated_at);
        $element.append(content);

        $element.animate({ scrollTop: $element.prop("scrollHeight")}, 1000) 
      });

     
      
     
    }
  });
}


/*
$(function() {
  $('[data-channel-subscribe="conversation"]').each(function(index, element) {
    console.log(element);
    var $element = $(element),
        room_id = $element.data('data-conversation-id')
        messageTemplate = $('[data-role="message-template"]');
        console.log(room_id)
    $element.animate({ scrollTop: $element.prop("scrollHeight")}, 1000)        

    consumer.subscriptions.create(
      {
        channel: "MessageRoomChannel",
        message_room_id: room_id
      },
      {
        received: function(data) {
          var content = messageTemplate.children().clone(true, true);
          content.find('[data-role="message-text"]').text(data.message);
          content.find('[data-role="message-date"]').text(data.updated_at);
          $element.append(content);
          $element.animate({ scrollTop: $element.prop("scrollHeight")}, 1000);
        }
      }
    );
  });
});
*/