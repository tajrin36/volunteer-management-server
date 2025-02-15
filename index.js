const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from HeroHand Server....');
});

// DB_USER = volunteer-management
// DB_PASS = PiQUsfCA70c2PbjI

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yg5xo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const db = client.db('valunteerManagement');
    const volunteerCollection = db.collection('volunteers');

    // save a volunteer data in db
    app.post('/add-volunteer', async (req, res) => {
      const volunteerData = req.body;
      const result = await volunteerCollection.insertOne(volunteerData);
      console.log(result);
      res.send(result);
    });

    // get all volunteer data from db
    app.get('/volunteers', async (req, res) => {
      const result = await volunteerCollection.find().toArray();
      res.send(result);
    });

    // get all data posted by a specific user
    app.get('/volunteers/:email', async (req, res) => {
      const email = req.params.email;
      const query = { 'organizer.email': email };
      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    // delete a post from db
    app.delete('/volunteer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.deleteOne(query);
      res.send(result);
    });

    // get a single post data by id from db
    app.get('/volunteer/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    // update data
    app.put('/update-volunteer/:id', async (req, res) => {
      const id = req.params.id; 
      const volunteerData = req.body;
      const updated = {
        $set: volunteerData,
      }
      const query = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const result = await volunteerCollection.updateOne(query,updated,options);
      console.log(result);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`Server running on port ${port}`));
