const EmployeeService = require('./EmployeeService');
const EmployeeRepository = require('../sqliteRepository/EmployeeRepository');
const repository = new EmployeeService(new EmployeeRepository());
describe('EmployeeService', () => {
    const existingEmail = 'ardulobi@guib.fm';
    const nonExistingEmail = 'nonexistent@example.com';

    it('should find employee by email', async () => {
        const employee = await repository.getEmployeeByEmail(existingEmail);

        expect(employee).toBeDefined();
        expect(employee).toHaveProperty('Email', existingEmail);
        expect(employee).toHaveProperty('id', 1);
    });
    it('should not find employee by email', async() => {
        const e = await repository.getEmployeeByEmail(nonExistingEmail);
        expect(e).toBeUndefined();
    })
});
