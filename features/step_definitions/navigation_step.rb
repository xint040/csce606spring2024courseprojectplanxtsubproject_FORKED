require 'rspec/expectations'
World(RSpec::Matchers) 
# features/step_definitions/navigation_steps.rb

Given(/^I am on the home page$/) do
    # Add code to navigate to the home page of your application
    visit '/'   
end

When("I click on the {string} button on the home page") do |button_text|
  # Add code to click on the specified button
  find('a', text: button_text, wait: 10).click
end

Then("I should be on the plan page") do
  # Add code to verify that the current page is the plan page
  expect(current_path).to eq('/plans') # Replace '/plan' with the actual URL of the plan page
end

Given(/^I am on the plan page$/) do
    # Add code to navigate to the home page of your application
    visit '/plans'   
end

When("I click on the {string} button on the plan page") do |button_text|
  # Add code to click on the specified button
  find('a', text: "Create a new plan", wait: 10).click
end

Then("I should be on the plan create page") do
  # Add code to verify that the current page is the plan page
  expect(current_path).to eq('/plans/new') # Replace '/plan' with the actual URL of the plan page
end