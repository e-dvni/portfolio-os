module Api
  module Admin
    class BaseController < GuardController
      before_action :require_admin!

      private

      def require_admin!
        token = request.headers["Authorization"].to_s.sub(/^Bearer\s+/i, "")
        @current_admin = AdminUser.find_by_token(token)
        render json: { error: "Unauthorized" }, status: :unauthorized unless @current_admin
      end
    end
  end
end
