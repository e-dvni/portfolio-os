Rails.application.routes.draw do
  # Health checks (Render-friendly)
  get "/health", to: "health#show"
  get "/health/db", to: "health#db"

  namespace :api do
    get "/health", to: "health#show"
    get "/health/db", to: "health#db"

    resources :apps, only: [:index]
    resources :notes, only: [:index, :show], param: :slug
    resources :projects, only: [:index]

    namespace :admin do
      post   "login",  to: "sessions#create"
      get    "me",     to: "sessions#me"
      delete "logout", to: "sessions#destroy"

      resources :projects, only: [:index, :create, :update, :destroy]

      resources :notes, only: [:index, :create], param: :slug
      patch  "notes/:slug", to: "notes#update"
      delete "notes/:slug", to: "notes#destroy"
    end
  end
end
