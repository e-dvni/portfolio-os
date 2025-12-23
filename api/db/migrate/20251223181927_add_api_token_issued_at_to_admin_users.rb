class AddApiTokenIssuedAtToAdminUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :admin_users, :api_token_issued_at, :datetime
  end
end
