const { findEmployeeByEmail } = require('../share/proto_client_services/employee_client');

describe('findEmployeeByEmail - Integration Test', () => {
    // Test with a known existing email in your test database
    const existingEmail = 'ardulobi@guib.fm';
    const nonExistingEmail = 'nonexistent@example.com';

    it('should find employee by email', async () => {
        // Act
        const employee = await findEmployeeByEmail(existingEmail);

        expect(employee).toBeDefined();
        expect(employee).toHaveProperty('Email', existingEmail);
        expect(employee).toHaveProperty('id', 1);
        // Add more assertions based on your employee object structure
    });

    it('should throw error when employee is not found', async () => {
        // Act & Assert
        try {
            await findEmployeeByEmail(nonExistingEmail)
        } catch (error) {
            expect(error).toBe('Employee not found');
        }

    });


});
