const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = '../share/proto/helloworld.proto';

// Carga el archivo .proto
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const helloworld_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

// Implementa la función SayHello
function sayHello(call, callback) {
  callback(null, {message: 'Hola, ' + call.request.name + '!'});
}

// Crea y levanta el servidor
function main() {
  const server = new grpc.Server();
  server.addService(helloworld_proto.Greeter.service, {sayHello: sayHello});
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    server.start();
    console.log('Servidor gRPC iniciado en el puerto', port);
  });
}

main();
