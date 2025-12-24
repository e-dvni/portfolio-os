module Api
  module Admin
    class NotesController < BaseController
      def index
        notes = Note.order(:slug).select(:slug, :title, :body)
        render json: notes
      end

      def create
        note = Note.new(note_create_params)
        note.save!
        render json: note, status: :created
      end

      def update
        note = Note.find_by!(slug: params[:slug])
        note.update!(note_update_params)
        render json: note
      end

      def destroy
        note = Note.find_by!(slug: params[:slug])
        note.destroy!
        render json: { ok: true }
      end

      private

      def note_create_params
        params.require(:note).permit(:slug, :title, :body)
      end

      def note_update_params
        params.require(:note).permit(:title, :body)
      end
    end
  end
end
