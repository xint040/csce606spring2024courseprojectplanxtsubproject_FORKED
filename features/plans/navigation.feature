Feature: Testing the navigation

  Scenario: Testing the navigation to home page
    Given I am on the plan page
    When I click on the "Back" button
    Then I should be on the home page

  Scenario: Testing the navigation to create plan page
    Given I am on the plan page
    When I click on the "Create a new plan" button
    Then I should be on the plan create page

  Scenario: Testing the navigation from create plan page to plan page
    Given I am on the plan create page
    When I click on the "Back" button
    Then I should be on the plan page



