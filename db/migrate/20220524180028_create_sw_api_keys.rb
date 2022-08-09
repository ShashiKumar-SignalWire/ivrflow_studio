class CreateSwApiKeys < ActiveRecord::Migration[7.0]
  def change
    create_table :sw_api_keys do |t|
      t.belongs_to :user, null: false, foreign_key: true
      t.string :space_url
      t.string :project_id
      t.string :token

      t.timestamps
    end
  end
end
