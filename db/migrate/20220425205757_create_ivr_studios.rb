class CreateIvrStudios < ActiveRecord::Migration[7.0]
  def change
    create_table :ivr_studios do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.string :name
      t.text :ivr_data
      t.integer :total_item
      t.text :goto_data
      t.text :select_node
      t.string :webapplication_sid 
      t.timestamps
    end
  end
end
