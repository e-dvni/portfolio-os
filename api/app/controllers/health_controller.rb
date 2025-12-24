class HealthController < ApplicationController
  def show
    render json: { ok: true, service: "api", time: Time.current.iso8601 }
  end
end
