const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
// middleware
app.use(cors());
app.use(express.json());



// database
const pass = process.env.DB_PASS;
const user = process.env.DB_USER;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.wrk7b1c.mongodb.net/?retryWrites=true&w=majority`;

app.get('/', (req, res) => {
    res.send('drawing club is running ');
    console.log(pass)
    console.log(user)
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const classesCollection = client.db('drawingDB').collection('classes');


        app.get('/classes', async (req, res) => {
            const query = {};
            const option = {};
            const result = await classesCollection.find({}).toArray();
            res.send(result)
        });
        app.get('/instructors', async (req, res) => {
            const query = {};
            const option = {};
            const result = await instructorsCollection.find({}).toArray();
            res.send(result)
        });

       







        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('the port is running on port', port)
})