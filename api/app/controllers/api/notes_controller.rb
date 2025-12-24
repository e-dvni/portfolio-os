module Api
  class NotesController < ApplicationController
    def show
      note = Note.find_by!(slug: params[:slug])
      render json: note
    end
    def index
      render json: Note.order(:slug).select(:slug, :title)
    end
  end
end
