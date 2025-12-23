class AdminUser < ApplicationRecord
  has_secure_password
  validates :email, presence: true, uniqueness: true

  TOKEN_TTL = 7.days

  def issue_token!
    raw = SecureRandom.hex(32)
    update!(
      api_token_digest: Digest::SHA256.hexdigest(raw),
      api_token_issued_at: Time.current
    )
    raw
  end

  def self.find_by_token(raw)
    return nil if raw.blank?
    digest = Digest::SHA256.hexdigest(raw.to_s)
    user = find_by(api_token_digest: digest)
    return nil unless user

    return nil if user.api_token_issued_at.blank?
    return nil if user.api_token_issued_at < TOKEN_TTL.ago

    user
  end
end
