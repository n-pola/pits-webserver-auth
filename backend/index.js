const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const Mongoose = require('mongoose');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

Mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch((error) => console.log(JSON.stringify(error)));
const db = Mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => {
  console.log('connected to database');
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(routes);
  app.listen(3000, () => {
    console.log('Server running');
  });
});
