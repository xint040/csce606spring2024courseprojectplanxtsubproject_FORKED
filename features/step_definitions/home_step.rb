# features/step_definitions/navigation_steps.rb

Given("I am on the home page") do
  visit '/' # Replace with the actual URL of your home page
end

Then("I should be on the plan page") do
  expect(current_path).to eq('/plans') # Replace with the actual URL of the plan page
end
