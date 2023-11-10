require 'rails_helper'

RSpec.describe "items/show", type: :view do
  before(:each) do
    assign(:item, Item.create!(
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
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/Model/)
    expect(rendered).to match(/Width/)
    expect(rendered).to match(/Length/)
    expect(rendered).to match(/Depth/)
    expect(rendered).to match(/Rotation/)
    expect(rendered).to match(/Description/)
    expect(rendered).to match(/Xpos/)
    expect(rendered).to match(/Ypos/)
    expect(rendered).to match(/Zpos/)
    expect(rendered).to match(/Step/)
  end
end
