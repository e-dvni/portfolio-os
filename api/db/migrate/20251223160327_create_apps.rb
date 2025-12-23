class CreateApps < ActiveRecord::Migration[8.1]
  def change
    create_table :apps do |t|
      t.string :name
      t.string :slug
      t.string :icon
      t.string :app_type
      t.string :window_title
      t.integer :default_w
      t.integer :default_h
      t.boolean :desktop
      t.boolean :dock
      t.integer :order_index
      t.string :launch_url
      t.string :internal_key

      t.timestamps
    end
  end
end
