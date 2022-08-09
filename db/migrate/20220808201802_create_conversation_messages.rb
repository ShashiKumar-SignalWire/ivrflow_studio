class CreateConversationMessages < ActiveRecord::Migration[7.0]
  def change
    create_table :conversation_messages do |t|
      t.references :conversation, null: false, foreign_key: true
      t.text :message
      t.string :message_sid
      t.string :direction

      t.timestamps
    end
  end
end
