QA TEST REPORT
Project Name: ShopNest E-Commerce Website
Testing Type: Manual Testing
Test Environment: Localhost
Application URL: http://localhost:3000
Database: PostgreSQL
API Testing Tool: Postman
Testing Status: Completed
1. Introduction
This report describes the testing process performed on the ShopNest E-Commerce Website. The main objective was to test the website functionalities, identify errors, and verify that the system works correctly.
2. Testing Scope
The testing process covered the following modules:
1. Homepage Testing
2. Product Testing
3. Search Testing
4. Category Testing
5. Authentication Testing
6. Shopping Cart Testing
7. Checkout Testing
8. API Testing
9. Database and Regression Testing
3. Test Execution Summary
A total of 50 test cases were prepared and executed.
Description	Result
Total Test Cases	50
Passed	50
Failed	0
Pending	0
Bugs Identified	1
Bugs Fixed	1

4. Bug Summary
During the checkout testing process, one issue was identified in the Place Order functionality.
Field	Details
Bug ID	BUG-001
Related Test Case	TC-035
Module	Checkout
Bug Title	Failed to Create Order
Severity	High
Initial Result	Failed
Final Result	Passed
Bug Status	Fixed and Closed

Bug Description:

When clicking the Place Order button, the system displayed the following error message:

"Failed to create order. Please try again."

The issue was fixed, and the functionality was tested again successfully.
5. Retesting Results
After fixing the issue, the Place Order functionality was tested again.

Expected Result:

The system should create the order successfully and display a confirmation message.

Actual Result:

The system successfully created the order and displayed the message:

"Order placed successfully!"

The created order also appeared successfully on the My Orders page.

Retest Status: Passed
6. Screenshots
The following screenshots show the issue before fixing it and the results after applying the fix.

Screenshot 1: Before Fix

Order creation failure message displayed when clicking Place Order.

[Insert Screenshot 1 – Order Creation Failure]

Screenshot 2: After Fix

Successful order placement confirmation message.

[Insert Screenshot 2 – Order Placed Successfully]

Screenshot 3: My Orders Page

The created orders are displayed successfully on the My Orders page.

[Insert Screenshot 3 – Saved Orders]
7. Overall Testing Results
All 50 test cases were completed. The identified issue in the checkout process was fixed and successfully retested.

The final testing results showed that all test cases passed.
8. Conclusion
The ShopNest E-Commerce Website was tested through manual functional testing, API testing, database testing, and regression testing.

A total of 50 test cases were executed across nine main modules.

One bug was identified during the testing process in the Place Order functionality. After fixing the issue, the functionality was retested and worked correctly.

The system successfully created orders and displayed them on the My Orders page.

Final Testing Status: PASS

Bug Status: Fixed and Closed

Prepared by: Hadeel Salameh
Role: Manual QA Tester
Project: ShopNest E-Commerce Website