class IvrStudiosController < ApplicationController
  before_action :set_ivr_studio, only: %i[ show edit update destroy update_ivr_flow ivr_studio_webhook]
  
  skip_before_action :verify_authenticity_token, only: %i[ update_ivr_flow ivr_studio_webhook]
  skip_before_action :authorized, only: [:ivr_studio_webhook]
  
  # GET /ivr_studios or /ivr_studios.json
  def index
    @ivr_studios = current_user.ivr_studios.all
  end

  # GET /ivr_studios/1 or /ivr_studios/1.json
  def show
  end

  # GET /ivr_studios/new
  def new
    if (current_user.sw_api_key.nil?) 
      flash[:danger] = "Please add signalwire ProjectId and token to create IVR"
      redirect_to ivr_studios_path
    elsif(current_user.sw_api_key.token.nil? || current_user.sw_api_key.project_id.nil?)
      flash[:danger] = "Please add signalwire ProjectId and token to create IVR"
      redirect_to ivr_studios_path
    end
    @ivr_studio = current_user.ivr_studios.new
  end

  # GET /ivr_studios/1/edit
  def edit
  end

  # POST /ivr_studios or /ivr_studios.json
  def create
    ivr_studio = current_user.ivr_studios.find_by_name(ivr_studio_params[:name])
    if ivr_studio.nil?
      sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
      begin
        @ivr_studio = current_user.ivr_studios.new(ivr_studio_params)
        respond_to do |format|
          
          if @ivr_studio.save
            application = sw_client.applications
                        .create(
                            friendly_name: "ivrstudio-" + ivr_studio_params[:name],
                            voice_url: @webhook_url + "ivr_studio_webhook/"+@ivr_studio.id.to_s+"/1"
                          )
            @ivr_studio.update(:webapplication_sid => ivr_studio_params[:webapplication_sid]=application.sid)
            format.html { redirect_to ivr_studio_url(@ivr_studio), success: "Ivr studio successfully created." , turbolinks: false}
            format.json { render :show, status: :created, location: @ivr_studio }
          else
            format.html { render :new, status: :unprocessable_entity }
            format.json { render json: @ivr_studio.errors, status: :unprocessable_entity }
          end
        end
      rescue => e
        flash[:danger] = "Error creating IVR Studio, Please check your Signalwire Project details"
        redirect_to root_path 
      end
    else
      flash[:warning] = ivr_studio_params[:name] + " Name already exists"
      redirect_to new_ivr_studio_path 
    end
  end

  # PATCH/PUT /ivr_studios/1 or /ivr_studios/1.json
  def update
    
    respond_to do |format|
      if @ivr_studio.update(ivr_studio_params)
        format.html { redirect_to ivr_studio_url(@ivr_studio), notice: "Ivr studio was successfully updated." }
        format.json { render :show, status: :ok, location: @ivr_studio }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @ivr_studio.errors, status: :unprocessable_entity }
      end
    end
  end

  def update_ivr_flow
    ivr_data= params["ivr_data"]
    goto_data = params["goto_data"]
    select_node = params["goto_data"]
    respond_to do |format|
      if @ivr_studio.update(:ivr_data => ivr_data,:total_item => params[:total_item],:goto_data => goto_data)
        format.json { render :show, status: :ok, location: @ivr_studio }
      else
        format.json { render json: @ivr_studio.errors, status: :unprocessable_entity }
      end
    end
  end
  def ivr_studio_webhook
    response = Twilio::TwiML::VoiceResponse.new
    response.hangup
      current_node_id=params[:current_node_id].to_i
      if @ivr_studio.nil? || @ivr_studio.ivr_data.nil?
        render xml: response
      else
        ivr_data= JSON.parse(@ivr_studio.ivr_data)
        goto_data = JSON.parse(@ivr_studio.goto_data)
        ivr_data.each do |node|
         if (!goto_data.nil? && goto_data.length() > 0)
            goto_data.each do |goto_node|
              goto_node_ids = goto_node.split("-")
              if current_node_id == goto_node_ids[0].to_i 
                ivr_data.each do |goto_node_data|
                  if goto_node_data['id'].to_i == goto_node_ids[1].to_i
                    current_node_id = goto_node_data['parent'].to_i
                    break
                  end
                end
              end
            end
         end
         if (current_node_id == node['parent'].to_i)
              if(node['name'] == "Play")
                response = Twilio::TwiML::VoiceResponse.new
                response.play(url: node['play-text-value'],loop:node['play-loop-count'])
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == "Say")
                response = Twilio::TwiML::VoiceResponse.new
                response.say(message: node['say-text-value'],loop:node['say-loop-count'],voice:node['say-voice'],language:node['alice-say-language'])
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'Hangup')
                response = Twilio::TwiML::VoiceResponse.new
                response.hangup
                break
              end
              if(node['name'] == "Gather")
                response = Twilio::TwiML::VoiceResponse.new
                max_num_digits = node['validKeys'].split(",").max_by(&:length)
                if max_num_digits
                  num_digits = max_num_digits.length
                end
                if(!node['say-text-value'].blank?)
                  response.gather(action: '/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s + "?validKeys=" + node['validKeys'], method: 'POST',numDigits: num_digits) do |gather|
                    gather
                      .say(message: node['say-text-value'])
                  end
                else
                  response.gather(action: '/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s + "?validKeys=" + node['validKeys'], method: 'POST') do |gather|
                    gather
                      .play(url: node['play-text-value'])
                  end
                end
                break
              end
              if(node['name'] == "Digit")
                if (!params['validKeys'].split(",").include?(params['Digits'].to_s) && node['digit'] == 'invalid')
                  response = Twilio::TwiML::VoiceResponse.new
                  response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                  break
                end
                if(node['digit'].to_i == params['Digits'].to_i)
                  response = Twilio::TwiML::VoiceResponse.new
                  response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                    break
                end
              end
              if(node['name'] == 'Dial')
                response = Twilio::TwiML::VoiceResponse.new
                numbers = node['dial-numbers'].split(",")
                response.dial(action: '/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST') do |dial|
                  numbers.each do |number|
                    dial.number(number)
                  end
                end
                break
              end
              if(node['name'] == 'DialSuccess' && ["success", "answered", "completed"].include?(params["DialCallStatus"]))
                response = Twilio::TwiML::VoiceResponse.new
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'DialFailed' && ["failed", "no-answer", "user-busy","busy","reject"].include?(params["DialCallStatus"]))
                response = Twilio::TwiML::VoiceResponse.new
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'Record')
                response = Twilio::TwiML::VoiceResponse.new
                response.record(action: '/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'Conference')
                response = Twilio::TwiML::VoiceResponse.new
                response.dial do |dial|
                  dial.conference(node['conference-name'])
                end
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'Queue')
                response = Twilio::TwiML::VoiceResponse.new
                response.dial do |dial|
                  dial.queue(node['queue-name'])
                end
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end                
              if(node['name'] == 'Weekdays')
                response = Twilio::TwiML::VoiceResponse.new
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'Days')
                if (node['nodeName'] == 'SelectedDays')
                  days = node['SelectedDays'].split(",")
                  if days.include?(Date.today.strftime("%A"))
                    response = Twilio::TwiML::VoiceResponse.new
                    response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                    break
                  end
                end
                if (node['nodeName'] == 'NotSelectedDays')
                  days = node['NotSelectedDays'].split(",")
                  if days.include?(Date.today.strftime("%A"))
                    response = Twilio::TwiML::VoiceResponse.new
                    response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                    break
                  end
                end
              end
              if(node['name'] == 'Timings')
                response = Twilio::TwiML::VoiceResponse.new
                response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                break
              end
              if(node['name'] == 'SelectedTime')
                
                start_time=Time.parse(node['StartTime'])
                end_time=Time.parse(node['EndTime'])
               
                if(is_now_in_time_period(start_time, end_time))
                  response = Twilio::TwiML::VoiceResponse.new
                  response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                  break
                end
               
              end
              if(node['name'] == 'RemainingTime')
                start_time=Time.parse(node['StartTime'])
                end_time=Time.parse(node['EndTime'])
                if(!is_now_in_time_period(start_time, end_time))
                  response = Twilio::TwiML::VoiceResponse.new
                  response.redirect('/ivr_studio_webhook/' + @ivr_studio.id.to_s + "/" +node['id'].to_s, method: 'POST')
                  break
                end
               
              end
         end
        end
        render xml: response
      end
  end

  # DELETE /ivr_studios/1 or /ivr_studios/1.json
  def destroy
    if !@ivr_studio.webapplication_sid.nil?
      begin
        sw_client = Signalwire::REST::Client.new(current_user.sw_api_key.project_id, current_user.sw_api_key.token, signalwire_space_url: current_user.sw_api_key.space_url)
        sw_client.applications(@ivr_studio.webapplication_sid).delete
      rescue =>e
      end
    end
    @ivr_studio.destroy

    respond_to do |format|
      format.html { redirect_to ivr_studios_url, notice: "Ivr studio destroyed successfully." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_ivr_studio
      @ivr_studio = IvrStudio.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def ivr_studio_params
      params.require(:ivr_studio).permit(:name,:ivr_data,:total_item,:goto_data,:ivr_studio)
    end
    def is_now_in_time_period(start_time,end_time)
      current_time = Time.now
      
      #2022-04-29 14:08:09 +0000 current_time
      #2022-04-29 14:00:00 +0000 start_time
      #2022-04-29 18:00:00 +0000 end_time

      if (start_time < end_time)
        return current_time >= start_time && current_time <= end_time
      else
          return current_time >= start_time || current_time <= end_time
      end
    end
end
