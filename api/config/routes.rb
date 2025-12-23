Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    resources :apps, only: [:index]
    resources :notes, only: [:show], param: :slug
    resources :projects, only: [:index]
  end
end
