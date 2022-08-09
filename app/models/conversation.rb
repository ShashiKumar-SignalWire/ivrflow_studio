class Conversation < ApplicationRecord
  belongs_to :user
  belongs_to :contact
  has_many :conversation_messages, dependent: :destroy, inverse_of: :conversation
end
