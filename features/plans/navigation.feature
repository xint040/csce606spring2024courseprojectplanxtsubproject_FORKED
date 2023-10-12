Feature: Navigate to different pages

Background:
Given the following plans exist:
    | name        | owner   | venue_length     | venue_width |
    | My Plan     | user    | 10               | 10          |
    | My Plan 2   | user    | 20               | 20          |


    Scenario: Navigate to home page
        Given I am on the "plans" page
        When I click on the "Back" button
        Then I should be on the "home" page

    Scenario: Navigate to create new plan page
        Given I am on the "plans" page
        When I click on the "Create a new plan" button
        Then I should be on the "new plan" page
    
    Scenario: Navigate to "edit floorplans 2d" page
        Given I am on the "plans" page
        Then I click on the button with "play" icon for the plan "My Plan" to enter the "edit floorplans 2d" page