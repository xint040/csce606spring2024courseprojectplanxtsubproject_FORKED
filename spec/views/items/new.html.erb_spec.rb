require 'rails_helper'

RSpec.describe "items/new", type: :view do
  before(:each) do
    assign(:item, Item.new(
      name: "MyString",
      model: "MyString",
      width: "MyString",
      length: "MyString",
      depth: "MyString",
      rotation: "MyString",
      description: "MyString",
      xpos: "MyString",
      ypos: "MyString",
      zpos: "MyString",
      step_id: "MyString"
    ))
  end

  it "renders new item form" do
    render

    assert_select "form[action=?][method=?]", items_path, "post" do

      assert_select "input[name=?]", "item[name]"

      assert_select "input[name=?]", "item[model]"

      assert_select "input[name=?]", "item[width]"

      assert_select "input[name=?]", "item[length]"

      assert_select "input[name=?]", "item[depth]"

      assert_select "input[name=?]", "item[rotation]"

      assert_select "input[name=?]", "item[description]"

      assert_select "input[name=?]", "item[xpos]"

      assert_select "input[name=?]", "item[ypos]"

      assert_select "input[name=?]", "item[zpos]"

      assert_select "input[name=?]", "item[step_id]"
    end
  end
end
