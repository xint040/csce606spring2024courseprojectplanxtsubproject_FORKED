class PlansController < ApplicationController
  before_action :set_plan, only: %i[ show edit update destroy ]

  layout "layouts/empty", only: [:new] 

  # GET /plans or /plans.json
  def index
    @plans = Plan.all
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

    snapshot_data_json = params[:snapshot_data]
    snapshot_data = JSON.parse(snapshot_data_json)

    json_content = JSON.parse(File.read(Rails.root.join('lib', 'design.room3d')))
    json_content["floorplan"]["corners"] = {
      "7922010e-f5f3-2e53-46f4-3819ea8cdc12"=>{
        "x"=>0,
        "y"=>0,
      },
      "a8b17dd7-026c-de11-3077-01a169d1b795"=>{
        "x"=> snapshot_data["venue_width"],
        "y"=> 0,
      }, 
      "8039b51e-5a0b-8843-3129-32e647a42002"=>{
        "x":0,
        "y":snapshot_data["venue_length"],
      }, 
      "8a66d562-2eb4-2147-763c-7962e4208a0a"=>{ 
        "x": snapshot_data["venue_width"],
        "y": snapshot_data["venue_length"],
        }
      }
      
      
    snapshot_data["items"].each do |item, values| 
      json_content["items"].append({
          "item_name":values["item_name"],
          "item_type":values["item_type"],
          "model_url":values["item_model"],
          "xpos":values["item_xpos"],
          "ypos": 0,
          "zpos":values["item_zpos"],
          "rotation":0,
          "scale_x":1,
          "scale_y":1,
          "scale_z":1,
          "fixed":false
      })
    end

    puts json_content

    

    session[:snapshot] = json_content
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
      if @plan.update(plan_params)
        format.html { redirect_to plans_path, notice: "Plan was successfully updated." }
        format.json { render :show, status: :ok, location: @plan }
      # else # Currently doesn't handle error cases
      #   format.html { render :edit, status: :unprocessable_entity }
      #   format.json { render json: @plan.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plans/1 or /plans/1.json
  def destroy
    @plan.destroy

    respond_to do |format|
      format.html { redirect_to plans_url, notice: "Plan was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_plan
      @plan = Plan.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def plan_params
      params.require(:plan).permit(:name, :owner, :venue_length, :venue_width, steps_attributes: [:id, :start_date, :start_time, :end_time, :break1_start_time, :break1_end_time, :break2_start_time, :break2_end_time, :_destroy])
    end
end
