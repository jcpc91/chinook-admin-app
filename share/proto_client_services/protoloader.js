const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const PROTO_PATH = [ path.join(__dirname, 'employee.proto')];
console.log(PROTO_PATH)
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
