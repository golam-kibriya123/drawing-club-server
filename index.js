const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('drawing club is running ')
});


app.listen(port, () => {
    console.log('the port is running on port', port)
})