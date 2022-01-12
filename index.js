const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

/// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rtqba.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('jobs_window');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const orderCollection = database.collection('order');
        const usersCollection = database.collection('users');

        // GET API OF PRODUCTS
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        // GET API OF REVIEWS
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        // GET API OF USERS
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

         // GET SINGLE PRODUCT
         app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })


        // cofirm order
        app.post("/confirmorder", async (req, res) => {
            const result = await orderCollection.insertOne(req.body);
            res.send(result);
        });

        // my confirmOrder

        app.get("/mycart/:email", async (req, res) => {
            const result = await orderCollection
             .find({ email: req.params.email })
             .toArray();
             res.send(result);
  });

        /// delete order

        app.delete("/deleteorder/:id", async (req, res) => {
            const result = await orderCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
    res.send(result);
  });
        /// delete product

        app.delete("/deleteproduct/:id", async (req, res) => {
            const result = await productsCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
    res.send(result);
  });
        /// delete order by admin

        app.delete("/deleteorder/:id", async (req, res) => {
            const result = await orderCollection.deleteOne({
            _id: ObjectId(req.params.id),
        });
    res.send(result);
  });


        // all order
        app.get("/allorders", async (req, res) => {
        const result = await orderCollection.find({}).toArray();
        res.send(result);
    });
        //update
    app.put("/updatestatus/:id", (req, res) => {
        const id = req.params.id;
        const updatedStatus = req.body.status;
        const filter = { _id: ObjectId(id) };
        console.log(updatedStatus);
        orderCollection
          .updateOne(filter, {
            $set: { status: updatedStatus },
          })
          .then((result) => {
            res.send(result);
          });
      });



        // POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result)
        });

        // POST REVIEWS API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the review post api', review);

            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result)
        });

        //POST EMAIL USERS API
        app.post("/addUserInfo", async (req, res) => {
            console.log("req.body");
            const result = await usersCollection.insertOne(req.body);
            res.send(result);
            console.log(result);
          });
        //POST GOOGLE USERS API
          app.put('/addUserInfo', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //set admin role
       app.put('/addUserInfo/admin',async(req,res)=>{
           const user = req.body;
           const filter = { email: user.email };
           const updateDoc = {$set:{role:'admin'}};
           const result = await usersCollection.updateOne(filter , updateDoc);
           res.json(result);
       })

       //SECURE ADMIN
       app.get('/addUserInfo/:email',async(req,res)=>{
           const email = req.params.email;
           const query = {email: email};
           const user = await usersCollection.findOne(query);
           let isAdmin = false;
           if(user?.role=== 'admin'){
               isAdmin = true;
           }
           res.json({admin: isAdmin})

       })

        // // DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running jobswindow Server');
});
app.get('/updateex', (req, res) => {
    res.send('jobs window Server update hoiche');
});

app.get('/hello', (req, res) => {
    res.send('hello updated here')
})

app.listen(port, () => {
    console.log('wow jobswindow Server on port', port);
})