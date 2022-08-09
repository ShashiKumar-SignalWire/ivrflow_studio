class ConversationMessage < ApplicationRecord
  belongs_to :conversation, inverse_of: :conversation_messages
end
