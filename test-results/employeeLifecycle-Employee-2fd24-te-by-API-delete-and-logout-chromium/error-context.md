# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employeeLifecycle.spec.js >> Employee Lifecycle Management >> create, edit, validate by API, delete and logout
- Location: tests\employeeLifecycle.spec.js:14:3

# Error details

```
Error: Dashboard should be visible after successful login

expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Dashboard' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Dashboard should be visible after successful login getByRole('heading', { name: 'Dashboard' }) with timeout 10000ms
  - waiting for getByRole('heading', { name: 'Dashboard' })
    - waiting for navigation to finish...
    - navigated to "https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index"

```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const path = require('path');
  3   | const { LoginPage } = require('../pages/LoginPage');
  4   | const { PimPage } = require('../pages/PimPage');
  5   | const { EmployeeDetailsPage } = require('../pages/EmployeeDetailsPage');
  6   | const { ApiClient } = require('../pages/ApiClient');
  7   | const { loadEmployeeData } = require('../utils/testData');
  8   | 
  9   | const username = process.env.ORANGE_USERNAME || 'Admin';
  10  | const password = process.env.ORANGE_PASSWORD || 'admin123';
  11  | const apiBaseURL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';
  12  | 
  13  | test.describe('Employee Lifecycle Management', () => {
  14  |   test('create, edit, validate by API, delete and logout', async ({ page, request }) => {
  15  |     const loginPage = new LoginPage(page);
  16  |     const pimPage = new PimPage(page);
  17  |     const detailsPage = new EmployeeDetailsPage(page);
  18  |     const api = new ApiClient(request, apiBaseURL);
  19  |     const employee = loadEmployeeData();
  20  |     const profilePicture = path.join(__dirname, '..', 'assets', 'profile.png');
  21  | 
  22  |     await test.step('1. Login with valid credentials', async () => {
  23  |       await loginPage.open();
  24  |       await loginPage.login(username, password);
> 25  |       await expect(loginPage.dashboardHeading, 'Dashboard should be visible after successful login').toBeVisible();
      |                                                                                                      ^ Error: Dashboard should be visible after successful login
  26  |     });
  27  | 
  28  |     await test.step('2. Add a new employee using data-driven input', async () => {
  29  |       await pimPage.openPim();
  30  |       await pimPage.openAddEmployee();
  31  |       await pimPage.addEmployee(employee, profilePicture);
  32  |       await expect(page, 'Personal Details page should open after employee creation').toHaveURL(/viewPersonalDetails/);
  33  |       await expect(page.getByRole('heading', { name: 'Personal Details' }), 'Personal Details heading should be visible').toBeVisible();
  34  |     });
  35  | 
  36  |     let apiEmployeeId;
  37  |     await test.step('3. Simulate employee API record and cross-check create data', async () => {
  38  |       const response = await api.createEmployeeSnapshot(employee);
  39  |       expect(response.ok(), 'API create response should be successful').toBeTruthy();
  40  |       const body = await response.json();
  41  |       apiEmployeeId = body.id;
  42  |       expect(body.name, 'API name should match UI input').toBe(employee.fullName);
  43  |       expect(body.employeeId, 'API employeeId should match UI input').toBe(employee.employeeId);
  44  |     });
  45  | 
  46  |     await test.step('4. Search employee by Employee ID and edit job details', async () => {
  47  |       await pimPage.openEmployeeList();
  48  |       await pimPage.searchByEmployeeId(employee.employeeId);
  49  |       const row = pimPage.rowByEmployeeId(employee.employeeId);
  50  |       await expect(row, `Employee ${employee.employeeId} should exist in search results`).toBeVisible();
  51  | 
  52  |       await pimPage.openEmployeeFromSearch(employee.employeeId);
  53  |       await detailsPage.openJobTab();
  54  |       await detailsPage.updateJob(employee.jobTitle, employee.employmentStatus);
  55  |       await expect(detailsPage.successToast, 'Success message should appear after updating job information').toBeVisible();
  56  | 
  57  |       await expect.poll(
  58  |         async () => detailsPage.getSelectedValue(detailsPage.jobTitleDropdown),
  59  |         { message: 'Updated Job Title should remain selected' }
  60  |       ).toBe(employee.jobTitle);
  61  | 
  62  |       await expect.poll(
  63  |         async () => detailsPage.getSelectedValue(detailsPage.employmentStatusDropdown),
  64  |         { message: 'Updated Employment Status should remain selected' }
  65  |       ).toBe(employee.employmentStatus);
  66  |     });
  67  | 
  68  |     await test.step('5. Validate updated employee data using public API simulator', async () => {
  69  |       const response = await api.updateEmployeeSnapshot(apiEmployeeId, employee);
  70  |       expect(response.ok(), 'API update response should be successful').toBeTruthy();
  71  |       const body = await response.json();
  72  |       expect(body.name, 'API employee name should match UI employee').toBe(employee.fullName);
  73  |       expect(body.employeeId, 'API employee ID should match UI employee ID').toBe(employee.employeeId);
  74  |       expect(body.jobTitle, 'API job title should match updated UI value').toBe(employee.jobTitle);
  75  |       expect(body.employmentStatus, 'API employment status should match updated UI value').toBe(employee.employmentStatus);
  76  |     });
  77  | 
  78  |     await test.step('6. Delete employee and verify removal in UI and API', async () => {
  79  |       await pimPage.openEmployeeList();
  80  |       await pimPage.searchByEmployeeId(employee.employeeId);
  81  |       await expect(pimPage.rowByEmployeeId(employee.employeeId), 'Employee should be visible before delete').toBeVisible();
  82  |       await pimPage.deleteEmployeeFromSearch(employee.employeeId);
  83  | 
  84  |       await pimPage.searchByEmployeeId(employee.employeeId);
  85  |       await expect(pimPage.rowByEmployeeId(employee.employeeId), 'Deleted employee should not appear in UI search results').toHaveCount(0);
  86  | 
  87  |       const response = await api.deleteEmployeeSnapshot(apiEmployeeId);
  88  |       expect(response.ok(), 'API delete response should be successful').toBeTruthy();
  89  |     });
  90  | 
  91  |     await test.step('7. Logout and verify session is invalidated', async () => {
  92  |       await loginPage.logout();
  93  |       await expect(page, 'User should return to login page after logout').toHaveURL(/auth\/login/);
  94  |       await expect(loginPage.loginButton, 'Login button should be visible after logout').toBeVisible();
  95  | 
  96  |       await page.goto('/web/index.php/dashboard/index');
  97  |       await expect(page, 'Protected dashboard URL should redirect to login after logout').toHaveURL(/auth\/login/);
  98  |     });
  99  |   });
  100 | });
  101 | 
```