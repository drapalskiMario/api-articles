const app = require('express')()
const consing = require('consign')
const db = require('./config/db')
const mongoose = require('mongoose')
const { serverPort } = require('./.env')

require('./config/mongo')
app.db = db
app.mongo = mongoose

consing()
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./api/validator.js')
  .then('./api')
  .then('./schedule')
  .then('./config/routes.js')
  .into(app)

app.listen(serverPort, () => {
  console.log('Server running')
})
