module Api
  module Admin
    class ProjectsController < BaseController
      def index
        render json: Project.order(:order_index, :created_at)
      end

      def create
        project = Project.create!(project_params)
        render json: project, status: :created
      end

      def update
        project = Project.find(params[:id])
        project.update!(project_params)
        render json: project
      end

      def destroy
        project = Project.find(params[:id])
        project.destroy!
        render json: { ok: true }
      end

      private

      def project_params
        params.require(:project).permit(
          :title,
          :subtitle,
          :tech_stack,
          :summary,
          :repo_url,
          :live_url,
          :order_index,
          highlights: [],
          media: []
        )
      end
    end
  end
end
