const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
// middleware
app.use(cors());
app.use(express.json());
// access key
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split('')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        };
        req.decoded = decoded;
        next()
    })
}

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
        const usersCollection = client.db('drawingDB').collection('users');
        const selectedClassCollection = client.db('drawingBD').collection('selectedClasses')

        app.get('/classes', async (req, res) => {
            const query = { state: "Approved" };
            // const option = {};
            const result = await classesCollection.find(query).toArray();
            res.send(result)
        });
        app.get('/myclasses', async (req, res) => {
            const mail = req.query.email;
            const query = { instructor_email: mail }
            console.log(mail);
            const result = await classesCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/classes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await classesCollection.find(query).toArray();
            res.send(result)

        });
        app.patch('/classes/state/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateClass = req.body;
            const update = {
                $set: {
                    state: updateClass.state

                }
            };

            const result = await classesCollection.updateOne(filter, update, options);
            res.send(result)
        })
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
        // selected classes
        app.post('/classes/selected', async (req, res) => {
            const selectedClass = req.body;
            const result = await selectedClassCollection.insertOne(selectedClass);
            res.send(result);

        });
        app.get('/classes/selected', async (req, res) => {
            const result = await selectedClassCollection.find().toArray();
            res.send(result)
        })


        app.get('/users', async (req, res) => {

            const result = await usersCollection.find().toArray();
            res.send(result)
        });
        app.get('/users/email', async (req, res) => {
            const mail = req.query.email;
            const query = { email: mail }
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        });
        app.get('/instructors', async (req, res) => {
            const query = {}
        })
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

        });

        app.get('/instructor', async (req, res) => {
            const query = { role: "instructor" };
            const result = await usersCollection.find(query).toArray();
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
