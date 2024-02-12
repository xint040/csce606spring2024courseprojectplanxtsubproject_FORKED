class PlansController < ApplicationController
  require 'csv'


  before_action :set_plan, only: %i[ show edit update destroy ]
  
  before_action :require_user_logged_in!, unless: -> { !Rails.env.production? }
  
  # def user_plans
  #   @user = User.from_omniauth(request.env['omniauth.auth'])
  #   @plans = @user.plans
  # end

  def upload_existing_plan
    # Process the uploaded file
  

    # Redirect to a different page upon successful file upload
    redirect_to plans_path, notice: 'File uploaded successfully.'
  end
  
  layout "layouts/empty", only: [:new] 

  # GET /plans or /plans.json
  def index
    # @plans = Plan.all
    # Only display plans of the logged in user
    @plans = Plan.where(owner: session[:user_email])
  end

  # GET /plans/1 or /plans/1.json
  def show
    redirect_to edit_plan_path(@plan)
  end

  # GET /plans/new
  def new
    @plan = Plan.new
    @plan.steps.build # Build an empty Step associated with the new Plan
  end

  # GET /plans/1/edit
  def edit
  end

  def floorplans2d
    @plan = Plan.find(params[:id])
  end
  
  def preview3d
    snapshot_data_json = params[:snapshot_data]
    snapshot_data = JSON.parse(snapshot_data_json)

    scaler = 31.4
    json_content = JSON.parse(File.read(Rails.root.join('lib', 'design.room3d')))

    # Update the corners of the floorplan
    json_content["floorplan"]["corners"] = {
      "7922010e-f5f3-2e53-46f4-3819ea8cdc12" => {
        "x" => 0,
        "y" => 0,
      },
      "a8b17dd7-026c-de11-3077-01a169d1b795" => {
        "x" => snapshot_data["venue_width"] * scaler,
        "y" => 0,
      },
      "8039b51e-5a0b-8843-3129-32e647a42002" => {
        "x" => 0,
        "y" => snapshot_data["venue_length"] * scaler,
      },
      "8a66d562-2eb4-2147-763c-7962e4208a0a" => {
        "x" => snapshot_data["venue_width"] * scaler,
        "y" => snapshot_data["venue_length"] * scaler,
      }
    }

    # Add items to the floorplan
    snapshot_data["items"].each do |item, values|
      json_content["items"].append({
        "item_name" => values["item_name"],
        "item_type" => values["item_type"],
        "model_url" => values["item_model"],
        "xpos" => values["item_xpos"] * scaler,
        "ypos" => 0,
        "zpos" => values["item_zpos"] * scaler,
        "rotation" => 0,
        "scale_x" => 1,
        "scale_y" => 1,
        "scale_z" => 1,
        "fixed" => false
      })
    end

    # Write the updated information to a JSON file stored in the public folder called "floorplan.json"
    File.write(Rails.root.join('public', 'floorplan.json'), JSON.pretty_generate(json_content))

    redirect_to blueprints_path
  end

  # POST /plans or /plans.json
  def create
    @plan = Plan.new(plan_params)
    respond_to do |format|
      if @plan.save
        format.html { redirect_to plans_path, notice: "Plan was successfully created." }
      # else # Currently doesn't handle error cases
      #   format.html { render :new, status: :unprocessable_entity }
      #   format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /plans/1 or /plans/1.json
  def update
    respond_to do |format|
      if update_plan_with_steps
        format.html { redirect_to plans_path, notice: 'Plan was successfully updated.' }
        format.json { render :show, status: :ok, location: @plan }
      end
    end
  end

  def update_plan_with_steps
    if plan_params[:steps_attributes].nil?
      return @plan.update(plan_params)
    end
    steps_attributes = plan_params[:steps_attributes].to_unsafe_h

    steps_attributes.each do |key, step_params|
      %i[start_time end_time break1_start_time break1_end_time break2_start_time break2_end_time].each do |attr|
        step_params[attr] = combine_date_and_time(step_params[:start_date], step_params[attr])
      end
    end

    @plan.update(plan_params.merge(steps_attributes: steps_attributes))
  end

  def combine_date_and_time(date, time)
    return nil if date.blank? || time.blank?
    DateTime.parse("#{date} #{time} #{Time.zone.now.strftime("%Z")}")
  end

  # DELETE /plans/1 or /plans/1.json
  def destroy
    @plan.destroy

    respond_to do |format|
      format.html { redirect_to plans_url, notice: "Plan was successfully destroyed." }
      format.json { head :no_content }
    end
  end


  # Method to download all plan and item data as a CSV file
  def download_all_data
    @plans = Plan.all
    @items = Item.all

    # Generate CSV with plan and item data
    csv_data = CSV.generate do |csv|
      csv << ['Plan attributes', 'Item attributes']

      @plans.each do |plan|
        plan_values = plan.attributes.values.join(', ')
        plan_items = @items.select { |item| item.step_id == plan.id }
        plan_items_values = plan_items.map { |item| item.attributes.values.join(', ') }

        csv << [plan_values, plan_items_values]
      end
    end

    headers["Content-Type"] = "text/csv"
    headers["Content-Disposition"] = "attachment; filename=all_data.csv"

    render plain: csv_data
  end

  

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_plan
      @plan = Plan.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def plan_params
      # params.require(:plan).permit(:name, :owner, :venue_length, :venue_width, :user_email, steps_attributes: [:id, :start_date, :start_time, :end_time, :break1_start_time, :break1_end_time, :break2_start_time, :break2_end_time, :_destroy])
      params.require(:plan).permit(:name, :owner, :timezone, :venue_length, :venue_width, steps_attributes: [:id, :start_date, :start_time, :end_time, :break1_start_time, :break1_end_time, :break2_start_time, :break2_end_time, :_destroy])
    end

end
