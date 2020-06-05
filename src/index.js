const express = require('express')
const dotenv = require('dotenv').config()
const routes = require('../src/routes')
const Mongoose = require('mongoose')
const app = express()
const helmet = require('helmet')


app.use(helmet())
app.use(express.json())
app.use(routes)
app.listen(3000, () => { console.log("Server running") })


Mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true }).catch(
    (error) => console.log(JSON.stringify(error))
)
const db = Mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

