class ItemsController < ApplicationController
  before_action :set_item, only: %i[ show edit update destroy ]

  # POST /items or /items.json
  def create
    @item = Item.new(item_params)

    respond_to do |format|
      if @item.save
        format.html { redirect_to item_url(@item), notice: "Item was successfully created." }
        format.json { render @item, status: :created, location: @item }
      else
        format.json { render json: @item.errors, status: :unprocessable_entity }
      end
    end
  end

  # search for items by step_id
  def search
    @items = Item.where(step_id: params[:step_id])
    render json: @items
  end
  

  # PATCH/PUT /items/1 or /items/1.json
  def update
    respond_to do |format|
      if @item.update(item_params)
        format.json { render json: @item, status: :ok }
      else
        puts @item.errors
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @item.errors, status: :unprocessable_entity }
      end
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
