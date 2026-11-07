BUG REPORT
Project Name: ShopNest E-Commerce Website

Testing Type: Manual Testing
1. Bug Information
Field	Details
Bug ID	BUG-001
Related Test Case ID	TC-035
Bug Title	Failed to Create Order
Module	Checkout / Place Order
Severity	High
Priority	High
Initial Status	New
Final Status	Closed – Fixed
Environment	Localhost
Browser	Google Chrome

2. Bug Description
When the user attempted to place an order, the system failed to create the order and displayed the following error message:

"Failed to create order. Please try again."

This issue prevented the user from completing the checkout process.
3. Steps to Reproduce
1. Open the ShopNest website.
2. Log in using a valid user account.
3. Browse the available products.
4. Add one or more products to the shopping cart.
5. Open the shopping cart.
6. Proceed to checkout.
7. Enter the required information.
8. Click the "Place Order" button.
4. Expected Result
The system should create the order successfully and display a confirmation message indicating that the order has been placed.
5. Actual Result (Before Fix)
The system failed to create the order and displayed the error message:

"Failed to create order. Please try again."

The order was not completed successfully.
6. Screenshot – Before Fix
Screenshot Name: BUG-001_TC-035_Before-Fix.png

Related Test Case: TC-035

Description: Screenshot showing the error message displayed when clicking the Place Order button.
7. Bug Fix
The order creation issue was identified and fixed. The Place Order functionality was tested again after applying the fix to ensure that the problem was resolved.
8. Retesting – After Fix
The following steps were performed:
1. Open the ShopNest website.
2. Log in using a valid account.
3. Add products to the shopping cart.
4. Proceed to checkout.
5. Click the "Place Order" button.
6. Verify the confirmation message.
7. Open the My Orders page.
8. Verify that the order was saved successfully.
Actual Result After Fix:

The system successfully created the order and displayed the following message:

"Order placed successfully!"

The created orders appeared successfully on the My Orders page with their Order IDs, dates, totals, and statuses.
9. Screenshots – After Fix
Screenshot 1
- Screenshot Name: BUG-001_TC-035_After-Fix.png
- Related Test Case: TC-035
- Description: Successful order placement confirmation message.
Screenshot 2
- Screenshot Name: BUG-001_TC-038_After-Fix.png
- Related Test Case: TC-038
- Description: My Orders page showing the saved orders.
10. Retesting Results
Test Case ID	Test Case Description	Result
TC-035	Place an order with valid information	Passed
TC-038	Verify that the order is saved	Passed

11. Bug Status
Status	Result
Initial Status	New
Fix Status	Fixed
Retesting Status	Passed
Final Status	Closed

12. Conclusion
The order creation issue was successfully fixed and retested. After applying the fix, the Place Order functionality worked correctly. The system successfully created orders, displayed a confirmation message, and saved the orders in the My Orders page.

Final Result: Passed

Bug Status: Closed