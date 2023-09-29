Feature: Create the plan

  Scenario: Creating a new plan
    Given I am on the plan create page
    And I fill in "Plan Name" with "demo"
    And I fill in "Venue Height" with "100"
    And I fill in "Venue Width" with "100"
    And I press "CREATE"
    Then I should see "plan created successfully"