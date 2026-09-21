const { test, expect } = require('@playwright/test');
const path = require('path');
const { LoginPage } = require('../pages/LoginPage');
const { PimPage } = require('../pages/PimPage');
const { EmployeeDetailsPage } = require('../pages/EmployeeDetailsPage');
const { ApiClient } = require('../pages/ApiClient');
const { loadEmployeeData } = require('../utils/testData');

const username = process.env.ORANGE_USERNAME || 'Admin';
const password = process.env.ORANGE_PASSWORD || 'admin123';
const apiBaseURL = process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com';

test.describe('Employee Lifecycle Management', () => {
  test('create, edit, validate by API, delete and logout', async ({ page, request }) => {
    const loginPage = new LoginPage(page);
    const pimPage = new PimPage(page);
    const detailsPage = new EmployeeDetailsPage(page);
    const api = new ApiClient(request, apiBaseURL);
    const employee = loadEmployeeData();
    const profilePicture = path.join(__dirname, '..', 'assets', 'profile.png');

    await test.step('1. Login with valid credentials', async () => {
      await loginPage.open();
      await loginPage.login(username, password);
      await expect(loginPage.dashboardHeading, 'Dashboard should be visible after successful login').toBeVisible();
    });

    await test.step('2. Add a new employee using data-driven input', async () => {
      await pimPage.openPim();
      await pimPage.openAddEmployee();
      await pimPage.addEmployee(employee, profilePicture);
      await expect(page, 'Personal Details page should open after employee creation').toHaveURL(/viewPersonalDetails/);
      await expect(page.getByRole('heading', { name: 'Personal Details' }), 'Personal Details heading should be visible').toBeVisible();
    });

    let apiEmployeeId;
    await test.step('3. Simulate employee API record and cross-check create data', async () => {
      const response = await api.createEmployeeSnapshot(employee);
      expect(response.ok(), 'API create response should be successful').toBeTruthy();
      const body = await response.json();
      apiEmployeeId = body.id;
      expect(body.name, 'API name should match UI input').toBe(employee.fullName);
      expect(body.employeeId, 'API employeeId should match UI input').toBe(employee.employeeId);
    });

    await test.step('4. Search employee by Employee ID and edit job details', async () => {
      await pimPage.openEmployeeList();
      await pimPage.searchByEmployeeId(employee.employeeId);
      const row = pimPage.rowByEmployeeId(employee.employeeId);
      await expect(row, `Employee ${employee.employeeId} should exist in search results`).toBeVisible();

      await pimPage.openEmployeeFromSearch(employee.employeeId);
      await detailsPage.openJobTab();
      await detailsPage.updateJob(employee.jobTitle, employee.employmentStatus);
      await expect(detailsPage.successToast, 'Success message should appear after updating job information').toBeVisible();

      await expect.poll(
        async () => detailsPage.getSelectedValue(detailsPage.jobTitleDropdown),
        { message: 'Updated Job Title should remain selected' }
      ).toBe(employee.jobTitle);

      await expect.poll(
        async () => detailsPage.getSelectedValue(detailsPage.employmentStatusDropdown),
        { message: 'Updated Employment Status should remain selected' }
      ).toBe(employee.employmentStatus);
    });

    await test.step('5. Validate updated employee data using public API simulator', async () => {
      const response = await api.updateEmployeeSnapshot(apiEmployeeId, employee);
      expect(response.ok(), 'API update response should be successful').toBeTruthy();
      const body = await response.json();
      expect(body.name, 'API employee name should match UI employee').toBe(employee.fullName);
      expect(body.employeeId, 'API employee ID should match UI employee ID').toBe(employee.employeeId);
      expect(body.jobTitle, 'API job title should match updated UI value').toBe(employee.jobTitle);
      expect(body.employmentStatus, 'API employment status should match updated UI value').toBe(employee.employmentStatus);
    });

    await test.step('6. Delete employee and verify removal in UI and API', async () => {
      await pimPage.openEmployeeList();
      await pimPage.searchByEmployeeId(employee.employeeId);
      await expect(pimPage.rowByEmployeeId(employee.employeeId), 'Employee should be visible before delete').toBeVisible();
      await pimPage.deleteEmployeeFromSearch(employee.employeeId);

      await pimPage.searchByEmployeeId(employee.employeeId);
      await expect(pimPage.rowByEmployeeId(employee.employeeId), 'Deleted employee should not appear in UI search results').toHaveCount(0);

      const response = await api.deleteEmployeeSnapshot(apiEmployeeId);
      expect(response.ok(), 'API delete response should be successful').toBeTruthy();
    });

    await test.step('7. Logout and verify session is invalidated', async () => {
      await loginPage.logout();
      await expect(page, 'User should return to login page after logout').toHaveURL(/auth\/login/);
      await expect(loginPage.loginButton, 'Login button should be visible after logout').toBeVisible();

      await page.goto('/web/index.php/dashboard/index');
      await expect(page, 'Protected dashboard URL should redirect to login after logout').toHaveURL(/auth\/login/);
    });
  });
});
