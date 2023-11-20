Rails.application.routes.draw do
  resources :items do
    collection do
      get :search # Defines a route for the search action on items controller.
    end
  end
  
  # Not sure if this is right, need to reconcile with how you did it -Louis
  get 'plans/preview3d', to: 'plans#preview3d'

  resources :steps
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  root "home#index"

  get 'blueprints', to: 'blueprints#index'
  
  resources :plans do
    # collection do
    #   get 'plans', to:'plans#user_plans'
    # end
    member do
      get 'floorplans2d'
    end
  end
  
  # user sign up and login
  get 'sessions', to: 'sessions#create'
  get 'sign_in', to: 'sessions#new'
  delete 'logout', to: 'sessions#destroy'
  get '/auth/events360/callback', to: 'sessions#create'
end
