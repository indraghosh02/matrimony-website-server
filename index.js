const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000;
//middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://matrimony-fd8e3.web.app",
      "https://matrimony-fd8e3.firebaseapp.com"
      
     
    ],
    credentials: true
  }));



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
    const marriageCollection = client.db('matrimonyDb').collection('marriage');
    const userCollection = client.db('matrimonyDb').collection('users');
    const contactRequestCollection = client.db('matrimonyDb').collection('contactRequests');
    const premiumRequestCollection = client.db('matrimonyDb').collection('premiumRequests');
  

    // const contactRequestCollection = client.db('matrimonyDb').collection('contactRequests');

   
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


// app.get('/biodata/filter', async (req, res) => {
//     const { ageMin, ageMax, type, division } = req.query;

//     const filters = {};

//     if (ageMin && ageMax) {
//         filters.age = { $gte: parseInt(ageMin), $lte: parseInt(ageMax) };
//     }

//     if (type) {
//         filters.type = type;
//     }

//     if (division) {
//         filters.permanentDivision = division;
//     }

//     try {
//         const result = await biodataCollection.find(filters).toArray();
//         res.send(result);
//     } catch (error) {
//         console.error('Error filtering biodata:', error);
//         res.status(500).send('Internal server error');
//     }
// });


    
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

      app.put('/biodata/:id', async(req, res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true};
        const updatedBiodata = req.body;
        const biodata = {
          $set: {
            type: updatedBiodata.type,
            name:updatedBiodata.name,
            image:updatedBiodata.image,
            date:updatedBiodata.date,
            height:updatedBiodata.height,
            weight:updatedBiodata.weight,
            age:updatedBiodata.age,
            occupation:updatedBiodata.occupation,
            race:updatedBiodata.race,
            fName:updatedBiodata.fName,
            mName:updatedBiodata.mName,
            permanentDivision:updatedBiodata.permanentDivision,
            presentDivision:updatedBiodata.presentDivision,
            partnerAge:updatedBiodata.partnerAge,
            partnerHeight:updatedBiodata.partnerHeight,
            partnerWeight:updatedBiodata.partnerWeight,
            email:updatedBiodata.email,
            number:updatedBiodata.number,
          }
        }
        const result = await biodataCollection.updateOne(filter, biodata,options );
        res.send(result);
      })




    
      
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

      // marriage
      app.post('/marriage', async(req,res) =>{
        const newMarriage =req.body;
        console.log(newMarriage);
        const result = await marriageCollection.insertOne(newMarriage);
        res.send(result)
      })
      app.get('/marriage', async (req, res) => {
        const result = await marriageCollection.find().toArray()
        res.send(result)
      });

      // save a user
      app.put('/user', async(req,res) => {
        const user = req.body
        console.log(user);
        const query = { email:user?.email, name:user?.name}
        console.log(user.name);
        //check if user already exists
        const isExist = await userCollection.findOne(query)
        // if(isExist) return res.send(isExist)
          if(isExist) {
            if(user.status === 'Requested'){
              const result = await userCollection.updateOne(query,
                 {$set:{status: user?.status}})
              return res.send(result)
            }
            else {
              return res.send(isExist)
            }
          }
        const options = { upsert: true }
      
        const updateDoc = {
          $set: {
            ...user,
          },
        }
        const result = userCollection.updateOne(query, updateDoc, options)
        res.send(result)
      })

      //get user info by email
      app.get('/user/:email', async(req, res) => {
        const email = req.params.email
        const result = await userCollection.findOne({ email })
        res.send(result)
      })


      //search
      app.get('/users/search', async (req, res) => {
        const name = req.query.name;
        const query = { name: { $regex: name, $options: 'i' } }; // Case-insensitive search
      
        try {
          const result = await userCollection.find(query).toArray();
          res.send(result);
        } catch (error) {
          console.error('Error searching for users:', error);
          res.status(500).send({ message: 'Internal server error' });
        }
      });
      

      //get all user data
      app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
      })

      // update role
      // app.patch('/user/update/:email', async(req, res) =>{
      //   const email = req.params.email
      //   const user = req.body
      //   const query = { email }
      //   const updateDoc = {
      //     $set:{
      //       ...user
      //     }
         
      //   }
      //   const result = await userCollection.updateOne(query,updateDoc )
      //   res.send(result)
      // })

      // Update role endpoint in backend
        app.patch('/users/update/:email', async (req, res) => {
          const email = req.params.email;
          const user = req.body;
          const query = { email };
          const updateDoc = {
            $set: {
              ...user
            }
          };
          const result = await userCollection.updateOne(query, updateDoc);
          res.send(result);
        });


        // Update premium status endpoint in backend
    app.patch('/user/update-premium/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const updateDoc = {
        $set: {
          isPremium: true
        }
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });



        //payment intent
    app.post('/request-contact', async (req, res) => {
      const { biodataId, userEmail, paymentMethodId, price } = req.body;
          const amount = parseInt(price* 100)
          console.log(amount, 'amount inside the intent');
      
        // Create a PaymentIntent on Stripe
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount, // amount in cents
          currency: 'usd',
          payment_method_types: ['card' ]
         
        });

  

          res.send({ 
            clientSecret: paymentIntent.client_secret });
        } 
     

    );
    


    



    app.post('/request-contact-info', async (req, res) => {
      try {
        const { biodataId, userEmail, price, name,email,number } = req.body;
        // Save the biodata information to the database
        const result = await contactRequestCollection.insertOne({
          biodataId,
          name,
          email,
          number,
          userEmail,
          price,
          status:'Pending',
          paymentStatus: 'success' // Assuming you have a field to track payment status
        });
        res.send(result);
      } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
    // Endpoint to fetch all contact requests
    app.get('/contact-requests-info', async (req, res) => {
      try {
        const contactRequests = await contactRequestCollection.find().toArray();
        // You may need to populate the biodata information based on the biodataId stored in each contact request
        // Return the contact requests with associated biodata information
        res.json(contactRequests);
      } catch (error) {
        console.error('Error fetching contact requests:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.get('/contact-requests-info/:email', async (req, res) => {
      const email = req.params.email;
      try {
        const result = await contactRequestCollection.find({ userEmail: email }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching contact requests:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    app.patch('/contact-requests-info/:id', async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
  
      try {
          const query = { _id: new ObjectId(id) };
          const updateDoc = {
              $set: { status }
          };
          const result = await contactRequestCollection.updateOne(query, updateDoc);
  
          if (result.matchedCount === 0) {
              res.status(404).json({ message: 'Contact request not found' });
          } else {
              res.json({ message: 'Contact request updated successfully' });
          }
      } catch (error) {
          console.error('Error updating contact request:', error);
          res.status(500).json({ message: 'Internal server error' });
      }
  });
  

    app.delete('/contact-requests-info/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await contactRequestCollection.deleteOne(query);
      res.send(result);
    });


    // premium reqst
  //   app.post('/premium-requests', async (req, res) => {
  //     const { email, biodata } = req.body;
  //     const newRequest = {
  //         email,
  //         biodata,
  //         status: 'Pending'
  //     };
  //     const result = await premiumRequestCollection.insertOne(newRequest);
  //     res.send(result);
  // });

  app.post('/premium-requests', async (req, res) => {
    const { email, biodata } = req.body;

    console.log('Received premium request:', email, biodata);

    try {
        // Check if there is an existing request with the same email and a status of "Pending" or "Approved"
        const existingRequest = await premiumRequestCollection.findOne({
            email,
            $or: [
                { status: 'Pending' },
                { status: 'Approved' }
            ]
        });

        console.log('Existing request:', existingRequest);

        if (existingRequest) {
            console.log('A request with the same email already exists.');
            return res.status(400).json({ message: 'A request with the same email already exists.' });
        }

        // If no existing request found, proceed to insert the new request
        console.log('No existing request found. Inserting new request.');
        const newRequest = {
            email,
            biodata,
            status: 'Pending'
        };
        const result = await premiumRequestCollection.insertOne(newRequest);
        console.log('New request inserted successfully:', result);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error processing premium request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

  
  
  


  app.get('/premium-requests', async (req, res) => {
    const requests = await premiumRequestCollection.find().toArray();
    res.send(requests);
});

// app.get('/premium-requests/:email', async (req, res) => {
//     const email = req.params.email;
//     const premiumRequest = await premiumRequestsCollection.findOne({ email });
//     if (premiumRequest) {
//         res.send(premiumRequest);
//     } else {
//         res.status(404).send({ message: 'Premium request not found' });
//     }
// });



app.patch('/premium-requests/approve/:id', async (req, res) => {
  const id = req.params.id;
  const request = await premiumRequestCollection.findOne({ _id: new ObjectId(id) });

  if (request) {
      const { email, biodata } = request;
      // Update the biodata status to premium
      await biodataCollection.updateOne(
          { email },
          { $set: { isPremium: true } }
      );
      // Update the request status to 'Approved'
      const result = await premiumRequestCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status: 'Approved' } }
      );
      res.send(result);
  } else {
      res.status(404).send({ message: 'Request not found' });
  }
});


app.post('/premium-requests', async (req, res) => {
    const { email, biodata } = req.body;

    console.log('Received premium request:', email, biodata);

    try {
        // Check if there is an existing request for the same biodataId with a "Pending" or "Approved" status
        const existingRequest = await premiumRequestCollection.findOne({
            'biodata.biodataId': biodata.biodataId,
            $or: [
                { status: 'Pending' },
                { status: 'Approved' }
            ]
        });

        console.log('Existing request:', existingRequest);

        if (existingRequest) {
            // If an existing request is found with "Pending" status, update its email and status
            if (existingRequest.status === 'Pending') {
                console.log('Updating existing request:', existingRequest._id);
                await premiumRequestCollection.updateOne(
                    { _id: existingRequest._id },
                    { $set: { email, status: 'Pending' } }
                );
                console.log('Existing request updated successfully.');
                return res.status(200).json({ message: 'Existing request updated successfully.' });
            } else {
                console.log('Existing request already approved. No action taken.');
                return res.status(400).json({ message: 'Existing request already approved. No action taken.' });
            }
        }

        // If no existing request found, proceed to insert the new request
        console.log('No existing request found. Inserting new request.');
        const newRequest = {
            email,
            biodata,
            status: 'Pending'
        };
        const result = await premiumRequestCollection.insertOne(newRequest);
        console.log('New request inserted successfully:', result);
        return res.status(201).json(result);
    } catch (error) {
        console.error('Error processing premium request:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/premium-requests/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const result = await premiumRequestCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).json({ message: 'Premium biodata not found' });
    }
    res.send(result);
  } catch (error) {
    console.error('Error fetching premium biodata details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});





app.get('/info/:biodataId', async (req, res) => {
  const biodataId = parseInt(req.params.biodataId); // Convert to integer
  console.log(biodataId);
  
  const result = await biodataCollection.findOne({ biodataId }); // Query using the biodataId
  console.log(result);
  
  res.send(result);
});


// app.get('/info/:biodataId', async (req, res) => {
//   const { biodataId } = req.params;
//   try {
//     const result = await biodataCollection.findOne({ biodataId });
//     if (!result) {
//       return res.status(404).send('Biodata not found');
//     }
//     res.send(result);
//   } catch (error) {
//     console.error('Error retrieving biodata:', error);
//     res.status(500).send('Internal server error');
//   }
// });







  


      
      

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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