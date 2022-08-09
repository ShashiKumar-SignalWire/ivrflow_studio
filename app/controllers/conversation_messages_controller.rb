class ConversationMessagesController < ApplicationController
    before_action :load_entities

  def create
    @conversation_message = ConversationMessage.create( conversation: @conversation, message: params.dig(:conversation_message, :message)) 
    #ActionCable.server.broadcast "message_room_" + @conversation.conversation_room_id, {message: @conversation_message.message}
    sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
    message = sw_client.messages.create(
                             from: @conversation.signalwire_number,
                             body: @conversation_message.message,
                             to: Contact.find(@conversation.contact_id).number
                           )

    MessageRoomChannel.broadcast_to @conversation, @conversation_message
  end

  protected

  def load_entities
    @conversation = Conversation.find(params.dig(:conversation_message, :conversation_id))
  end
end
