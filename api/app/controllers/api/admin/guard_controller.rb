# app/controllers/api/admin/guard_controller.rb
module Api
  module Admin
    class GuardController < ApplicationController
      before_action :ensure_enabled!

      private

      def ensure_enabled!
        enabled = ActiveModel::Type::Boolean.new.cast(ENV.fetch("ENABLE_ADMIN_API", "false"))
        return if enabled

        render json: { error: "Admin API disabled" }, status: :forbidden
      end
    end
  end
end
