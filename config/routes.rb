Rails.application.routes.draw do
  resources :steps
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  
  root "home#index"
  
  resources :plans do
    member do
      get 'floorplans2d'
    end
  end
  # Defines the root path route ("/")
  # root "articles#index"
end
