QA TEST REPORT
Project Name: ShopNest E-Commerce Website
Testing Type: Manual Testing
Date: 07/11/2026
1. Introduction
This report presents the results of the testing process performed on the ShopNest e-commerce website. The purpose of testing was to verify the main system functionalities and identify any errors that could affect the user experience.
2. Testing Scope
The testing process covered the following modules:
1. Homepage
2. Products
3. Search
4. Categories
5. Authentication
6. Shopping Cart
7. Checkout
8. API
9. Database and Regression Testing
3. Test Execution Summary
A total of 50 test cases were prepared and executed.
Description	Result
Total Test Cases	50
Bugs Identified	1
Failed Test Case Initially	TC-035
Bugs Fixed	1
Bugs Retested	1

4. Testing Results
Module	Test Case IDs
Homepage Testing	TC-001 – TC-006
Product Testing	TC-007 – TC-012
Search Testing	TC-013 – TC-017
Category Testing	TC-018 – TC-021
Authentication Testing	TC-022 – TC-027
Shopping Cart Testing	TC-028 – TC-034
Checkout Testing	TC-035 – TC-038
API Testing	TC-039 – TC-043
Database & Regression Testing	TC-044 – TC-050

5. Bug Summary
During the testing process, one bug was identified in the Checkout module.
Field	Details
Bug ID	BUG-001
Test Case ID	TC-035
Module	Checkout
Bug Title	Failed to Create Order
Severity	High
Initial Status	Failed
Final Status	Fixed and Closed

Bug Description:

When clicking the Place Order button, the system displayed the following error message:

"Failed to create order. Please try again."

The order was not created successfully.

The issue was reported and fixed.
6. Retesting
After fixing the bug, the Place Order functionality was tested again.

Expected Result:

The system should create the order successfully and display a confirmation message.

Actual Result:

The system successfully created the order and displayed:

"Order placed successfully!"

The order was also displayed correctly on the My Orders page.
7. Screenshot References
The following screenshots were saved in the Screenshots folder.
Screenshot Name	Description
BUG-001_TC-035_Before-Fix.png	Order creation error
BUG-001_TC-035_After-Fix.png	Successful order confirmation
BUG-001_TC-038_After-Fix.png	Order displayed in My Orders

8. Conclusion
The testing process was completed for the ShopNest e-commerce website using 50 test cases covering the main system functionalities.

One bug was identified during checkout testing. The issue affected the order creation process and was successfully fixed.

After retesting, the order was created successfully and appeared on the My Orders page.

The final result of the bug retesting was Passed, and the bug status was changed to Closed.

Testing Status: Completed

Bug Status: Fixed and Closed