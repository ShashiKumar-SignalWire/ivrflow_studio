class CreateContacts < ActiveRecord::Migration[7.0]
  def change
    create_table :contacts do |t|
      t.string :name
      t.string :number
      t.belongs_to :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
