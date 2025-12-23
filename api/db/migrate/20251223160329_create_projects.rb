class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.string :title
      t.string :subtitle
      t.string :tech_stack
      t.text :summary
      t.string :repo_url
      t.string :live_url
      t.jsonb :highlights
      t.jsonb :media
      t.integer :order_index

      t.timestamps
    end
  end
end
