import express from "express";
import { MongoClient, ObjectId } from 'mongodb';
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
const booking = db.collection("booking");

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
});

app.get("/destinations/:id", async(req, res)=>{
  const {id} =  req.params;
  const result = await collection.findOne({_id: new ObjectId(id)});
  res.send(result);
});

app.patch('/destinations/:id', async(req,res)=>{
  const id = req.params.id;
  const body = req.body;
  const result = await collection.updateOne(
    {_id: new ObjectId(id)},
    {$set:body}
  );

 res.json(result);
});

app.delete('/destinations/:id', async(req,res)=>{
  const id = req.params.id;
  const result = await collection.deleteOne({_id: new ObjectId(id)});
  res.send(result);
});

app.post('/booking', async(req,res)=>{
  const data = req.body;
  const result = await booking.insertOne(data);
  res.send(result);
});

app.get('/booking/:email', async(req,res)=>{
  const email = req.params.email;
  const result = await booking.find({email:email}).toArray();
  res.json(result);
});

app.delete('/booking/:id', async(req,res)=>{
  const id = req.params.id;
  const result = await booking.deleteOne({_id: id});
  res.send(result);
})

app.listen(PORT, ()=>{
    console.log(`Server is running at ${PORT}`);
})