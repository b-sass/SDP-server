import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.DB_URI;
const database = "SDP";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let connection;

try {
  // Connect the client to the server (optional starting in v4.7)
  connection = await client.connect();
  // Send a ping to confirm a successful connection
} catch(err) {
  console.error(err);
}
let db = connection.db(database);


export default db;