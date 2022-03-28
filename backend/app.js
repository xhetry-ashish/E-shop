const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv/config");
const cors = require('cors');
const api = process.env.API_URL;
const port = process.env.PORT;
const productRouter = require('./routers/product');
const categoryRouter = require('./routers/category');
const userRouter = require('./routers/user');
const orderRouter = require('./routers/order');
const authJwt = require("./helper/jwt");
const errorHandler = require("./helper/error-handler");

//enabling cors
app.use(cors());
app.options('*',cors());


///middleware
app.use(bodyparser.json());
app.use(morgan("tiny")); //keeping log
app.use('/public/uploads',express.static(__dirname  + '/public/uploads'))
app.use(authJwt());
app.use(errorHandler)


//routes
app.use(`${api}/products`,productRouter)
app.use(`${api}/categories`,categoryRouter)
app.use(`${api}/users`,userRouter)
app.use(`${api}/orders`,orderRouter)



//database connection
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database Connection Ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
