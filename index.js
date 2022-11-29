const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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


// JWT Token Verify :
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const usePhoneCollections = client.db('usedPhone').collection('usedPhoneCollection');
        const androidCollection = client.db('usedPhone').collection('android');
        const iosCollection = client.db('usedPhone').collection('ios');
        const btnCollection = client.db('usedPhone').collection('buttonPhone');
        const usersCollection = client.db('usedPhone').collection('users');
        const productsCollection = client.db('usedPhone').collection('products');
        const adCollection = client.db('usedPhone').collection('ad');


        // VerifyAdmin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }

        // Load Home Page 3 category data :
        app.get('/categories', async (req, res) => {
            const query = {}
            const phones = await usePhoneCollections.find(query).toArray();
            res.send(phones);
        });
        //Load Category Model Details by Category id:
        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            let phone;
            if (id === "1") {
                phone = await androidCollection.find({}).toArray();

            } else if (id === "2") {
                phone = await iosCollection.find({}).toArray();

            } else {
                phone = await btnCollection.find({}).toArray();
            }
            res.send(phone);
        });


        // JWT Token :
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


        // User Information Post in Database :
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });



        // Get Users & Sellers From Database:
        app.get('/users', verifyJWT, async (req, res) => {
            let query = {};
            if (req.query?.email) {
                const email = req.query.email;
                query = { email: email };
            }
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        app.get('/users/seller', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const users = await usersCollection.find(query).toArray();
            if (users) {
                res.send({ isSeller: 1 })
            } else {

                res.send({ isSeller: 0 });
            }
        });



        // Get Users From Database:
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        // Get Who is Admin : 
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });

        // Get Who is Seller : 
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        });



        // Products Collection Save to the database :
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });
        // Get Products Collection in UI :
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            const product = await productsCollection.find(query).toArray();
            res.send(product);
        });
        // Products Collection From UI and database :
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        });






        // Products Collection Save to the Home :
        app.post('/addProduct', async (req, res) => {
            const category = req.query.category;
            const product = req.body;
            let result
            if (category === 'Android') {
                result = await androidCollection.insertOne(product);

            } else if (category === 'IOS') {
                result = await iosCollection.insertOne(product);
            } else {
                result = await btnCollection.insertOne(product);
            }
            // const product = req.body;
            res.send(result);
        });



        // Delete Users :
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        });



        app.get('/dashboard/allsellers', verifyJWT, async (req, res) => {
            const role = req.query.role;
            console.log(req.query.role);
            const users = await usersCollection.find({}).toArray()
            const result = users.filter(product => product.role === role)
            console.log("jsx".result);
            res.send(result)

        })

        app.get('/dashboard/allbuyers', verifyJWT, async (req, res) => {
            const role = req.query.role;
            console.log(req.query.role);
            const users = await usersCollection.find({}).toArray()
            const result = users.filter(product => product.role === role)
            console.log("jsx".result);
            res.send(result)

        });

        app.post('/advertise', verifyJWT, async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await adCollection.insertOne(product)
            console.log(product);
            res.send(result)
        })


        app.get('/ad', async (req, res) => {
            const query = {}
            const phones = await adCollection.find(query).toArray();
            res.send(phones);
        });


    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Used Mobile server is running');
})

app.listen(port, () => console.log(`Used Mobile running on ${port}`))