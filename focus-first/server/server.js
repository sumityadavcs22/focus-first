const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/focus-first';

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("MongoDB database connection established successfully"))
.catch(err => console.log("MongoDB connection error: ", err));

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});

// Define schemas
const TopicSchema = new mongoose.Schema({
  userId: String,
  topic: String,
  createdAt: { type: Date, default: Date.now }
});

const BlockedSiteSchema = new mongoose.Schema({
  userId: String,
  site: String,
  createdAt: { type: Date, default: Date.now }
});

const Topic = mongoose.model('Topic', TopicSchema);
const BlockedSite = mongoose.model('BlockedSite', BlockedSiteSchema);

// Define routes
const topicsRouter = express.Router();
const blockedSitesRouter = express.Router();

// Topics routes
topicsRouter.route('/').post(async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

topicsRouter.route('/').get(async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.query.userId });
    res.json(topics);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Blocked sites routes
blockedSitesRouter.route('/').post(async (req, res) => {
  try {
    const blockedSite = new BlockedSite(req.body);
    await blockedSite.save();
    res.status(201).json(blockedSite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

blockedSitesRouter.route('/').get(async (req, res) => {
  try {
    const blockedSites = await BlockedSite.find({ userId: req.query.userId });
    res.json(blockedSites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

blockedSitesRouter.route('/').delete(async (req, res) => {
  try {
    await BlockedSite.deleteMany({ userId: req.body.userId });
    res.status(200).json({ message: 'All blocked sites deleted for user' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Use routes
app.use('/topics', topicsRouter);
app.use('/blocked-sites', blockedSitesRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
