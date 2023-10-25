Rails.application.routes.draw do
  # Not sure if this is right, need to reconcile with how you did it -Louis
  get 'plans/preview3d', to: 'plans#preview3d'

  resources :steps
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  root "home#index"

  get 'blueprints', to: 'blueprints#index'
  
  resources :plans do
    member do
      get 'floorplans2d'
    end
  end
  
  # Defines the root path route ("/")
  # root "articles#index"
end
