class ChangeItemTimeToDateTimeCorrect < ActiveRecord::Migration[7.0]
  def change
    remove_column :items, :start_time
    remove_column :items, :end_time

    add_column :items, :setup_start_time, :datetime
    add_column :items, :setup_end_time, :datetime

    change_column :items, :breakdown_start_time, :datetime
    change_column :items, :breakdown_end_time, :datetime
  end
end
