class ConversationsController < ApplicationController
    skip_before_action :verify_authenticity_token, only: %i[ message_webhook]
    skip_before_action :authorized, only: [:message_webhook]
  def index
    @conversations = current_user.conversations.all
  end
  def show
    @conversations = current_user.conversations.all
    @conversation = Conversation.find(params[:id]) if params[:id]
    @conversation_message = ConversationMessage.new conversation: @conversation
    @conversation_messages = @conversation.conversation_messages.includes(:conversation)
  end


  def message_webhook
    response = Twilio::TwiML::VoiceResponse.new
    response.hangup
    from_number= params[:From]
    to_number = params[:To]
    user_id = params[:user_id]
    message_sid = params[:MessageSid]
    message = params[:Body]
    user = User.find(user_id)
    contact=nil
    if !user.nil?
       contact = user.contacts.find_by_number(from_number)
       if contact.nil?
           contact = user.contacts.create(:name => from_number,:number => from_number)
       end
       conversation = Conversation.where(:user_id => user.id,:contact_id => contact.id,:signalwire_number => to_number).first
       if conversation.nil?
        conversation = Conversation.create(:user_id => user_id,:contact_id => contact.id,:conversation_room_id =>SecureRandom.uuid,:signalwire_number => to_number)
       end
       conversation_message = ConversationMessage.create(:conversation_id => conversation.id,:message=>message,:message_sid=> message_sid)
       MessageRoomChannel.broadcast_to conversation, conversation_message
       render xml: response
    else
      render xml: response
    end
 end
end
