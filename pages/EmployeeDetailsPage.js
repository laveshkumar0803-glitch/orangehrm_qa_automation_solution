class EmployeeDetailsPage {
  constructor(page) {
    this.page = page;
    this.jobTab = page.getByRole('link', { name: 'Job' });
    this.jobTitleDropdown = page.locator('label:has-text("Job Title")').locator('xpath=following::div[contains(@class,"oxd-select-wrapper")][1]');
    this.employmentStatusDropdown = page.locator('label:has-text("Employment Status")').locator('xpath=following::div[contains(@class,"oxd-select-wrapper")][1]');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.successToast = page.locator('.oxd-toast').filter({ hasText: /Success/i });
  }

  async openJobTab() {
    await this.jobTab.click();
  }

  async selectDropdown(dropdown, value) {
    await dropdown.click();
    const option = this.page.getByRole('option', { name: value });
    await option.click();
  }

  async updateJob(jobTitle, employmentStatus) {
    await this.selectDropdown(this.jobTitleDropdown, jobTitle);
    await this.selectDropdown(this.employmentStatusDropdown, employmentStatus);
    await this.saveButton.click();
  }

  async getSelectedValue(dropdown) {
    return (await dropdown.locator('.oxd-select-text-input').innerText()).trim();
  }
}

module.exports = { EmployeeDetailsPage };
