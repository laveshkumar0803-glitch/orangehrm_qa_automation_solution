const path = require('path');

class PimPage {
  constructor(page) {
    this.page = page;
    this.pimMenu = page.getByRole('link', { name: 'PIM' });
    this.addEmployeeTab = page.getByRole('link', { name: 'Add Employee' });
    this.employeeListTab = page.getByRole('link', { name: 'Employee List' });

    this.firstName = page.getByPlaceholder('First Name');
    this.middleName = page.getByPlaceholder('Middle Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.employeeId = page.locator('label:has-text("Employee Id")').locator('xpath=following::input[1]');
    this.photoInput = page.locator('input[type="file"]');
    this.saveButton = page.getByRole('button', { name: 'Save' });

    this.employeeIdSearch = page.locator('label:has-text("Employee Id")').locator('xpath=following::input[1]');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordsTable = page.locator('.oxd-table-body');
  }

  async openPim() {
    await this.pimMenu.click();
  }

  async openAddEmployee() {
    await this.addEmployeeTab.click();
  }

  async addEmployee(employee, profilePicturePath) {
    await this.firstName.fill(employee.firstName);
    if (employee.middleName) await this.middleName.fill(employee.middleName);
    await this.lastName.fill(employee.lastName);

    await this.employeeId.fill('');
    await this.employeeId.fill(employee.employeeId);

    await this.photoInput.setInputFiles(path.resolve(profilePicturePath));
    await this.saveButton.click();
  }

  async openEmployeeList() {
    await this.employeeListTab.click();
  }

  async searchByEmployeeId(employeeId) {
    await this.employeeIdSearch.fill(employeeId);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  rowByEmployeeId(employeeId) {
    return this.page.locator('.oxd-table-card').filter({ hasText: employeeId }).first();
  }

  async openEmployeeFromSearch(employeeId) {
    const row = this.rowByEmployeeId(employeeId);
    await row.getByRole('button').nth(0).click();
  }

  async deleteEmployeeFromSearch(employeeId) {
    const row = this.rowByEmployeeId(employeeId);
    const buttons = row.getByRole('button');
    await buttons.nth(1).click();
    await this.page.getByRole('button', { name: /Yes, Delete/i }).click();
  }
}

module.exports = { PimPage };
