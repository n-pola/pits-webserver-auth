const express = require('express')
const dotenv = require('dotenv').config()
const routes = require('../src/routes')

const app = express()
app.use(express.json())
app.use(routes)
app.listen(3000, () => { console.log("Server running") })