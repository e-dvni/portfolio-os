Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      ENV.fetch("FRONTEND_ORIGIN", "http://localhost:5173"),
      "https://portfolio-os-web.onrender.com",
      "https://edvni.dev",
      "https://www.edvni.dev"
    )

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: ["Authorization"]
  end
end
