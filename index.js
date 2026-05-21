const express = require("express");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();
const app = express();
const cors = require("cors");
const port = 5000;
app.use(cors());
app.use(express.json());

// pets-jungle
//

const uri =
  "mongodb+srv://pets-jungle:vvSyNeSAhoBYTG8Y@cluster0.qtracpu.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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
    //  // ----------------
    // app.delete('/adopting/:petId',async(req,res)=>{
    //   const{petId} =req.params;
    //   const result= await adoptingCollection.deleteOne({_id: new ObjectId(petId)})
    //   res.send(result)
    // })
    // -------
    app.get("/pets", async (req, res) => {
      const cursor = petsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // -------
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
