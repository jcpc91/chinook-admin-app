const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = ['../share/proto/employee.proto'];

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

const employee_proto = grpc.loadPackageDefinition(packageDefinition).employee;
module.exports = employee_proto;
