Feature: Update a new plan

Background:
Given the following plans exist:
    | name        | owner   | venue_length     | venue_width |
    | My Plan     | user    | 10               | 10          |
    | My Plan 2   | user    | 20               | 20          |

    Scenario: Update an existed plan
        Given I am on the "plans" page
        Then I click on the button with "edit" icon for the plan "My Plan" to enter the "edit" page
        When I fill in "Plan Name" with "My Plan - Updated"
        And I fill in "Venue Length" with "20"
        And I fill in "Venue Width" with "20"
        And I click on the "Update" button
        Then I should be on the "plans" page
        And I should see the name being updated to "My Plan - Updated" in the list of plans

    Scenario: Add steps to the existed plan
        Given I am on the "plans" page
        Then I click on the button with "edit" icon for the plan "My Plan" to enter the "edit" page
        When I click on the "Add Step" button
        Then I should see a template of step being added
        When I fill in "Start Date" with "2016-01-01"
        And I fill in "Start Time" with "10:00"
        And I fill in "End Time" with "11:00"
        And I fill in "Break1 Start Time" with "12:00"
        And I fill in "Break1 End Time" with "13:00"
        And I fill in "Break2 Start Time" with "14:00"
        And I fill in "Break2 End Time" with "15:00"
        And I click on the "Update" button
        Then I should be on the "plans" page
        