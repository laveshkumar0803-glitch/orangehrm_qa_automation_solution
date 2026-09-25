class ApiClient {
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL;
  }

  async createEmployeeSnapshot(employee) {
    return this.request.post(`${this.baseURL}/users`, {
      data: {
        name: employee.fullName,
        employeeId: employee.employeeId,
        jobTitle: employee.jobTitle,
        employmentStatus: employee.employmentStatus
      }
    });
  }

  async updateEmployeeSnapshot(id, employee) {
    return this.request.patch(`${this.baseURL}/users/${id}`, {
      data: {
        id,
        name: employee.fullName,
        employeeId: employee.employeeId,
        jobTitle: employee.jobTitle,
        employmentStatus: employee.employmentStatus
      }
    });
  }

  async deleteEmployeeSnapshot(id) {
    return this.request.delete(`${this.baseURL}/users/${id}`);
  }
}

module.exports = { ApiClient };
