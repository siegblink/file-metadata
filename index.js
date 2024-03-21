require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const { MongoClient } = require('mongodb');

// Connect to MongoDB database
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('file_metadata');
const filesCollection = db.collection('files');

// Multer configuration
const upload = multer({ dest: 'uploads/' });

// Middlewares
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---API Routes---

/**
 * GET route for the home page.
 * Sends the index.html file as the response.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/**
 * Middleware function to handle file uploads and store metadata.
 * Inserts the file metadata into the MongoDB database.
 * Sends the file metadata as the response.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
async function uploadMetaData(req, res) {
  const { originalname, mimetype, size } = req.file;

  // Save file metadata to database
  await filesCollection.insertOne({
    name: originalname,
    type: mimetype,
    size,
  });

  res.json({ name: originalname, type: mimetype, size });
}

/**
 * POST route for file uploads and metadata storage.
 * Uses the 'upload' middleware to handle file uploads.
 * Calls the 'uploadMetaData' middleware to store file metadata.
 *
 * @param {Request} req The request object
 * @param {Response} res The response object
 */
app.post('/api/fileanalyse', upload.single('upfile'), uploadMetaData);

// Port connection
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
