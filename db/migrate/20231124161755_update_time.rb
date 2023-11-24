class UpdateTime < ActiveRecord::Migration[7.0]
  def change
    change_column :steps, :start_time, :datetime
    change_column :steps, :end_time, :datetime
    change_column :steps, :break1_start_time, :datetime
    change_column :steps, :break1_end_time, :datetime
    change_column :steps, :break2_start_time, :datetime
    change_column :steps, :break2_end_time, :datetime
  end
end
