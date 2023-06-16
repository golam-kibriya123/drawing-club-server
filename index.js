const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
// middleware
app.use(cors());
app.use(express.json());



// database
const pass = process.env.DB_PASS;
const user = process.env.DB_USER;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${user}:${pass}@cluster0.wrk7b1c.mongodb.net/?retryWrites=true&w=majority`;


app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token })
})
app.get('/jwt', (req, res) => {
    res.send('ok')
})
app.get('/', (req, res) => {
    res.send('drawing club is running ');
    console.log(pass)
    console.log(user)
});


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
        client.connect();
        const classesCollection = client.db('drawingDB').collection('classes');
        const instructorsCollection = client.db('drawingDB').collection('instructors');
        const studentsCollection = client.db('drawingDB').collection('students');
        const usersCollection = client.db('drawingDB').collection('users');

        app.get('/classes', async (req, res) => {
            const query = {};
            const option = {};
            const result = await classesCollection.find({}).toArray();
            res.send(result)
        });
        app.get('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await classesCollection.find(query).toArray();
            res.send(result)

        });
        app.patch('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateClass = req.body;
            const update = {
                $set: {
                    price: updateClass.price,
                    seat: updateClass.price,
                    class_photo: updateClass.class_photo,
                    class_name: updateClass.class_name,

                }
            };



            const result = await classesCollection.updateOne(filter, update, options);
            res.send(result)
        })

        app.post('/classes', async (req, res) => {
            const added_class = req.body;
            const result = await classesCollection.insertOne(added_class);
            res.send(result)

        });


        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result)
        });
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: new ObjectId(id) };
            const updateRole = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateRole);
            res.send(result)
        });
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const filter = { _id: new ObjectId(id) };
            const updateRole = {
                $set: {
                    role: 'instructor'
                },
            };
            const result = await usersCollection.updateOne(filter, updateRole);
            res.send(result)
        });
        app.get('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await usersCollection.find(filter).toArray();
            res.send(result)
        })
        app.post('/users', async (req, res) => {
            const add_user = req.body;
            const query = { email: add_user.email };
            const checkUser = await usersCollection.findOne(query);
            if (checkUser) {
                return res.send({ message: 'the user already added' });
            }
            const result = await usersCollection.insertOne(add_user);
            res.send(result)

        })




        app.get('/popularclass', async (req, res) => {
            const query = {}
            const option = { sort: { "enrolled": -1 }, };
            const result = await classesCollection.find(query, option).limit(6).toArray();
            res.send(result)
        });
        app.get('/instructors', async (req, res) => {
            const query = {};
            const option = {};
            const result = await instructorsCollection.find({}).toArray();
            res.send(result)
        });
        app.get('/popularinstructors', async (req, res) => {

            const option = {
                sort: { "enrolled_student": 1 }
            }
                ;
            const query = {};
            const result = await instructorsCollection.find(query, option).limit(6).toArray();
            res.send(result)

        })
        app.get('/students', async (req, res) => {
            const query = {};
            const option = {};
            const result = await studentsCollection.find({}).toArray();
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
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
