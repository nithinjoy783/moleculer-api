const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const HTTPServer = require("moleculer-web");
// Create the broker for node-1
// Define nodeID and set the communication bus
const brokerNode1 = new ServiceBroker({
    nodeID: "node-1",
    transporter: "NATS"
  });
// Create the "gateway" service
brokerNode1.createService({
    // Define service name
    name: "gateway",
    // Load the HTTP server
    mixins: [HTTPServer],
  
    settings: {
      routes: [
        {
          aliases: {
            // When the "GET /products" request is made the "listProducts" action of "products" service is executed
            "GET /user": "users.createUser",
            "GET /read" : "users.readUser",
            "GET /update/" : "users.updateUser",
            "GET /delete/" : "users.deleteUser"

          }
        }
      ]
    }
  });

// Create the broker for node-2
// Define nodeID and set the communication bus
const brokerNode2 = new ServiceBroker({
    nodeID: "node-2",
    transporter: "NATS"
});

// Create a Mongoose service for `user` entities
brokerNode2.createService({
    name: "users",
    mixins: [DbService],
    adapter: new MongoDBAdapter("mongodb+srv://user:user@moleculer-wurfx.mongodb.net/moleculeer",{ keepAlive : 1}),
    collection: "users",
    actions : {
        createUser() {
            return [
                brokerNode2.call("users.create", {
                    username: "nithin",
                    name: "Nithin Joy Jose",
                    status: 1
                }).then(console.log),
                brokerNode2.call("users.create", {
                    username: "paul",
                    name: "Paul Hamber",
                    status: 2
                }).then(console.log)
            ]
        },
        readUser() {
            return [
                brokerNode2.call("users.find")
                .then(console.log)
            ]
        },
        updateUser() {
            return [
                brokerNode2.call("users.update", { id: "5eba86447017fb27c06e420f", name: "PssDoe" }).
                then(console.log)
            ]
        },
        deleteUser() {
            return [
                brokerNode2.call("users.remove", { id: "55eba86447017fb27c06e4210" }).
                then(console.log)
            ]
        }
    }
});

Promise.all([brokerNode1.start(), brokerNode2.start()]);
