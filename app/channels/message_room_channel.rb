class MessageRoomChannel < ApplicationCable::Channel
  
  def subscribed
     #puts "Message channel -> " +params[:message_room_id]
     #stream_from "message_room_#{params[:message_room_id]}"
     room = Conversation.find_by_conversation_room_id(params[:message_room_id])
     stream_for room
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
