# api/config/initializers/cors.rb

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In production on Render, allow your deployed frontend.
    # In development, allow Vite dev server.
    origins(
      ENV.fetch("FRONTEND_ORIGIN", "https://portfolio-os-web.onrender.com"),
      "http://localhost:5173"
    )

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: [],
      credentials: false
  end
end
