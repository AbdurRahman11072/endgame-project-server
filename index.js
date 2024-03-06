
const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const SSLCommerzPayment = require('sslcommerz-lts')
const cors = require('cors')




const port = process.env.PORT || 5000

// middleware ---- use
const corsOptions = {
  origin: ['http://localhost:3000', 'https://streme-eight.vercel.app', 'https://video-streme-website-rho.vercel.app'],
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



    const usersCollection = client.db("LiveStriming").collection('users')
    const usersVideosCollection = client.db("LiveStriming").collection('usersVideos')
    const moviesCollection = client.db("LiveStriming").collection('movies')
    const showsCollection = client.db("LiveStriming").collection('shows')
    const episodesCollection = client.db("LiveStriming").collection('episodes')
    const episodesWatchLaterCollection = client.db("LiveStriming").collection('episodesWatchLater')
    const notificationsCollection = client.db("LiveStriming").collection('notifications')
    const celebrityCollection = client.db("celebrityDB").collection("celebrities");
    const ratingCollection = client.db("LiveStriming").collection("rating");
    const commentsCollection = client.db("LiveStriming").collection("comments");

    const packagesCollection = client.db("LiveStriming").collection("packages");
    const likeCollection = client.db("LiveStriming").collection("Like");
    const playListCollection = client.db("LiveStriming").collection("playlist")
    const paymentsCollection = client.db("blogsDB").collection("payments");
    const chatBot = client.db("LiveStriming").collection("chatbot")
    const messageCollection = client.db("LiveStriming").collection("message")
    const reportCollection = client.db("LiveStriming").collection("report")
    // -------------------------offers collection code start hare eee------------------------

    //------------------ CURD start hare-----------------------------------





    // ----------------------------------- Alauddin code start hare ----------------



    // usersCollection

    app.post('/users', async (req, res) => {
      try {
        const { uid, userName, gender, age, photoURL, email, provider, isAdmin, isPayment, signupDate, status, country, isVerify } = req.body;

        // Check if the user already exists
        const userExist = await usersCollection.findOne({ uid });

        if (userExist) {
          return res.status(200).json({ message: 'User already exists, skipped' });
        }

        // Insert the new user into the users collection
        const result = await usersCollection.insertOne({ uid, userName, gender, age, photoURL, email, provider, isAdmin, isPayment, signupDate, status, country, isVerify });

        // Respond with the created user
        res.status(201).json({ message: 'Success' });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    app.get('/singleUser', async (req, res) => {
      try {
        const userEmail = req.query.email;
        const user = await usersCollection.findOne({ email: userEmail });
        console.log(user)
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });


    app.get('/users', async (req, res) => {
      try {
        const cursor = usersCollection.find()
        console.log(cursor)
        const result = await cursor.toArray()
        console.log(result)
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })


    app.get('/usersSearch', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery; // Extract the search query from the request query parameters
        let query = {}; // Initialize an empty query object

        // If a search query is provided, add a regex condition to search by username
        if (searchQuery) {
          query = { userName: { $regex: new RegExp(searchQuery, 'i') } };
        }

        // Aggregate query to get the last user first
        const aggregationPipeline = [
          { $match: query },
          { $sort: { signupDate: -1 } } // Sort by signupDate in descending order to get the last user first
        ];

        // Perform aggregation
        const result = await usersCollection.aggregate(aggregationPipeline).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


    app.get('/latestUsers', async (req, res) => {
      try {
        const pipeline = [
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = usersCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


    app.put('/latestUsers/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Update the status of the movie with the provided ID
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'User not found' });
        }
      } catch (err) {
        console.error("Error updating user's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });







    app.delete('/latestUsers/:id', async (req, res) => {
      try {
        const userId = req.params.id; // Get the movie ID from the request parameters
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) }); // Delete the movie document by ID

        if (result.deletedCount === 1) {
          res.status(200).send('User deleted successfully');
        } else {
          res.status(404).send('user not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });





    // movies collection

    app.post('/movies', async (req, res) => {
      try {
        const body = req.body;

        console.log(body)
        const result = await moviesCollection.insertOne(body)
        const notify = {
          videoId: result.insertedId.toHexString(),
          notifyImg: req.body.thumbnail.link,
          notifyTitle: 'Publish new Video',
          notifyText: req.body.title,
          notifyPostTime: new Date(),
          type: 'video',
          uploadType: 'movieVideo',
          openNotify: [],
          readeNotify: []
        }
        console.log('notification', notify)
        const notifyPost = await notificationsCollection.insertOne(notify);
        console.log('notification', notifyPost)

        res.send(result)

      }
      catch (err) {
        console.log("this error is house collection post error", err)
      }
    })


    // movie aggri

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




    // movie status update

    app.put('/latestMovies/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Update the status of the movie with the provided ID
        const result = await moviesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'Movie not found' });
        }
      } catch (err) {
        console.error("Error updating movie's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });






    // admin movie search by title in dashbord movie list route page

    app.get('/moviesSearch', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery;
        let query = {};

        // If a search query is provided, add a regex condition to search by movie name
        if (searchQuery) {
          query = { title: { $regex: new RegExp(searchQuery, 'i') } };
        }

        const pipeline = [
          { $match: query },
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

    app.get('/genresMovies', async (req, res) => {
      try {
        const { genres } = req.query;

        // Define the pipeline stages based on the provided genres
        const pipeline = [];

        // Add matching condition for genres if provided
        if (genres) {
          const genreList = Array.isArray(genres) ? genres : [genres];
          pipeline.push({ $match: { genres: { $in: genreList } } });
        }

        // Add the sample stage to shuffle documents
        pipeline.push({ $sample: { size: await moviesCollection.countDocuments() } });

        // Execute the aggregation pipeline
        const cursor = moviesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


    app.get('/latestMovies', async (req, res) => {
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




    app.delete('/latestMovies/:id', async (req, res) => {
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

    // shows collection


    app.post('/shows', async (req, res) => {
      try {
        const body = req.body;
        console.log(body)
        const result = await showsCollection.insertOne(body)
        console.log(result)
        res.send(result)

      }
      catch (err) {
        console.log("this error is shows collection post error", err)
      }
    })

    app.get('/latestShows', async (req, res) => {
      try {
        const pipeline = [
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = showsCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });




    // admin show search by title in dashbord movie list route page

    app.get('/showsSearch', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery;
        let query = {};

        // If a search query is provided, add a regex condition to search by movie name
        if (searchQuery) {
          query = { title: { $regex: new RegExp(searchQuery, 'i') } };
        }

        const pipeline = [
          { $match: query },
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = showsCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


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

    // show  status update

    app.put('/latestShows/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Update the status of the movie with the provided ID
        const result = await showsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'Shows not found' });
        }
      } catch (err) {
        console.error("Error updating shows's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });




    // when episode create ,then episode id push in the shows episde []


    app.put('/shows/:id/episodes', async (req, res) => {
      try {
        console.log("Received PUT request to /shows/:id/episodes");

        const { id } = req.params;
        console.log("Show ID:", id);

        const { episodeId } = req.body;
        console.log("Episode ID:", episodeId);

        // Check if episodeId is null or undefined
        if (!episodeId) {
          console.log("Episode ID is missing");
          return res.status(400).send({ error: 'Episode ID is required' });
        }

        // Assuming you have a showsCollection representing your shows
        const result = await showsCollection.updateOne(
          { _id: new ObjectId(id) }, // Assuming you are using MongoDB ObjectId
          { $push: { episodes: episodeId } }
        );

        console.log("MongoDB Update Result:", result);

        if (result.matchedCount > 0) {
          console.log("Show updated successfully");
          res.send({ acknowledged: true });
        } else {
          console.log("Show not found");
          res.status(404).send({ error: 'Show not found' });
        }
      } catch (err) {
        console.log("Error in /shows/:id/episodes PUT endpoint:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });






    app.delete('/latestShows/:id', async (req, res) => {
      try {
        const showId = req.params.id; // Get the movie ID from the request parameters
        const result = await showsCollection.deleteOne({ _id: new ObjectId(showId) }); // Delete the movie document by ID

        if (result.deletedCount === 1) {
          res.status(200).send('Show deleted successfully');
        } else {
          res.status(404).send('Show not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });



    // episodeCollection


    app.post('/episodes', async (req, res) => {
      try {
        const body = req.body;
        console.log(body);
        const result = await episodesCollection.insertOne(body);
        const notify = {
          videoId: result.insertedId.toHexString(),
          notifyImg: req.body.thumbnail.link,
          notifyTitle: 'Publish new Video',
          notifyText: req.body.title,
          notifyPostTime: new Date(),
          type: 'episode',
          uploadType: 'episodeVideo',
          openNotify: [],
          readeNotify: []
        }
        console.log('notification', notify)
        const notifyPost = await notificationsCollection.insertOne(notify);
        console.log('notification', notifyPost)
        console.log(result);
        res.send(result);
      } catch (err) {
        console.log("Error in /seasons POST endpoint:", err);
        res.status(500).send({ error: 'Internal Server Error', details: err.message });
      }

    });


    app.get('/episodes/:title', async (req, res) => {
      try {
        const { title } = req.params;

        // Find episodes by title (case-insensitive)
        const episodes = await episodesCollection.find({ title: { $regex: new RegExp(title, 'i') } }).toArray();

        // If no episodes are found, return a 404 status code
        if (episodes.length === 0) {
          return res.status(404).send('No episodes found with the given title');
        }

        // Send the list of episodes with matching titles in the response
        res.send({ episodes });
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


    app.get('/episodeSearch', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery;
        let query = {};

        // If a search query is provided, add a regex condition to search by movie name
        if (searchQuery) {
          query = { title: { $regex: new RegExp(searchQuery, 'i') } };
        }

        const pipeline = [
          { $match: query },
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = episodesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });


    app.get('/latestEpisodes', async (req, res) => {
      try {
        const pipeline = [
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = episodesCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });




    // episode  status update

    app.put('/latestEpisodes/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Update the status of the movie with the provided ID
        const result = await episodesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'Episode not found' });
        }
      } catch (err) {
        console.error("Error updating episode's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.get('/ep/:id', async (req, res) => {
      try {
        const epId = req.params.id;

        // Validate if movieId is a valid ObjectId
        if (!ObjectId.isValid(epId)) {
          return res.status(400).send('Invalid movie ID');
        }

        // Find the movie by its ID
        const episode = await episodesCollection.findOne({ _id: new ObjectId(epId) });

        // If the movie doesn't exist, return a 404 status code
        if (!episode) {
          return res.status(404).send('Episode not found');
        }

        // Update the view count if the movie has been watched for more than 10 seconds


        // Send the movie data in the response
        res.send(episode);
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    });




    app.get('/onlyId/:episodeId', async (req, res) => {
      try {
        const episodeId = req.params.episodeId;

        // Find the episode by its episodeId
        const episode = await episodesCollection.findOne({ episodeId });

        // If the episode doesn't exist, return a 404 status code
        if (!episode) {
          return res.status(404).send('Episode not found');
        }

        // Update the view count if necessary

        // Send the episode data in the response
        res.send(episode);
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/latestEpisodes/:id', async (req, res) => {
      try {
        const episodeId = req.params.id; // Get the movie ID from the request parameters
        const result = await episodesCollection.deleteOne({ _id: new ObjectId(episodeId) }); // Delete the movie document by ID

        if (result.deletedCount === 1) {
          res.status(200).send('Episode deleted successfully');
        } else {
          res.status(404).send('Episode not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });







    // episode watchlater collection

    app.post('/episodesWatchLater', async (req, res) => {
      const user = req.body;
      const result = await episodesWatchLaterCollection.insertOne(user);
      res.send(result);
    })



    app.get('/episodesWatchLater', async (req, res) => {
      try {
        let query = {};
        console.log(req.query)
        if (req.query?.episodeId && req.query?.email) {
          query = { episodeId: req.query.episodeId, email: req.query.email }
        }
        const result = await episodesWatchLaterCollection.findOne(query);
        console.log(result)
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      }
    })

    // views collection

    app.get('/allViews', async (req, res) => {
      try {
        // Create aggregation pipelines for each collection to count documents and sum views
        const moviesPipeline = [
          { $group: { _id: null, totalViews: { $sum: "$views" }, totalCount: { $sum: 1 } } }
        ];

        const episodePipeline = [
          { $group: { _id: null, totalViews: { $sum: "$views" }, totalCount: { $sum: 1 } } }
        ];

        // Perform aggregation on each collection
        const moviesCursor = moviesCollection.aggregate(moviesPipeline);
        const episodeCursor = episodesCollection.aggregate(episodePipeline);

        // Wait for all aggregations to complete
        const [moviesResult, showsResult] = await Promise.all([
          moviesCursor.toArray(),
          episodeCursor.toArray()
        ]);

        // Calculate total views count and total document count
        const totalViews = (moviesResult[0]?.totalViews || 0) + (showsResult[0]?.totalViews || 0);
        const totalCount = (moviesResult[0]?.totalCount || 0) + (showsResult[0]?.totalCount || 0);

        // Send the total views count and total document count as the response
        res.send({ totalViews, totalCount });
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });



    app.put('/latestViews/:id', async (req, res) => {
      try {
        const { id } = req.params;
        console.log(id)
        const { views } = req.body;
        console.log(views)
        // Update the status of the movie with the provided ID
        const result = await episodesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { views } }
        );
        console.log(result)
        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'Episode not found' });
        }
      } catch (err) {
        console.error("Error updating episode's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });



    app.put('/latestViews/:id', async (req, res) => {
      try {
        const { id } = req.params;
        console.log(id)
        const { views } = req.body;
        console.log(views)
        // Update the status of the movie with the provided ID
        const result = await moviesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { views } }
        );
        console.log(result)
        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'movie not found' });
        }
      } catch (err) {
        console.error("Error updating movie's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });








    // usersVideosCollection

    app.post('/usersVideos', async (req, res) => {
      try {
        const body = req.body;
        console.log(body)
        const result = await usersVideosCollection.insertOne(body)
        const notify = {
          videoId: result.insertedId.toHexString(),
          notifyImg: req.body.thumbnail.link,
          notifyTitle: 'Publish new Video',
          notifyText: req.body.title,
          notifyPostTime: new Date(),
          type: 'video',
          uploadType: 'userVideo',
          openNotify: [],
          readeNotify: []
        }
        console.log('notification', notify)
        const notifyPost = await notificationsCollection.insertOne(notify);
        console.log('notification', notifyPost)
        console.log(result)
        res.send(result)

      }
      catch (err) {
        console.log("this error is house collection post error", err)
      }
    })


    app.get('/latestUsersVideos', async (req, res) => {
      try {
        const pipeline = [
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const cursor = usersVideosCollection.aggregate(pipeline);
        const result = await cursor.toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });




    app.get('/usersVideos/:email', async (req, res) => {
      try {
        const userEmail = req.params.email; // Extract the user's email from the URL parameters

        const query = { email: userEmail }; // Initialize a query object with the user's email

        // Perform query to fetch the videos for the specified user
        const result = await usersVideosCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/usersVideosSearch', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery; // Extract the search query from the request query parameters
        let query = {}; // Initialize an empty query object

        // If a search query is provided, add a regex condition to search by username
        if (searchQuery) {
          query = { userName: { $regex: new RegExp(searchQuery, 'i') } };
        }

        // Aggregate query to get the last user first
        const aggregationPipeline = [
          { $match: query },
          { $sort: { signupDate: -1 } } // Sort by signupDate in descending order to get the last user first
        ];

        // Perform aggregation
        const result = await usersVideosCollection.aggregate(aggregationPipeline).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });




    app.put('/latestUsersVideos/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Update the status of the movie with the provided ID
        const result = await usersVideosCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        // Check if the movie was found and updated successfully
        if (result.matchedCount > 0) {
          res.send({ acknowledged: true });
        } else {
          res.status(404).send({ error: 'User not found' });
        }
      } catch (err) {
        console.error("Error updating user's status:", err);
        res.status(500).send({ error: 'Internal Server Error' });
      }
    });


    app.delete('/latestUsersVideos/:id', async (req, res) => {
      try {
        const userId = req.params.id; // Get the movie ID from the request parameters
        const result = await usersVideosCollection.deleteOne({ _id: new ObjectId(userId) }); // Delete the movie document by ID

        if (result.deletedCount === 1) {
          res.status(200).send('User deleted successfully');
        } else {
          res.status(404).send('user not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });



    // ----------------------------------- Alauddin code end  hare ----------------




    // hellal code start hare -----





    app.get('/allreport', async (req, res) => {
      try {
        const cursor = reportCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })

    app.post('/report', async (req, res) => {
      try {
        const body = req.body;
        console.log(body)
        const result = await reportCollection.insertOne(body)
        console.log(result)
        res.send(result)

      }
      catch (err) {
        console.log("this error is shows collection post error", err)
      }
    })









    // notificationsCollection


    app.get('/notifications', async (req, res) => {
      const query = req.query?.email;
      const checkUser = notificationsCollection.find({ openNotify: { $ne: query } })
      const result = await checkUser.toArray();
      res.send(result);
    })

    app.get('/notifications/read', async (req, res) => {
      const query = req.query?.email;

      const checkUser = notificationsCollection.find({ type: { $in: ["video", "message", "episode"] } }).sort({ notifyPostTime: -1 });
      const result = await checkUser.toArray();
      res.send(result);
    });


    // testing post data , production level remove this or video notify post method
    app.post('/notifications', async (req, res) => {
      const notify = req.body;
      const result = await notificationsCollection.insertOne(notify);
      res.send(result)
    })

    app.patch('/notifications/openNotify', async (req, res) => {
      const query = req.query?.email;
      const filter = { openNotify: { $ne: query } }
      const updateOpen = { $push: { openNotify: query } }
      const result = await notificationsCollection.updateMany(filter, updateOpen);
      res.send(result);
    });
    app.patch('/notifications/completeRead/:id', async (req, res) => {
      const id = req.params.id;
      const query = req.query?.email;
      const filter = { _id: new ObjectId(id), readeNotify: { $ne: query } }
      const updateCompleteRead = { $push: { readeNotify: query } }
      console.log(updateCompleteRead, id, query)
      const result = await notificationsCollection.updateOne(filter, updateCompleteRead);
      console.log(result)
      res.send(result);
    });






    // CommentCollection
    app.post('/comments', async (req, res) => {
      const newComment = req.body;
      console.log(newComment)
      const result = await commentsCollection.insertOne(newComment);
      res.send(result)
    })

    // ShareCollection


    // RatingCollection

    app.post("/rating", async (req, res) => {
      const data = req.body
      // console.log(data)
      const result = await ratingCollection.insertOne(data)
      res.send(result)
    })


    // rating code -----
    app.get('/ratings', async (req, res) => {
      const cursor = ratingCollection.find()
      const query = await cursor.toArray()
      res.send(query)
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


    app.get('/celebrities', async (req, res) => {
      try {
        const cursor = celebrityCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })
    app.get('/celebrities/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }

        const cursor = await celebrityCollection.findOne(query)
        console.log(id, query, cursor);
        res.send(cursor)
      }
      catch (err) {
        console.log(err);
      }
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


    // --------------------All Get code end hare-------------------------------


    // -------------------- Update code start hare-------------------------------
    // user status update




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

    //like button
    app.patch('/comment/like', async (req, res) => {

      // const commentLike = req.body;
      // console.log(commentLike.like._id);
      if (req.body.like.parentId === "null") {
        const filter = { _id: new ObjectId(req.body.like?._id) };
        const updateLike = { $push: { like: req.body.like.userLike } }

        console.log(req.body.like.userLike)
        const result = await commentsCollection.updateOne(filter, updateLike);
        console.log(result)
        res.send(result);
      }
      else {
        const filter = { _id: new ObjectId(req.body.like?._id) };
        const updateLike = { $push: { like: req.body.like.userLike } }

        console.log(req.body.like.userLike)
        const result = await commentsCollection.updateOne(filter, updateLike);
        console.log(result)
        res.send(result);
      }

    })

    //DisLike button
    app.patch('/comment/dislike', async (req, res) => {

      // const commentLike = req.body;
      // console.log(commentLike.like._id);
      if (req.body.dislike.parentId === "null") {
        const filter = { _id: new ObjectId(req.body.dislike?._id) };
        const updateDislike = { $pull: { like: req.body.dislike.userDislike } }
        console.log(req.body.dislike.userDislike)
        const result = await commentsCollection.updateOne(filter, updateDislike);
        console.log(result)
        res.send(result);
      }
      else {
        const filter = { _id: new ObjectId(req.body.dislike?._id) }
        const updateDislike = { $pull: { like: req.body.dislike.userDislike } }
        console.log(req.body.dislike.userDislike)
        const result = await commentsCollection.updateOne(filter, updateDislike);
        console.log(result)
        res.send(result);
      }
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
      // console.log(id)
      const query = { _id: new ObjectId(id) }
      const result = await packagesCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })


    // payment start 
    app.get('/payments', async (req, res) => {
      try {
        const cursor = paymentsCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      }
      catch (err) {
        console.log(err)
      }
    })
    app.get('/payments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { transactionId: id }
      // console.log(id)
      const result = await paymentsCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })

    app.post('/payment', async (req, res) => {
      const packageData = await packagesCollection.findOne({ _id: new ObjectId(req.body?._id) })
      const tran_id = new ObjectId().toString();
      const data = {
        total_amount: packageData?.price,
        currency: 'BDT',
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: (`https://endgame-team-server.vercel.app/payment/success/${tran_id}?packageData=${packageData?.packageName}&email=${req.query?.email}`),
        fail_url: `https://endgame-team-server.vercel.app/payment/fail/${tran_id}`,
        cancel_url: `https://endgame-team-server.vercel.app/payment/cancel/${tran_id}`,
        ipn_url: 'http://localhost:3030/ipn',
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

      try {
        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
        sslcz.init(data).then(apiResponse => {
          //   // Redirect the user to payment gateway
          let GatewayPageURL = apiResponse.GatewayPageURL
          res.send({ url: GatewayPageURL })
          // console.log('Redirecting to: ', { url: GatewayPageURL })
        });
      } catch (error) {
        console.log('error', error)
      }
      // store in payments collection
      const finalData = {
        paymentDate: new Date(),
        package: packageData?.packageName,
        isPayment: true,
        transactionId: tran_id,
        email: req?.query?.email,
        bank: 'SSLCommerz',
        mobile: '01711111111',
        amount: packageData?.price,
        paymentType: 'netBanking',
      }
      const paymentCollect = await paymentsCollection.insertOne(finalData);

      // if user success payment then hit this route
      app.post('/payment/success/:tranId', async (req, res) => {
        const filter = { email: req.query?.email };
        const updateBlog = {
          $set: {
            packagePurchaseDate: new Date(),
            package: req.query.packageData,
            isPayment: true,
            transactionId: req.params.tranId
          }
        }
        const result = await usersCollection.updateOne(filter, updateBlog);
        if (result.modifiedCount > 0) {
          res.redirect(
            `https://streme-eight.vercel.app/subscribe/success/${req.params.tranId}`
          )
        }
      });
      // if user success function End

      // if user fail function
      app.post('/payment/fail/:tranId', async (req, res) => {
        const tranId = req.params.tranId
        console.log(tranId)
        const query = { transactionId: tranId }
        const result = await paymentsCollection.deleteOne(query)
        console.log(result)
        if (result.deletedCount > 0) {
          res.redirect(
            `https://streme-eight.vercel.app/subscribe/fail/${req.params.tranId}`
          )
        }
      })

      // if user cancel function
      app.post('/payment/cancel/:tranId', async (req, res) => {
        const tranId = req.params.tranId
        console.log('cancel', tranId)
        const query = { transactionId: tranId }
        const result = await paymentsCollection.deleteOne(query)
        console.log('cancel', result)
        if (result.deletedCount > 0) {
          res.redirect(
            `https://streme-eight.vercel.app/subscribe/fail/${req.params.tranId}`
          )
        }
      })

    });

    // payment end --------------



    // ----------------------------- Added by Mujahid  code start-----------------

    // mixaup all   movie and episode get

    app.get('/allDatas', async (req, res) => {
      try {
        const searchQuery = req.query.searchQuery;
        let query = {};

        // If a search query is provided, add a regex condition to search by title
        if (searchQuery) {
          query = { title: { $regex: new RegExp(searchQuery, 'i') } };
        }

        // Create aggregation pipelines for each collection
        const moviesPipeline = [
          { $match: query },
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        const showsPipeline = [
          { $match: query },
          { $sort: { _id: -1 } } // Sort by _id field in descending order
        ];

        // Perform aggregation on each collection
        const moviesCursor = moviesCollection.aggregate(moviesPipeline);
        const showsCursor = showsCollection.aggregate(showsPipeline);

        // Wait for all aggregations to complete
        const [moviesResult, showsResult] = await Promise.all([
          moviesCursor.toArray(),
          showsCursor.toArray()
        ]);

        // Combine the results from all collections into a single array
        const combinedResult = [...moviesResult, ...showsResult];

        // Send the combined result as the response
        res.send(combinedResult);
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });





    app.post('/like', async (req, res) => {
      const user = req.body;
      const result = await likeCollection.insertOne(user);
      res.send(result);
    })

    app.post('/playlist', async (req, res) => {
      const user = req.body;
      const result = await playListCollection.insertOne(user);
      res.send(result);
    })

    app.get('/playlist/:email', async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const filter = { email: email };
      const result = await playListCollection.find(filter).toArray();
      res.send(result);
    });


    app.get('/like/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { email: email };
      const result = await likeCollection.find(filter).toArray();
      res.send(result);
    });
    app.get('/like', async (req, res) => {
      const result = await likeCollection.find().toArray();
      res.send(result);
    });


    app.get('/like/:id/:email', async (req, res) => {
      const id = req.params.id;
      const email = req.params.email;

      try {
        const query = { "data._id": id, email: email };
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
        const query = { "data._id": id, email: email };
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


    app.get('/chatbot', async (req, res) => {
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

    app.get('/movie', async (req, res) => {
      const user = req.params.id;
      const result = await moviesCollection.find().toArray();
      res.send(result)
    })

    app.post('/messageData', async (req, res) => {
      const user = req.body;
      const sendMessage = await messageCollection.insertOne(user);
      res.send(sendMessage)
    })

    app.delete('/playlist/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await playListCollection.deleteOne(filter);
      res.send(result);
    })

    app.delete('/like/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await likeCollection.deleteOne(filter);
      res.send(result);
    })










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
