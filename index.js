const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
//middlewares
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.obyjfl3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
   // await client.connect();

    const biodataCollection = client.db('matrimonyDb').collection('biodata');
    const favouriteCollection = client.db('matrimonyDb').collection('favourite');

   
    app.get('/biodata', async (req, res) => {
        const result = await biodataCollection.find().toArray()
        res.send(result)
      });
   
       app.get('/biodata/:id', async (req, res) => {
      const id = req.params.id;
      const result = await biodataCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.get('/biodata/user/:email', async (req, res) => {
      const email = req.params.email;
      const result = await biodataCollection.findOne({ email });
      res.send(result);
  });
  
    // Existing code remains the same

// Endpoint to fetch biodata associated with the logged-in user's email
app.get('/biodata/user/:email', async (req, res) => {
  const email = req.params.email;
  try {
      const userBiodata = await biodataCollection.findOne({ email });
      if (!userBiodata) {
          res.status(404).json({ message: 'Biodata not found for the user' });
          return;
      }
      res.json(userBiodata);
  } catch (error) {
      console.error('Error fetching user biodata:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



  


    
    
    
    app.post('/biodata', async (req, res) => {
        const newBiodata = req.body;
  
        // Find the last inserted biodata and get its biodataId
        const lastBiodata = await biodataCollection.find().sort({ biodataId: -1 }).limit(1).toArray();
        let newBiodataId = 1;
  
        if (lastBiodata.length > 0) {
          newBiodataId = lastBiodata[0].biodataId + 1;
        }
  
        // Assign the new biodataId to the new biodata
        newBiodata.biodataId = newBiodataId;
  
        const result = await biodataCollection.insertOne(newBiodata);
        res.send(result);
      });

      //favourite
      // app.post('/favourite', async (req, res) => {
      //   const favouriteData = req.body;
      //   const result = await favouriteCollection.insertOne(favouriteData);
      //   res.send(result);
      // });




      // app.post('/favourite', async (req, res) => {
      //   const { favouriteData, userEmail } = req.body;
      //   const favouriteEntry = {
      //     ...favouriteData,
      //     addedBy: userEmail,
      //   };
      //   const result = await favouriteCollection.insertOne(favouriteEntry);
      //   res.send(result);
      // });

      app.post('/favourite', async (req, res) => {
        const { favouriteData, userEmail } = req.body;
        const { _id, ...favouriteDataWithoutId } = favouriteData; // Exclude the _id field
        const favouriteEntry = {
          ...favouriteDataWithoutId,
          addedBy: userEmail,
        };
        const result = await favouriteCollection.insertOne(favouriteEntry);
        res.send(result);
      });


      app.get('/favourites/:email', async (req, res) => {
        const email = req.params.email;
        const result = await favouriteCollection.find({ addedBy: email }).toArray();
        res.send(result);
      });

      app.delete('/favourite/:id',async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await favouriteCollection.deleteOne(query)
        res.send(result);
      })
      
      

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('matrimony server is setting')
})


app.listen(port, () => {
    console.log(`matrimony server is sitting on port ${port}`);
  })