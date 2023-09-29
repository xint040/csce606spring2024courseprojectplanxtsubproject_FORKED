Feature: Testing the navigation

  Scenario: Testing the navigation to plan page
    Given I am on the home page
    When I click on the "Get Started" button on the home page
    Then I should be on the plan page

  Scenario: Testing the navigation to create plan page
    Given I am on the plan page
    When I click on the "Create a new plan" button on the plan page
    Then I should be on the plan create page


