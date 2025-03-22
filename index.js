require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h0ofb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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
        // await client.connect();
        const visaCollection = client.db('visaDB').collection('visas');
        const applicationsCollection = client.db('visaDB').collection('visaApplications');

        app.get('/visas', async (req, res) => {
            const cursor = visaCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/latest-visas', async (req, res) => {
            const cursor = visaCollection.find().sort({ _id: -1 }).limit(6); // Fetch latest 6 visas
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/visa-details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await visaCollection.findOne(query);
            res.send(result);
        })
        app.get('/my-added-visas', async (req, res) => {
            const email = req.query.email;
            const result = await visaCollection.find({ email: email }).toArray();
            res.send(result)
        })


        app.get('/my-applications', async (req, res) => {
            const email = req.query.email;
            const result = await applicationsCollection.find({ email: email }).toArray();
            res.send(result);
        })


        app.post('/visas', async (req, res) => {
            const newVisa = req.body;
            const result = await visaCollection.insertOne(newVisa);
            res.send(result)
        })
        app.post('/visa-applications', async (req, res) => {
            const newVisaApplication = req.body;
            const result = await applicationsCollection.insertOne(newVisaApplication);
            res.send(result)
        })
        app.patch('/update-visa/:id', async (req, res) => {
            const _id = req.params.id;
            const filter = { _id: new ObjectId(_id) };
            const updatedVisa = req.body;
            delete updatedVisa._id;
            const updatedDoc = { $set: updatedVisa }
            const result = await visaCollection.updateOne(filter, updatedDoc);
            res.send(result)

        })
        app.delete('/my-visas/:id', async (req, res) => {
            const id = req.params.id;
            const result = await visaCollection.deleteOne({ _id: new ObjectId(id) })
            res.send(result);
        })

        app.delete("/visa-applications/:id", async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;

            const query = { _id: new ObjectId(id), email: email }; 
            const result = await applicationsCollection.deleteOne(query);
            res.send(result)
        });


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('visa server is running...!!');
})
app.listen(port, () => {
    console.log(`visa server is running from ${port}`)
})
