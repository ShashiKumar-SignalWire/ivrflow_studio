class ApplicationController < ActionController::Base
    before_action :authorized
    helper_method :current_user
    helper_method :logged_in?
    add_flash_types :info, :error, :warning
    add_flash_types :danger, :info, :warning, :success, :messages
    before_action :webhook_url 
    def logged_in?
        !!session[:user_id]
    end
    def current_user
        @current_user  ||= User.find_by_id(session[:user_id]) if !!session[:user_id]
    end
    def authorized
        redirect_to root_path unless logged_in?
    end
    def webhook_url
        @webhook_url = "http://139.59.44.141:3000/"
    end
end
