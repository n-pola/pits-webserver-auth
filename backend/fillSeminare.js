const Mongoose = require('mongoose');
const seminar = require('./models/seminar');
require('dotenv').config();

function filldb() {
  const newSem = new seminar({
    title: 'C Key/Value Store',
    date: new Date(),
    description: 'Es wird ein Key Value Store in C gebaut'
  });

  newSem.save();
}

Mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch((error) => console.log(JSON.stringify(error)));
const db = Mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => {
  console.log('connected to database');
  filldb();
});
