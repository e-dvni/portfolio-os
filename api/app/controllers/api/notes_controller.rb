module Api
  class NotesController < ApplicationController
    def show
      note = Note.find_by!(slug: params[:slug])
      render json: note
    end
  end
end
