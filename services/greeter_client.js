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

// Crea un cliente para el servicio Greeter
function main() {
  const client = new helloworld_proto.Greeter('localhost:50051',
                                       grpc.credentials.createInsecure());
  const user = 'Node.js';
  client.sayHello({name: user}, function(err, response) {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Saludo recibido:', response.message);
  });
}

main();
