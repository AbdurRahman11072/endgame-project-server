
const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const SSLCommerzPayment = require('sslcommerz-lts')
const cors = require('cors')




const port = process.env.PORT || 5000

// middleware ---- use
const corsOptions = {
  origin: ['http://localhost:3000', 'https://video-website-two.vercel.app'],
  credentials: true,
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())



// mongodb db uri -----------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mehwgcd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false //true for live, false for sandbox

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)


 

    const moviesCollection = client.db("LiveStriming").collection('movies')
    const usersCollection = client.db("LiveStriming").collection('users')
    const showsCollection = client.db("LiveStriming").collection('shows')
    const seasonsCollection = client.db("LiveStriming").collection('seasons')
    const commentsCollection = client.db("LiveStriming").collection("comments");
    const packagesCollection = client.db("LiveStriming").collection("packages");
    const likeCollection = client.db("LiveStriming").collection("Like");
    const playListCollection = client.db("LiveStriming").collection("playlist")
    const paymentsCollection = client.db("blogsDB").collection("payments");
    // -------------------------offers collection code start hare eee------------------------

    //------------------ CURD start hare-----------------------------------


    //---------------All Create code  Start hare-------------------

    // users code ----

    app.post('/users', async (req, res) => {
      try {
        const { uid, userName, gender, age, photoURL, email, provider, isAdmin, isPayment, signupDate } = req.body;

        // Check if the user already exists
        const userExist = await usersCollection.findOne({ uid });

        if (userExist) {
          return res.status(200).json({ message: 'User already exists, skipped' });
        }

        // Insert the new user into the users collection
        const result = await usersCollection.insertOne({ uid, userName, gender, age, photoURL, email, provider, isAdmin, isPayment, signupDate });

        // Respond with the created user
        res.status(201).json({ message: 'Success' });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



    // movies code ---

    app.post('/movies', async (req, res) => {
      try {
        const body = req.body;
        console.log(body)
        const result = await moviesCollection.insertOne(body)
        console.log(result)
        res.send(result)

      }
      catch (err) {
        console.log("this error is house collection post error", err)
      }
    })
  // PUT endpoint to update the visibility of a movie by ID
  const { ObjectId } = require('mongodb');

  app.put('/lastMovies/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
  
      // Update the visibility of the movie with the provided ID
      const result = await moviesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isVisible } }
      );
  
      // Check if the movie was found and updated successfully
      if (result.matchedCount > 0) {
        res.send({ acknowledged: true });
      } else {
        res.status(404).send({ error: 'Movie not found' });
      }
    } catch (err) {
      console.error("Error updating movie's visibility:", err);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  });
  



    // shows code -----
    app.post('/shows', async (req, res) => {
      try {
        const body = req.body;
        console.log(body)
        const result = await showsCollection.insertOne(body)
        console.log(result)
        res.send(result)

      }
      catch (err) {
        console.log("this error is house collection post error", err)
      }
    })

    // season code --------
    app.post('/seasons', async (req, res) => {
      try {
        const body = req.body;
        console.log(body);
        const result = await seasonsCollection.insertOne(body);
        console.log(result);
        res.send(result);
      } catch (err) {
        console.log("Error in /seasons POST endpoint:", err);
        res.status(500).send({ error: 'Internal Server Error', details: err.message });
      }

    });

    // comment code ------
    app.post('/comments', async (req, res) => {
      const newComment = req.body;
      console.log(newComment)
      const result = await commentsCollection.insertOne(newComment);
      res.send(result)
    })

    // Like code ---------
    app.post('/like', async (req, res) => {
      const user = req.body;
      const result = await likeCollection.insertOne(user);
      res.send(result);
    })

    // Playlist code---------
    app.post('/playlist', async (req, res) => {
      const user = req.body;
      const result = await playListCollection.insertOne(user);
      res.send(result);
    })




    //-------------------All Create code end hare-------------------------

    // --------------------All Get code Start hare-------------------------------


    // users code -----

    app.get('/users', async (req, res) => {
      try {
        const cursor = usersCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })
    app.get('/users', async (req, res) => {
      try {
          const userEmail = req.query.email;
          const user = await usersCollection.findOne({ email: userEmail });
  
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
  
          res.json(user);
      } catch (error) {
          console.error('Error fetching user:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });
  
  
    // movies code -----

    // Route to fetch genres



    // app.get('/movie', async (req, res) => {
    //   try {
    //     const cursor = moviesCollection.find();
    //     const result = await cursor.toArray();
    //     res.json(result);
    //   } catch (err) {
    //     console.error(err);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });


    app.get('/movies', async (req, res) => {
      try {
        const pipeline = [
          // Stage 1: Add any necessary filtering or matching conditions
          // For example, you might want to filter movies by a specific genre
          // { $match: { genres: "Action" } },

          // Stage 2: Shuffle all documents to get a random order
          { $sample: { size: await moviesCollection.countDocuments() } },
        ];

        const cursor = moviesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/lastMovies', async (req, res) => {
      try {
        const pipeline = [
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];
    
        const cursor = moviesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/lastMovies/:id', async (req, res) => {
      try {
        const movieId = req.params.id; // Get the movie ID from the request parameters
        const result = await moviesCollection.deleteOne({ _id: new ObjectId(movieId) }); // Delete the movie document by ID
        
        if (result.deletedCount === 1) {
          res.status(200).send('Movie deleted successfully');
        } else {
          res.status(404).send('Movie not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
    
    
    app.get('/aggri', async (req, res) => {
      try {
        const pipeline = [
          // Group movies by genres
          { $group: { _id: '$genres', movies: { $push: '$$ROOT' } }, },
        ];

        const cursor = moviesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    });


// Route to get user's email by email address

    // app.get('/movies/:id', async (req, res) => {
    //   try {
    //     const movieId = req.params.id;

    //     // Validate if movieId is a valid ObjectId
    //     if (!ObjectId.isValid(movieId)) {
    //       return res.status(400).send('Invalid movie ID');
    //     }

    //     const cursor = moviesCollection.find({ _id: new ObjectId(movieId) });
    //     const result = await cursor.toArray();

    //     if (result.length === 0) {
    //       return res.status(404).send('Movie not found');
    //     }

    //     res.send(result[0]); // Assuming you want to send only the first matching movie
    //   } catch (err) {
    //     console.log(err);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });
// movies code -----

app.get('/movies/:id', async (req, res) => {
  try {
    const movieId = req.params.id;

    // Validate if movieId is a valid ObjectId
    if (!ObjectId.isValid(movieId)) {
      return res.status(400).send('Invalid movie ID');
    }

    // Find the movie by its ID
    const movie = await moviesCollection.findOne({ _id: new ObjectId(movieId) });

    // If the movie doesn't exist, return a 404 status code
    if (!movie) {
      return res.status(404).send('Movie not found');
    }

    // Update the view count if the movie has been watched for more than 10 seconds
    if (req.query.watchTime && parseInt(req.query.watchTime) >= 10) {
      // Increment the view count
      await moviesCollection.updateOne(
        { _id: new ObjectId(movieId) },
        { $inc: { views: 1 } }
      );
    }

    // Send the movie data in the response
    res.send(movie);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});


    // shows code ----

    app.get('/shows', async (req, res) => {
      try {
        const cursor = showsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })


    // season code --------

    app.get('/seasons', async (req, res) => {
      try {
        const cursor = seasonsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })


    // comment code ----

    app.get('/comments', async (req, res) => {
      let query = {};
      console.log(req.query)
      if (req.query?.videoId) {
        query = { videoId: req.query.videoId }
      }
      const cursor = commentsCollection.find(query).sort({ createdAt: -1 });
      const result = await cursor.toArray();
      console.log(result)
      res.send(result);
    })

    // package code-------
    app.get('/packages', async (req, res) => {
      const cursor = packagesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get('/packages/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await packagesCollection.findOne(query)
      console.log(result)
      res.send(result)
    })

    // like code ----------

    app.get('/like/:id', async (req, res) => {
      const id = req.params.id;
      const userEmail = req.query.email;

      try {
        const query = { _id: id, email: userEmail };
        const result = await likeCollection.findOne(query);

        if (result) {
          res.send(result);
        } else {
          res.status(404).send('No document found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    // suggest code ---------
    app.get('/suggest', async (req, res) => {
      try {
        // Retrieve all documents from the movies collection
        const result = await moviesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    // --------------------All Get code end hare-------------------------------


    // -------------------- Update code start hare-------------------------------

    // New route for updating shows with a new season ID
    app.put('/shows/:id/seasons', async (req, res) => {
      try {
        const { id } = req.params;
        const { seasonId } = req.body;

        // Assuming you have a showsCollection representing your shows
        const result = await showsCollection.updateOne(
          { _id: new ObjectId(id) }, // Assuming you are using MongoDB ObjectId
          { $push: { seasons: seasonId } }
        );

        console.log(result);

        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'Show not found' });
        }
      } catch (err) {
        console.log("Error in /shows/:id/seasons PUT endpoint:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.patch('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const updateComment = req.body;
      console.log(id, updateComment);

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBlog = {
        $set: {
          body: updateComment.body,
        }
      }
      const result = await commentsCollection.updateOne(filter, updateBlog, options);
      res.send(result);
    })


    // -------------------- Update code end hare-------------------------------

    // -------------------- Delete code Start hare-------------------------------
    app.delete('/comments/:id', async (req, res) => {
      const id = req.params.id;
      console.log('from data base', id)
      const query = { _id: new ObjectId(id) }
      const result = await commentsCollection.deleteOne(query)
      res.send(result)
    })
    // -------------------- Delete code end hare-------------------------------


    // Package Data Start--------------------------------------

    app.get('/packages', async (req, res) => {
      const cursor = packagesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/packages/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await packagesCollection.findOne(query)
      console.log(result)
      res.send(result)
    })


    const tran_id = new ObjectId().toString();
    app.post('/payment', async (req, res) => {
      //user email get query
      let userEmail = {};
      console.log(req.query)
      if (req.query?.email) {
        userEmail = { email: req.query.email }
      }

      console.log(req.body)

      const packageData = await packagesCollection.findOne({ _id: new ObjectId(req.body._id) })
      const data = {
        total_amount: packageData?.price,
        currency: 'BDT',
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: `http://localhost:5000/payment/success/${tran_id}`,
        fail_url: 'http://localhost:5000/fail',
        cancel_url: 'http://localhost:5000/cancel',
        ipn_url: 'http://localhost:5000/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'demo',
        cus_email: 'test@gmail.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
      };
      console.log({ data: data })


      try {
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
          //   // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL
          res.send({ url: GatewayPageURL })
          console.log('Redirecting to: ', { url: GatewayPageURL })
        });
      } catch (error) {
        console.log('error', error)
      }
      // store in payments collection
      const finalData = {
        paymentDate: new Date(),
        package: packageData.packageName,
        isPayment: true,
        transactionId: tran_id,
        email: req?.query?.email,
        bank: 'SSLCommerz',
        mobile: '01711111111',
        amount: packageData.price,
        paymentType: 'netBanking',
      }
      const paymentCollect = await paymentsCollection.insertOne(finalData);
      console.log('paymentCollect', paymentCollect)

      // if user success payment then hit this route
      app.post('/payment/success/:tranId', async (req, res) => {
        console.log('parmsssss', req.params.tranId)
        const filter = userEmail;
        console.log('This is email', filter)
        const updateBlog = {
          $set: {
            packagePurchaseDate: new Date(),
            package: packageData.packageName,
            isPayment: true,
            transactionId: tran_id
          }
        }
        const result = await usersCollection.updateOne(filter, updateBlog);
        console.log(result)
        if (result.modifiedCount > 0) {
          res.redirect(
            `http://localhost:3000/subscribe/success/${tran_id}`
          )
        }
      });
      // if user success function End

    });

    // Package Data End------------------------------

    //payment data Start

    app.get('/payments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { transactionId: id }
      console.log(id)
      const result = await paymentsCollection.findOne(query)
      console.log(result)
      res.send(result)
    })

    //payment data End

// payment end --------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('LiveStriming Server Server is running...')
})

app.listen(port, () => {
  console.log(`LiveStriming is running on port ${port}`)
})
