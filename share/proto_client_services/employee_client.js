const employee_proto = require('./protoloader');
const grpc = require('@grpc/grpc-js');

const client = new employee_proto.EmployeeService('localhost:50052', grpc.credentials.createInsecure());

module.exports = {
    findEmployeeByEmail: (email) => {
        return new Promise((resolve, reject) => {
            client.FindEmployeeByEmail({email: email}, function(err, response) {
                if (err) {
                    console.error('Error:', err);
                    reject(err);
                }
                resolve(response);
            });
        });
    }
}
