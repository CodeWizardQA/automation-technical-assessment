Feature: Login with 2FA

  Scenario: Successful login with valid credentials and 2FA
    Given I am on the login page
    When I sign in with "user@example.com" and "Correct$Password1"
    And I submit the 2FA code
    Then I should see the dashboard

  Scenario: Invalid password shows error
    Given I am on the login page
    When I sign in with "user@example.com" and "wrongPass"
    Then I should see an "invalid credentials" error

  Scenario: Invalid 2FA code shows error
    Given I am on the login page
    When I sign in with "user@example.com" and "Correct$Password1"
    And I submit an invalid 2FA code "999999"
    Then I should see an "invalid 2FA code" error

  Scenario: Expired 2FA code shows error
    Given I am on the login page
    When I sign in with "user@example.com" and "Correct$Password1"
    And I submit an expired 2FA code
    Then I should see an "expired 2FA code" error