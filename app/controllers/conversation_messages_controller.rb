class ConversationMessagesController < ApplicationController
    before_action :load_entities

  def create
    if !(params[:conversation_message][:message].nil? || params[:conversation_message][:message].empty?)
      @conversation_message = ConversationMessage.create( conversation: @conversation, message: params.dig(:conversation_message, :message),direction: "outbound") 
      ActionCable.server.broadcast "message_room_" + @conversation.conversation_room_id, {message: @conversation_message.message}
      begin
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
        message = sw_client.messages.create(
                                 from: @conversation.signalwire_number,
                                 body: @conversation_message.message,
                                 to: Contact.find(@conversation.contact_id).number
                               )
        MessageRoomChannel.broadcast_to @conversation, @conversation_message
      rescue => error
        flash[:danger] = error
        redirect_to conversations_path
      end
      
    end
  end

  protected

  def load_entities
    @conversation = Conversation.find(params.dig(:conversation_message, :conversation_id))
  end
end
