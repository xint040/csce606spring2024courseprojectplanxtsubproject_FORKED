Given('I am on the plan page') do
  visit '/plans'
end

Then('I should be on the home page') do
  expect(current_path).to eq('/') 
end

Then('I should be on the plan create page') do
  expect(current_path).to eq('/plans/new')
end

Given('I am on the plan create page') do
  visit '/plans/new'
end
