# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2022_08_08_201802) do
  create_table "contacts", force: :cascade do |t|
    t.string "name"
    t.string "number"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

  create_table "conversation_messages", force: :cascade do |t|
    t.integer "conversation_id", null: false
    t.text "message"
    t.string "message_sid"
    t.string "direction"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id"], name: "index_conversation_messages_on_conversation_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.string "signalwire_number"
    t.string "conversation_room_id"
    t.integer "user_id", null: false
    t.integer "contact_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_conversations_on_contact_id"
    t.index ["user_id"], name: "index_conversations_on_user_id"
  end

  create_table "ivr_studios", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name"
    t.text "ivr_data"
    t.integer "total_item"
    t.text "goto_data"
    t.text "select_node"
    t.string "webapplication_sid"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_ivr_studios_on_user_id"
  end

  create_table "sw_api_keys", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "space_url"
    t.string "project_id"
    t.string "token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sw_api_keys_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "contacts", "users"
  add_foreign_key "conversation_messages", "conversations"
  add_foreign_key "conversations", "contacts"
  add_foreign_key "conversations", "users"
  add_foreign_key "ivr_studios", "users"
  add_foreign_key "sw_api_keys", "users"
end
