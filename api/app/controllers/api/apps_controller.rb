module Api
  class AppsController < ApplicationController
    def index
      apps = App.order(:order_index)
      render json: apps
    end
  end
end
