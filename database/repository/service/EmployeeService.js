class EmployeeService {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async getAllEmployees() {
    return await this.customerRepository.getAll();
  }

  async getEmployeeById(id) {
    return await this.customerRepository.getById(id);
  }

  async createEmployee(employeeData) {
    // Add any business logic/validation before creating
    // For example, check for required fields, data types, etc.
    if (!employeeData || !employeeData.FirstName || !employeeData.LastName) {
      throw new Error(
        "FirstName and LastName are required to create an employee.",
      );
    }
    return await this.customerRepository.create(employeeData);
  }

  async updateEmployee(id, employeeData) {
    // Add any business logic/validation before updating
    const existingEmployee = await this.customerRepository.getById(id);
    if (!existingEmployee) {
      return null; // Or throw an error: throw new Error(`Employee with ID ${id} not found.`);
    }
    return await this.customerRepository.update(id, employeeData);
  }

  async deleteEmployee(id) {
    // Add any business logic before deleting (e.g., check for dependencies)
    const existingEmployee = await this.customerRepository.getById(id);
    if (!existingEmployee) {
      // Consider if this should throw an error or return a specific status
      // For now, repository handles non-existing delete gracefully (returns false)
      // throw new Error(`Employee with ID ${id} not found, cannot delete.`);
    }
    return await this.customerRepository.delete(id);
  }

  // Example of a more complex business logic method
  async getEmployeesByDepartment(departmentName) {
    const allEmployees = await this.customerRepository.getAll();
    // This assumes employee objects have a 'Department' property
    return allEmployees.filter((emp) => emp.Department === departmentName);
  }

  async getEmployeeFullName(id) {
    const employee = await this.getEmployeeById(id);
    if (employee) {
      return `${employee.FirstName} ${employee.LastName}`;
    }
    return null;
  }

  async getEmployeeByEmail(email) {
    return await this.customerRepository.getByEmail(email);
  }
}

module.exports = EmployeeService;
