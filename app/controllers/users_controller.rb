class UsersController < ApplicationController
  skip_before_action :authorized, only: [:new, :create,:render_plain_text]
  skip_before_action :verify_authenticity_token

  def index
    if session[:user_id] == nil
      redirect_to root_path
    end
    @user = current_user
     
  end
  def new
    if false#session[:user_id] != 1
      redirect_to root_path
    else
      @user = User.new
    end    
  end

  def create
    @user = User.create(params.require(:user).permit(:name,:email,:password))
    flash[:success] = "User Created Successfully..."
    redirect_to '/login'
  end
 

  def update
    @user = User.find(current_user.id)
    
    respond_to do |format|
      puts "*****************111111***************************************"
      puts user_params
      puts "*****************22222***************************************"
      if @user.update(user_params)
        puts "JJJJJJJJJJJJJJJJJJJJJJJJJs"
        format.html { redirect_to root_path, success: "User was successfully updated." }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end

  end
  def edit_sw_api_keys
  end
  
  def update_sw_api_keys
    if current_user.sw_api_key.nil?
      current_user.create_sw_api_key(:project_id => params["project_id"],:token => params["token"],:space_url =>params["space_url"] )
    else
      current_user.sw_api_key.update(:project_id => params["project_id"],:token => params["token"],:space_url =>params["space_url"])
    end
    flash[:success] = "updated Successfully..."
    redirect_to root_path
  end
  def delete_sw_api_keys
    if current_user.sw_api_key.destroy
      flash[:success] = "Deleted Successfully..."
      redirect_to root_path
    end
  end
  private
    def user_params
        params.require(:user).permit(:name)
    end
end
