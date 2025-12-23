Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    resources :apps, only: [:index]
    resources :notes, only: [:show], param: :slug
    resources :projects, only: [:index]

    namespace :admin do
      post "login", to: "sessions#create"
      get "me", to: "sessions#me"
      delete "logout", to: "sessions#destroy"
      patch "notes/:slug", to: "notes#update"
    end
  end
end
