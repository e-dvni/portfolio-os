# frozen_string_literal: true

# Puma configuration file
# Works for local development and Render production deploys

# Threads
max_threads = ENV.fetch("RAILS_MAX_THREADS", 5).to_i
min_threads = ENV.fetch("RAILS_MIN_THREADS", max_threads).to_i
threads min_threads, max_threads

# Port (Render injects PORT automatically)
port ENV.fetch("PORT", 3000)

# Environment
environment ENV.fetch("RAILS_ENV", "development")

# Workers
# Render free / starter plans should run SINGLE worker
# (Multiple workers require more memory)
workers ENV.fetch("WEB_CONCURRENCY", 1)

# Preload app for faster boot (safe with single worker)
preload_app!

# Allow `rails restart`
plugin :tmp_restart

# Ensure ActiveRecord reconnects after fork
on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end
