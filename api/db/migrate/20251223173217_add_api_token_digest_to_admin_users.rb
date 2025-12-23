class AddApiTokenDigestToAdminUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :admin_users, :api_token_digest, :string
  end
end
