# Functional Coverage

| ID | Scenario | Expected Result |
|---|---|---|
| TC-01 | Login with valid Admin credentials | Dashboard is displayed |
| TC-02 | Navigate to PIM > Add Employee | Add Employee form is displayed |
| TC-03 | Create employee with JSON data and profile image | Employee is created and Personal Details page opens |
| TC-04 | Search newly created employee by Employee ID | Matching employee row is displayed |
| TC-05 | Update Job Title | Selected Job Title is saved and remains visible |
| TC-06 | Update Employment Status | Selected Employment Status is saved and remains visible |
| TC-07 | Create/update employee snapshot through public API simulator | API response matches UI employee values |
| TC-08 | Delete employee from UI | Employee no longer appears in UI search |
| TC-09 | Delete API snapshot | Successful API delete response is received |
| TC-10 | Logout | Login page is displayed |
| TC-11 | Access protected URL after logout | User is redirected to login page |
