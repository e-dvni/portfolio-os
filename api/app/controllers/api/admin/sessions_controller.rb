module Api
  module Admin
    class SessionsController < GuardController
      def create
        user = AdminUser.find_by(email: params[:email].to_s.downcase)

        unless user&.authenticate(params[:password].to_s)
          return render json: { error: "Invalid credentials" }, status: :unauthorized
        end

        token = user.issue_token!
        render json: { token: token, email: user.email }
      end

      def me
        token = request.headers["Authorization"].to_s.sub(/^Bearer\s+/i, "")
        user = AdminUser.find_by_token(token)
        return render json: { error: "Unauthorized" }, status: :unauthorized unless user

        render json: { email: user.email }
      end

      def destroy
        token = request.headers["Authorization"].to_s.sub(/^Bearer\s+/i, "")
        user = AdminUser.find_by_token(token)

        return render json: { ok: true } unless user

        user.update!(api_token_digest: nil)
        render json: { ok: true }
      end
    end
  end
end
