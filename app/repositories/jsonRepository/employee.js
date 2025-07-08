const IBaseRepository = require('../IBaseRepository');
const fs = require('fs').promises;
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

class EmployeeRepository extends IBaseRepository {
  constructor() {
    super();
  }

  async _readData() {
    try {
      const data = await fs.readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty data structure
        return { employees: [] };
      }
      throw error;
    }
  }

  async _writeData(data) {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getAll() {
    const data = await this._readData();
    return data.employees || [];
  }

  async getById(id) {
    const data = await this._readData();
    const employee = (data.employees || []).find(e => e.EmployeeId === parseInt(id));
    return employee || null;
  }

  async create(entity) {
    const data = await this._readData();
    if (!data.employees) {
      data.employees = [];
    }
    // Basic ID generation (can be improved)
    const newId = data.employees.length > 0 ? Math.max(...data.employees.map(e => e.EmployeeId)) + 1 : 1;
    const newEmployee = { EmployeeId: newId, ...entity };
    data.employees.push(newEmployee);
    await this._writeData(data);
    return newEmployee;
  }

  async update(id, entity) {
    const data = await this._readData();
    if (!data.employees) {
      return null;
    }
    const index = data.employees.findIndex(e => e.EmployeeId === parseInt(id));
    if (index === -1) {
      return null;
    }
    data.employees[index] = { ...data.employees[index], ...entity, EmployeeId: parseInt(id) };
    await this._writeData(data);
    return data.employees[index];
  }

  async delete(id) {
    const data = await this._readData();
    if (!data.employees) {
      return false;
    }
    const initialLength = data.employees.length;
    data.employees = data.employees.filter(e => e.EmployeeId !== parseInt(id));
    if (data.employees.length < initialLength) {
      await this._writeData(data);
      return true;
    }
    return false;
  }
}

module.exports = EmployeeRepository;
