class ItemsController < ApplicationController
  before_action :set_item, only: %i[ show edit update destroy ]

  # POST /items or /items.json
  def create
    @item = Item.new(item_params)

    if @item.save
      render json: @item, status: :ok
    else
      render json: @item.errors, status: :unprocessable_entity
    end
    
  end

  # search for items by step_id
  def search
    @items = Item.where(step_id: params[:step_id])
    render json: @items
  end
  

  # PATCH/PUT /items/1 or /items/1.json
  def update
    if @item.update(item_params)
      render json: @item, status: :ok
    end
  end

  # DELETE /items/1 or /items/1.json
  def destroy
    @item.destroy
    respond_to do |format|
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_item
      @item = Item.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def item_params
      params.require(:item).permit(:name, :model, :width, :length, :depth, :rotation, :description, :xpos, :ypos, :zpos, :step_id)
    end
end
