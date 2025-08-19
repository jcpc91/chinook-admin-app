const EmployeeService = require('./EmployeeService');
const EmployeeRepository = require('../sqliteRepository/EmployeeRepository');
const repository = new EmployeeService(new EmployeeRepository());
describe('EmployeeService', () => {
    it('should find employee by email', async () => {
        const employee = await repository.getEmployeeByEmail('ardulobi@guib.fm');
        console.table(employee);
        expect(employee).toBeDefined();
    });
    it('should not find employee by email', async() => {
        const e = await repository.getEmployeeByEmail('nonexistent@email.com');
        expect(e).toBeUndefined();
    })
});
