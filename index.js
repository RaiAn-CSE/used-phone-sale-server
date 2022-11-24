const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
require('dotenv').config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3exxtfz.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const usePhoneCollections = client.db('usedPhone').collection('usedPhoneCollection');
        // const bookingsCollection = client.db('doctorsPortal').collection('bookings');
        // const usersCollection = client.db('doctorsPortal').collection('users');
        // const doctorsCollection = client.db('doctorsPortal').collection('doctors');
        // const paymentsCollection = client.db('doctorsPortal').collection('payments');

        // Load Home Page 3 category data 
        app.get('/categories', async (req, res) => {
            const query = {}
            const phones = await usePhoneCollections.find(query).toArray();
            res.send(phones);
        })



    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Used Mobile server is running');
})

app.listen(port, () => console.log(`Used Mobile running on ${port}`))