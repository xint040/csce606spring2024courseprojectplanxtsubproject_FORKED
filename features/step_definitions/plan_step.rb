Given('the following plans exist:') do |table|
  table.hashes.each do |plan|
    Plan.create plan
  end
end

When('I click on the button with {string} icon for the plan {string} to enter the {string} page') do |string, string2, string3|
  plan = Plan.find_by(name: string2)
  # Find the link with the specific id and click it
  find("##{string}_plan_#{plan.id}").click
  if string3 == 'edit'
    expect(current_path).to eq(edit_plan_path(plan))
  elsif string3 == 'edit floorplans 2d'
    expect(current_path).to eq(floorplans2d_plan_path(plan))
  end
end

Then('I should see the name being updated to {string} in the list of plans') do |string|
  plan = Plan.find_by(name:string)
  expect(plan).not_to be_nil
end


When('I click on the {string} button') do |string|
  click_on(string)
end

Then('I fill in {string} with {string}') do |string, string2|
  fill_in(string, with: string2)
end

Then('I fill in {string} with {double}') do |string, double|
  fill_in(string, with: double)
end

Then('I should see {string} in the list of plans') do |string|
  plan = Plan.find_by(name:string)
  expect(plan).not_to be_nil
end

Then('I should see a template of step being added')  do
  # button_id = 'add-step-button' 
  # page.execute_script("document.getElementById('#{button_id}').click();")

  puts body
  initial_row_count = page.all('tbody#step-table-body tr').count
  expect(page.all('tbody#step-table-body tr').count).to eq(initial_row_count + 1)
end

Given('I am on the {string} page') do |string|
  if string == 'new plan'
    visit(new_plan_path)
    expect(current_path).to eq('/plans/new')
  elsif string == 'home'
    visit(root_path)
    expect(current_path).to eq('/')
  else
    visit(string)
    expect(current_path).to eq('/'+string)
  end
end

Then('I should be on the {string} page') do |string|
  if string == 'new plan'
    expect(current_path).to eq('/plans/new')
  elsif string == 'home'
    expect(current_path).to eq('/')
  else
    expect(current_path).to eq('/'+string)
  end
end