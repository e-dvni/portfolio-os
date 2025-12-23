module Api
  module Admin
    class NotesController < BaseController
      def update
        note = Note.find_by!(slug: params[:slug])
        note.update!(note_params)
        render json: note
      end

      private

      def note_params
        params.require(:note).permit(:title, :body)
      end
    end
  end
end
