Rails.application.routes.draw do
  get "health", to: "health#show"
  
  namespace :api do
    get "health", to: "health#show"

    resources :apps, only: [:index]

    # ✅ NotesHub needs list + show
    resources :notes, only: [:index, :show], param: :slug

    resources :projects, only: [:index]

    namespace :admin do
      post "login", to: "sessions#create"
      get "me", to: "sessions#me"
      delete "logout", to: "sessions#destroy"

      resources :projects, only: [:index, :create, :update, :destroy]

      # ✅ Admin notes: list/create/update/delete by slug
      resources :notes, only: [:index, :create], param: :slug
      patch  "notes/:slug", to: "notes#update"
      delete "notes/:slug", to: "notes#destroy"
    end
  end
end
