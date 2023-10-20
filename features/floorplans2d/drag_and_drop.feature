@drag_and_drop
@javascript
Feature: Drag and Drop items to the canvas

Background:
Given the following plans exist:
    | name        | owner   | venue_length     | venue_width |
    | My Plan     | user    | 100               | 100         |

    Scenario: Testing the drag and drop functionality
    Given I am on the "plans" page
    Then I click on the button with "play" icon for the plan "My Plan" to enter the "edit floorplans 2d" page
    Then It should load all the items in the floorplans 2d page
    When I click on the "Furniture Layer" Accordion
    Then I should see the "FurnitureLayer" Accordion expand
    When I drag "Chair" from the "Furniture Layer" Accordion and drop at x=0, y=0 on the canvas
    Then I should see the item "Chair" appear on the canvas at x=0, y=0
        