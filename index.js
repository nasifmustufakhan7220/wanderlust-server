import express from "express";
import { MongoClient } from 'mongodb';
import 'dotenv/config';
import cors from "cors"


const app = express();
const PORT = 8000;
app.use(cors());
app.use(express.json());


const client = new MongoClient(process.env.MONGO_URI);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoDb = await connectToMongoDB();
const db = mongoDb.db("wanderlust");
const collection = db.collection("destination");

app.get('/',(req,res)=>{
    res.send({message:"Server is running successfully"});
});

app.post('/add-destination', async(req, res)=>{
    const data = req.body;
    const result = await collection.insertOne(data);
    res.send(result);
});

app.get("/destinations", async(req,res)=>{
    const result = await collection.find({}).toArray();
    res.send(result);
})

app.listen(PORT, ()=>{
    console.log(`Server is running at ${PORT}`);
})