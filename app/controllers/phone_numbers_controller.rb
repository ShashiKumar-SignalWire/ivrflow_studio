class PhoneNumbersController < ApplicationController
    def index
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
        @phone_numbers = sw_client.incoming_phone_numbers

    end
    def show
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)

        @phone_number = sw_client.incoming_phone_numbers(params[:id]).fetch
        @pn = Phoner::Phone.parse(@phone_number.phone_number)
    end
    def edit
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
        @phone_number = sw_client.incoming_phone_numbers(params[:id]).fetch
        @default_webapplication_sid=nil
        puts @phone_number.inspect
        if !@phone_number.voice_application_sid.nil?
            webapp_sid= current_user.ivr_studios.find_by_webapplication_sid(@phone_number.voice_application_sid)
            if !webapp_sid.nil?
                @default_webapplication_sid = webapp_sid.webapplication_sid
            end
        end
    end
    def update
        
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
        if params[:message_webhook] == "conversation"
            incoming_phone_number = sw_client
            .incoming_phone_numbers(params[:id])
            .update(:friendly_name => params[:friendly_name],:voice_application_sid=>params[:webapplication_sid],:sms_url=> @webhook_url + "message_webhook/"+current_user.id.to_s)
            respond_to do |format|
                if incoming_phone_number.friendly_name
                format.html { redirect_to phone_numbers_path, success: "Number updated successfully." }
                format.json { render :show, status: :ok, location: @user }
                else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @user.errors, status: :unprocessable_entity }
                end
            end
        else
            incoming_phone_number = sw_client
            .incoming_phone_numbers(params[:id])
            .update(:friendly_name => params[:friendly_name],:voice_application_sid=>params[:webapplication_sid])
            respond_to do |format|
                if incoming_phone_number.friendly_name
                format.html { redirect_to phone_numbers_path, success: "Number updated successfully." }
                format.json { render :show, status: :ok, location: @user }
                else
                format.html { render :edit, status: :unprocessable_entity }
                format.json { render json: @user.errors, status: :unprocessable_entity }
                end
            end
        end
        
    end
end
