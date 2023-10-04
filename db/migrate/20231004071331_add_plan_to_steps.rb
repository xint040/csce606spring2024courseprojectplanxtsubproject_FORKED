class AddPlanToSteps < ActiveRecord::Migration[7.0]
  def change
    add_reference :steps, :plan, foreign_key: true
  end
end
