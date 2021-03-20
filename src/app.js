const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/userRouter')
const postRouter = require('./routers/postRouter')

const app = express();
const PORT = process.env.PORT;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(userRouter)
app.use(postRouter)

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
