const employee_proto = require('./protoloader');
const grpc = require('@grpc/grpc-js');

const client = new employee_proto.EmployeeService('localhost:50052', grpc.credentials.createInsecure());

module.exports = {
    findEmployeeByEmail: (email) => {
        return new Promise((resolve, reject) => {
            client.FindEmployeeByEmail({email: email}, function(err, response) {
                if (err) {
                    if (err.code == 5) {
                        reject('Employee not found🤷‍♀️');
                    } else {
                        reject(err);
                    }
                }
                if(!response){
                    reject('Employee not found🤷‍♀️');
                }
                resolve(response);
            });
        });
    }
}
