const { findEmployeeByEmail } = require('../share/proto_client_services/employee_client');

describe('findEmployeeByEmail - Integration Test', () => {
    // Test with a known existing email in your test database
    const existingEmail = 'ardulobi@guib.fm';
    const nonExistingEmail = 'nonexistent@example.com';

    it('should find employee by email', async () => {
        // Act
        const employee = await findEmployeeByEmail(existingEmail);
        console.table(employee);
        // Assert
        expect(employee).toBeDefined();
        expect(employee).toHaveProperty('Email', existingEmail);
        // Add more assertions based on your employee object structure
    });

    it('should throw error when employee is not found', async () => {
        // Act & Assert
        await expect(findEmployeeByEmail(nonExistingEmail))
            .rejects
            .toThrow('Employee not found');
    });

    // Add a test for error handling if needed
    it('should handle gRPC server errors', async () => {
        // This test assumes the server might be down or return an error
        // You might want to test this with an invalid server configuration
        // or by temporarily stopping the gRPC server
        await expect(findEmployeeByEmail('invalid-format'))
            .rejects
            .toThrow();
    });
});
