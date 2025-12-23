module Api
  module Admin
    class GuardController < ApplicationController
      before_action :ensure_enabled!

      private

      def ensure_enabled!
        enabled = ActiveModel::Type::Boolean.new.cast(ENV["ENABLE_ADMIN_API"])
        return if enabled

        render json: { error: "Admin API disabled" }, status: :forbidden
      end
    end
  end
end
