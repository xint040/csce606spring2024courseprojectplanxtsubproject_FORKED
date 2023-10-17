@drag_and_drop
@javascript
Feature: Drag and Drop items to the canvas

Background:
Given the following plans exist:
    | name        | owner   | venue_length     | venue_width |
    | My Plan     | user    | 10               | 10          |

    Scenario: Testing the drag and drop functionality
    Given I am on the "plans" page
    Then I click on the button with "play" icon for the plan "My Plan" to enter the "edit floorplans 2d" page
    When I click on the "Top Layer" Accordion
    Then I should see the "TopLayer" Accordion expand
    When I drag "T1" from the "Top Layer" Accordion and drop at x=0, y=0 on the canvas
    Then I should see the item "T1" appear on the canvas at x=0, y=0 
        