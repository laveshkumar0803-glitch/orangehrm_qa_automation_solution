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
    return this.request.put(`${this.baseURL}/users/${id}`, {
      data: {
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
