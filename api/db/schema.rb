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

ActiveRecord::Schema[8.1].define(version: 2025_12_23_181927) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_users", force: :cascade do |t|
    t.string "api_token_digest"
    t.datetime "api_token_issued_at"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "password_digest"
    t.datetime "updated_at", null: false
  end

  create_table "apps", force: :cascade do |t|
    t.string "app_type"
    t.datetime "created_at", null: false
    t.integer "default_h"
    t.integer "default_w"
    t.boolean "desktop"
    t.boolean "dock"
    t.string "icon"
    t.string "internal_key"
    t.string "launch_url"
    t.string "name"
    t.integer "order_index"
    t.string "slug"
    t.datetime "updated_at", null: false
    t.string "window_title"
  end

  create_table "notes", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.string "slug"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.jsonb "highlights"
    t.string "live_url"
    t.jsonb "media"
    t.integer "order_index"
    t.string "repo_url"
    t.string "subtitle"
    t.text "summary"
    t.string "tech_stack"
    t.string "title"
    t.datetime "updated_at", null: false
  end
end
