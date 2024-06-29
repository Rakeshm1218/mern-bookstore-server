const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();


app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =process.env.MONGO_URI;

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
    // Connect the client to the server (optional starting in v4.7)
    client.connect();

    //create a collection of documents
    const booksCollection = client.db('bookInventory').collection('books');

    //insert a book to the database: post method will do it

    app.post('/upload-book', async (req, res) => {
      const data = req.body;
      const result = await booksCollection.insertOne(data);
      res.send(result);
    });

    //get all books from the database

    // app.get('/all-books', async (req, res) => {
    //   const result = await booksCollection.find({}).toArray();
    //   res.send(result);
    // });


    //find by category

    app.get('/all-books', async (req, res) => {
      let query = {};
      if(req.query?.category){
        query = {category: req.query.category}
      }
      const result = await booksCollection.find(query).toArray();
      res.send(result);
    });

    //get single book by id

    app.get('/book/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await booksCollection.findOne(filter);
        res.send(result);
    });
    

    //upload a book data : patch or update method
    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const bookData = req.body;
      const filter = {_id: new ObjectId(id)};
      const option = {upsert: true};

      const updateBookData = {
        $set: {
          ...bookData
        }
      }

      //update data
      const result = await booksCollection.updateOne(filter, updateBookData, option);
      res.send(result);
    });

    //delete a book from the database

    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!!!');
  }


    
 catch (error) {
    console.error(error);
  }
  finally{

  }
}



// Call the run function to connect to MongoDB and set up the routes
run();

// Listen to the specified port
app.listen(port, () => {
  console.log(`App listening on port ${port} `);
});

