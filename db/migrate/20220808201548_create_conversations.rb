class CreateConversations < ActiveRecord::Migration[7.0]
  def change
    create_table :conversations do |t|
      t.string :signalwire_number
      t.string :conversation_room_id
      t.references :user, null: false, foreign_key: true
      t.references :contact, null: false, foreign_key: true

      t.timestamps
    end
  end
end
