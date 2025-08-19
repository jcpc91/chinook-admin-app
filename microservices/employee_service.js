const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const chance = require('chance').Chance();

const PROTO_PATH = '../share/proto/employee.proto';

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const employee_proto = grpc.loadPackageDefinition(packageDefinition).employee;


function FindEmployeeByEmail(call, callback) {
  // Simulate a database lookup
  const employee = {
        "EmployeeId": chance.integer({ min: 1, max: 100 }),
        "LastName": chance.last(),
        "FirstName": chance.first(),
        "Title": chance.pickone(['Manager', 'Sales Representative', 'Engineer']),
        "ReportsTo": chance.integer({ min: 1, max: 10 }),
        "BirthDate": chance.date({ year: chance.year({ min: 1950, max: 2000 }) }).toISOString(),
        "HireDate": chance.date({ year: chance.year({ min: 2000, max: 2023 }) }).toISOString(),
        "Address": chance.address(),
        "City": chance.city(),
        "State": chance.state(),
        "Country": chance.country(),
        "PostalCode": chance.postcode(),
        "Phone": chance.phone(),
        "Fax": chance.phone(),
        "Email": chance.email(),
        "Role": chance.pickone(['Admin', 'User', 'Guest']),
    }

    if (employee) {
        callback(null, employee);
    }
    else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: "Employee not found"
        });
    }
}

if (require.main === module) {
    const server = new grpc.Server();
    server.addService(employee_proto.EmployeeService.service, {FindEmployeeByEmail: FindEmployeeByEmail});
    server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
        console.error(err);
        return;
        }
        server.start();
        console.log('Servidor gRPC iniciado en el puerto', port);
    });
}
