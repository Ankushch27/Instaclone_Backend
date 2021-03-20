const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongo', process.env.MONGODB_URL);
});

mongoose.connection.on('error', (error) => {
  console.log(`Error connecting ${error}`);
});
