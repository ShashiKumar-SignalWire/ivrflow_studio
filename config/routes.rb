Rails.application.routes.draw do
  resources :conversation_messages
  resources :conversations
  get 'conversation_message/index'
  get 'conversation_message/show'
  get "users/index"
  root 'sessions#new'
  resources :ivr_studios
  resources :users, only: [:new, :create,:update]
  resources :phone_numbers

  
  resources :contacts
  get 'user/edit', to: 'users#edit'
  get 'user/edit_sw_api_keys', to: 'users#edit_sw_api_keys'

  get 'login', to: 'sessions#new'
  post 'login', to: 'sessions#create'
  post 'update_sw_api_keys', to: "users#update_sw_api_keys"
  get 'authorized', to: 'sessions#page_requires_login'
  delete "logout", to: "sessions#destroy"
  put 'update_ivr_flow/:id', to: "ivr_studios#update_ivr_flow"
  #get 'ivr_studio_webhook/:id/:current_node_id', to: "ivr_studios#ivr_studio_webhook"
  #post 'ivr_studio_webhook/:id/:current_node_id', to: "ivr_studios#ivr_studio_webhook"
  match 'ivr_studio_webhook/:id/:current_node_id', to: 'ivr_studios#ivr_studio_webhook', via: [:post,:get]
  match 'message_webhook/:user_id', to: 'conversations#message_webhook', via: [:post,:get]
end


