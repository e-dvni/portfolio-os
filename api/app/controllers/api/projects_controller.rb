module Api
  class ProjectsController < ApplicationController
    def index
      projects = Project.order(:order_index)
      render json: projects
    end
  end
end
