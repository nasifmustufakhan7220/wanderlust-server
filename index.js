import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import { createRemoteJWKSet, jwtVerify } from "jose";

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

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader);
  if (!authHeader) {
    return res.status(401).send({
      msg: "Unauthorized!",
    });
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
  if (!token || token === "undefined") {
    return res.status(401).send({
      msg: "Unauthorized!",
    });
  }
  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
  );

  console.log(JWKS);
  try {
    const { payload } = await jwtVerify(token, JWKS);
    next();
  } catch (error) {
    return res.status(500).send({ msg: "Server Error!" });
  }
};

const verifyBooking = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized!" });
  }

  const JWTKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
  );

  try {
    const { payload } = await jwtVerify(token, JWTKS);
    next();
  } catch (error) {
    return res.status(500).send({ msg: "Server Error!" });
  }
};
app.get("/", (req, res) => {
  res.send({ message: "Server is running successfully" });
});

app.post("/add-destination", verifyToken, async (req, res) => {
  const data = req.body;
  const result = await collection.insertOne(data);
  res.send(result);
});

app.get("/destinations", async (req, res) => {
  const result = await collection.find({}).toArray();
  res.send(result);
});

app.get("/destinations/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await collection.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.patch("/destinations/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: body },
  );

  res.json(result);
});

app.delete("/destinations/:id", async (req, res) => {
  const id = req.params.id;
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.post("/booking", async (req, res) => {
  const data = req.body;
  const result = await booking.insertOne(data);
  res.send(result);
});

app.get("/booking/:email", verifyBooking, async (req, res) => {
  const email = req.params.email;
  const result = await booking.find({ email: email }).toArray();
  res.json(result);
});

app.delete("/booking/:id", async (req, res) => {
  const id = req.params.id;
  const result = await booking.deleteOne({ _id: id });
  res.send(result);
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});


export default app;