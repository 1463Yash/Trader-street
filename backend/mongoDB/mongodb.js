const dotenv = require("dotenv");
dotenv.config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const db_username = process.env.db_username;
const db_password = process.env.db_password;

const uri = `mongodb://${db_username}:${db_password}@ac-yxciikc-shard-00-00.xtbxdhn.mongodb.net:27017,ac-yxciikc-shard-00-01.xtbxdhn.mongodb.net:27017,ac-yxciikc-shard-00-02.xtbxdhn.mongodb.net:27017/?ssl=true&replicaSet=atlas-qk3sq4-shard-0&authSource=admin&appName=Cluster0`;
// const uri = `mongodb+srv://${db_username}:${db_password}@cluster0.xtbxdhn.mongodb.net/TraderStreet?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        // strict: true,
        deprecationErrors: true,
    }
});

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ MongoDB connected!");
        return client.db("Trader's_street");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}

module.exports = connectDB;