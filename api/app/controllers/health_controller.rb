class HealthController < ActionController::API
  def show
    render json: {
      ok: true,
      service: "portfolio-os-api",
      time: Time.now.utc.iso8601
    }, status: :ok
  end

  def db
    ActiveRecord::Base.connection.execute("SELECT 1")
    render json: {
      ok: true,
      db: "ok",
      time: Time.now.utc.iso8601
    }, status: :ok
  rescue => e
    render json: {
      ok: false,
      db: "error",
      error: e.class.name,
      message: e.message
    }, status: :service_unavailable
  end
end
