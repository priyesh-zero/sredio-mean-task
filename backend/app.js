require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const githubRoutes = require('./routes/githubRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

app.use('/auth/github', githubRoutes);
app.use('/sync', syncRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
