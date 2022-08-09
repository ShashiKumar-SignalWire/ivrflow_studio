class SessionsController < ApplicationController
  skip_before_action :authorized, only: [:new, :create]
  def new
    if session[:user_id] != nil
      redirect_to users_index_path
    end
  end

  def create
    @user = User.find_by(email: params[:email])
    if @user && @user.authenticate(params[:password])
      session[:user_id] = @user.id
      
      flash[:success] = "Logged in Succssfully"
      redirect_to root_path
    else
      flash[:danger] = "Logged failed "
      redirect_to '/login'
    end

  end

  def login
    
  end
  def destroy
    session[:user_id] = nil
    #flash[:notice] = "You have been logged out."
    redirect_to root_path
  end
end
