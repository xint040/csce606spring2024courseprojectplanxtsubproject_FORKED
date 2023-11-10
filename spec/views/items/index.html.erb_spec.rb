require 'rails_helper'

RSpec.describe "items/index", type: :view do
  before(:each) do
    assign(:items, [
      Item.create!(
        name: "Name",
        model: "Model",
        width: "Width",
        length: "Length",
        depth: "Depth",
        rotation: "Rotation",
        description: "Description",
        xpos: "Xpos",
        ypos: "Ypos",
        zpos: "Zpos",
        step_id: "Step"
      ),
      Item.create!(
        name: "Name",
        model: "Model",
        width: "Width",
        length: "Length",
        depth: "Depth",
        rotation: "Rotation",
        description: "Description",
        xpos: "Xpos",
        ypos: "Ypos",
        zpos: "Zpos",
        step_id: "Step"
      )
    ])
  end

  it "renders a list of items" do
    render
    cell_selector = Rails::VERSION::STRING >= '7' ? 'div>p' : 'tr>td'
    assert_select cell_selector, text: Regexp.new("Name".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Model".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Width".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Length".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Depth".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Rotation".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Description".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Xpos".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Ypos".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Zpos".to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Step".to_s), count: 2
  end
end
