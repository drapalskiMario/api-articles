const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/knowledge', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.connection.on('error', err => console.log('Error:', err))
