const { Client } = require("cassandra-driver");

let client = null;

const cassandra ={

  connectClient: async() => {
    try{
      client = new Client({
        cloud: {
        secureConnectBundle: "./secure-connect-chatting-app.zip",
        },
        credentials: {
        username: process.env.ASTRA_DB_CLIENT_ID, // CLIENT ID
        password: process.env.ASTRA_DB_CLIENT_SECRET, // CLIENT SECRET
        },
      });
      await client.connect();
      console.log("Cassandra Client Connected Successfully")
      return client;
    }
    catch(err){
      console.log("ERROR IN CONNECTING TO CASSANDRA CLIENT :: ", err);
    }
  },

  getClient: () => {return client},

  shutDown: async () => {
    client.shutdown();
  }
}

module.exports = cassandra