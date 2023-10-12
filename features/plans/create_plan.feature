Feature: Create a new plan
    Scenario: Add a new plan
        Given I am on the "plans" page
        When I click on the "Create a new plan" button
        Then I should be on the "new plan" page
        And I fill in "Plan Name" with "My Plan"
        And I fill in "Venue Length" with 60
        And I fill in "Venue Width" with 40
        And I click on the "Create" button
        Then I should be on the "plans" page
        And I should see "My Plan" in the list of plans