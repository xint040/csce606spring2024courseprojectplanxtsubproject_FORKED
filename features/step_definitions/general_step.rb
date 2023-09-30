When("I click on the {string} button") do |button_text|
  find('a', text: button_text, wait: 10).click
end