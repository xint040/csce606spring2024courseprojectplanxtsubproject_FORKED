class Plan < ActiveRecord::Base
    has_many :steps, dependent: :destroy
    accepts_nested_attributes_for :steps, allow_destroy: true # allows steps to be destroyed when plan is destroyed
end