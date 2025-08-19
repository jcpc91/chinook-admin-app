/**
 * server gRPC de employee expone servicios para acceder a la base de datos de employees
 * @file employee_service.js
 * @author
 * @brief
 * @version 0.1
 * @date 2025-08-19
 *
 * @copyright Copyright (c) 2025
 *
 */
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');


const EmployeeService = require('../database/repository/service/EmployeeService')
const EmployeeRepository = require('../database/repository/sqliteRepository/EmployeeRepository')

const repository = new EmployeeService(new EmployeeRepository());

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


async function FindEmployeeByEmail(call, callback) {
    const email = call.request.email;
  // Simulate a database lookup
  const employee = await repository.getEmployeeByEmail(email);
  console.log(employee);

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
