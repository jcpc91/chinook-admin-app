const { findEmployeeByEmail } = require('./employee_client');
const grpc = require('@grpc/grpc-js');

// Mock the gRPC client
jest.mock('@grpc/grpc-js');

// Mock the protoloader
jest.mock('./protoloader', () => {
  const mockClient = {
    FindEmployeeByEmail: jest.fn()
  };

  return {
    EmployeeService: jest.fn().mockImplementation(() => mockClient)
  };
});

describe('Testing findEmployeeByEmail function', () => {
  let mockClient;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();

    // Get the mock client instance
    const employee_proto = require('./protoloader');
    mockClient = new employee_proto.EmployeeService();
  });

  it('should call findEmployeeByEmail function', async () => {
    // Mock the gRPC response
    const mockEmployee = {
      EmployeeId: 1,
      FirstName: 'John',
      LastName: 'Doe',
      Title: 'Developer',
      ReportsTo: null,
      BirthDate: '1990-01-01',
      HireDate: '2020-01-01',
      Address: '123 Main St',
      City: 'Anytown',
      State: 'CA',
      Country: 'USA',
      PostalCode: '12345',
      Phone: '123-456-7890',
      Fax: '123-456-7891',
      Email: 'john@email.com'
    };

    // Setup the mock implementation
    mockClient.FindEmployeeByEmail.mockImplementation((request, callback) => {
      callback(null, mockEmployee);
    });

    const email = 'john@email.com';
    const response = await findEmployeeByEmail(email);

    // Verify the function was called with the correct parameters
    expect(mockClient.FindEmployeeByEmail).toHaveBeenCalledWith(
      { email },
      expect.any(Function)
    );

    // Verify the response
    expect(response).toBeDefined();
    expect(response).toHaveProperty('EmployeeId');
    expect(response).toHaveProperty('FirstName', 'John');
    expect(response).toHaveProperty('LastName', 'Doe');
    expect(response).toHaveProperty('Title');
    expect(response).toHaveProperty('ReportsTo');
    expect(response).toHaveProperty('BirthDate');
    expect(response).toHaveProperty('HireDate');
    expect(response).toHaveProperty('Address');
    expect(response).toHaveProperty('City');
    expect(response).toHaveProperty('State');
    expect(response).toHaveProperty('Country');
    expect(response).toHaveProperty('PostalCode');
    expect(response).toHaveProperty('Phone');
    expect(response).toHaveProperty('Fax');
    expect(response).toHaveProperty('Email', email);
  });

  it('should handle errors from the gRPC service', async () => {
    // Setup the mock to simulate an error
    const error = new Error('Employee not found');
    mockClient.FindEmployeeByEmail.mockImplementation((request, callback) => {
      callback(error, null);
    });

    const email = 'nonexistent@email.com';

    // Expect the promise to be rejected with the error
    await expect(findEmployeeByEmail(email)).rejects.toThrow('Employee not found');
  });
});
