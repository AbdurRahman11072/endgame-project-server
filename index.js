const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)



    const moviesCollection = client.db("LiveStriming").collection('movies')
    const commentsCollection = client.db("LiveStriming").collection("comments");
    const likeCollection = client.db("LiveStriming").collection("Like");
    const playListCollection = client.db("LiveStriming").collection("playlist")
    const chatBot = client.db("LiveStriming").collection("chatbot")
    const messageCollection = client.db("LiveStriming").collection("message")

    // -------------------------offers collection code start hare eee------------------------

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
  
    
    // app.get('/movies', async (req, res) => {
    //   try {
    //     const cursor = moviesCollection.find()
    //     const result = await cursor.toArray()
    //     res.send(result)
    //   }
    //   catch (err) {
    //     console.log(err)
    //   }
    // })

    // app.get('/movies', async (req, res) => {
    //   try {
    //     const pipeline = [
    //       // Stage 1: Add any necessary filtering or matching conditions
    //       // For example, you might want to filter movies by a specific genre
    //       // { $match: { genres: "Action" } },
    
    //       // Stage 2: Shuffle the documents to get a random mix
    //       { $sample: { size: 5 } }, // Adjust the size based on your requirements
    //     ];
    
    //     const cursor = moviesCollection.aggregate(pipeline);
    //     const result = await cursor.toArray();
    //     res.send(result);
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
    

app.get('/aggri', async (req, res) => {
  try {
    const pipeline = [
      // Group movies by genres
      { $group: {_id: '$genres', movies: { $push: '$$ROOT' }},},
    ];

    const cursor = moviesCollection.aggregate(pipeline);
    const result = await cursor.toArray();
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});

  


    app.get('/movies/:id', async (req, res) => {
      try {
        const movieId = req.params.id;
    
        // Validate if movieId is a valid ObjectId
        if (!ObjectId.isValid(movieId)) {
          return res.status(400).send('Invalid movie ID');
        }
    
        const cursor = moviesCollection.find({ _id: new ObjectId(movieId) });
        const result = await cursor.toArray();
    
        if (result.length === 0) {
          return res.status(404).send('Movie not found');
        }
    
        res.send(result[0]); // Assuming you want to send only the first matching movie
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    });
    
    // comment section ----------------

    
    app.get('/comments', async (req, res) => {
      let query = {};
      console.log(req.query)
      if (req.query?.videoId) {
        query = { videoId: req.query.videoId }
      }
      const cursor = commentsCollection.find(query).sort({createdAt: -1});
      const result = await cursor.toArray();
      console.log(result)
      res.send(result);
    })

    app.post('/comments', async (req, res) => {
      const newComment = req.body;
      console.log(newComment)
      const result = await commentsCollection.insertOne(newComment);
      res.send(result)
    })

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

    app.delete('/comments/:id', async (req, res) => {
      const id = req.params.id;
      console.log('from data base', id)
      const query = { _id: new ObjectId(id) }
      const result = await commentsCollection.deleteOne(query)
      res.send(result)
    })

    app.post('/like',async (req, res) =>{
      const user = req.body;
      const result = await likeCollection.insertOne(user);
      res.send(result);
    })

    app.post('/playlist', async(req, res) =>{
      const user = req.body;
      const result = await playListCollection.insertOne(user);
      res.send(result);
    })

    app.get('/playlist/:email', async(req, res) => {
      const email = req.params.email;
      // console.log(email);
      const filter = { email: email };
      const result = await playListCollection.find(filter).toArray();
      res.send(result);
  });


    app.get('/like/:email', async(req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { email: email };
      const result = await likeCollection.find(filter).toArray();
      res.send(result);
  });
    app.get('/like', async(req, res) => {
      const result = await likeCollection.find().toArray();
      res.send(result);
  });
  

    app.get('/like/:id/:email', async (req, res) => {
      const id = req.params.id;
      const email = req.params.email; 
    
      try {
        const query = {"data._id": id, email: email};
        const result = await likeCollection.findOne(query);
        // console.log(result);
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


    app.get('/playlist/:id/:email', async (req, res) => {
      const id = req.params.id;
      const email = req.params.email; 
      // console.log(id);
      // console.log(email);
    
      try {
        const query = {"data._id": id, email: email};
        const result = await playListCollection.findOne(query);
        // console.log(result);
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


    app.get('/chatbot', async (req, res) =>{
      const result = await chatBot.find().toArray();
      res.send(result);
    });

    app.get('/search', async (req, res) => {
      const searchQuery = req.query.q;
      
      try {
        // Perform search query
        const movies = await moviesCollection.find({
          title: { $regex: new RegExp(searchQuery, 'i') } 
        });
    
        res.json(movies);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    app.get('/movie', async (req, res) =>{
      const user = req.params.id;
      const result = await moviesCollection.find().toArray();
      res.send(result)
    })

    app.post('/messageData', async(req, res) =>{
      const user = req.body;
      const sendMessage = await messageCollection.insertOne(user);
      res.send(sendMessage)
    })

    app.delete('/playlist/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const result = await playListCollection.deleteOne(filter);
      res.send(result);
    })

    app.delete('/like/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const result = await likeCollection.deleteOne(filter);
      res.send(result);
    })


    
    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
