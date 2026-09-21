const fs = require('fs');
const path = require('path');

function loadEmployeeData() {
  const filePath = path.join(__dirname, '..', 'data', 'employee.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const uniquePart = `${Date.now()}`.slice(-6);

  return {
    ...data,
    employeeId: `${data.employeeIdPrefix}${uniquePart}`,
    fullName: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ')
  };
}

module.exports = { loadEmployeeData };
