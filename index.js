const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const app = express();
const cors = require("cors");
const { createRemoteJWKSet } = require("jose-cjs");
const port = 5000;
app.use(cors());
app.use(express.json());


const uri = process.env.MONGODB_URI;
const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))
console.log(JWKS);



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const logger= (req,res,next)=>{
        next()
    }

// const verifyToken = async (req, res, next) => {
//   try {
//     const authorization = req.headers.authorization;

//     if (!authorization) {
//       return res.status(401).json({
//         message: "Unauthorized",
//       });
//     }

//     const token = authorization.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         message: "No token found",
//       });
//     }

//     const { payload } = await jwtVerify(token, JWKS);

//     req.user = payload;

//     next();
//   } catch (error) {
//     console.log(error);

//     return res.status(401).json({
//       message: "Invalid token",
//     });
//   }
// };


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const db = client.db("petsdb");
    const petsCollection = db.collection("pets");
    const adoptingCollection = db.collection("adopting");

    // -------
    app.get("/addpet", async (req, res) => {
      const result = await petsCollection.find().toArray();
      res.send(result);
    });
    // -------
    app.post("/addpet", async (req, res) => {
      const addpetData = req.body;
      console.log(addpetData);
      const result = await petsCollection.insertOne(addpetData);
      res.send(result);
    });
    // -------
    app.delete("/addpet/:id", async (req, res) => {
      const { id } = req.params;
      const result = await petsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    app.patch("/addpet/:id", async (req, res) => {
      const { id } = req.params;
      const updatedData = req.body;
      const result = await petsCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set: updatedData}
      );
      res.send(result);
    });
    // -------
app.get("/pets", async (req, res) => {
  const searchTerm = req.query.searchTerm || "";
  const species = req.query.species || "";

  const query = {};

  // SEARCH
  if (searchTerm) {
    query.$or = [
      {
        petName: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        breed: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        category: {
          $regex: searchTerm,
          $options: "i",
        },
      },
    ];
  }

  

  const result = await petsCollection
    .find(query)
    .toArray();

  res.send(result);
});
    // ----token---
    app.get("/pets/:petId", async (req, res) => {
      const { petId } = req.params;
      const query = { _id: new ObjectId(petId) };
      const result = await petsCollection.findOne(query);
      res.send(result);
    });

    // --------------
    app.get("/featured", async (req, res) => {
      const cursor = petsCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // ----------------
    app.get("/adopting/:userId", async (req, res) => {
      const { userId } = req.params;
      const result = await adoptingCollection
        .find({ userId: userId })
        .toArray();
      res.send(result);
    });
  
    // ---------------
    app.post("/adopting", async (req, res) => {
      const adoptingData = req.body;
      const result = await adoptingCollection.insertOne(adoptingData);
      res.send(result);
    });
    // ----------------
    app.delete("/adopting/:petId", async (req, res) => {
      const { petId } = req.params;
      const result = await adoptingCollection.deleteOne({
        _id: new ObjectId(petId),
      });
      res.send(result);
    });

    // --------------

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
