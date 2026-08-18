const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const fileUpload = require("express-fileupload");


const app = express();

app.use(express.json());
app.use(cors());

app.use(fileUpload())
app.use(express.urlencoded({extended:true}))


mongoose
  .connect(process.env.url)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.log(err));

const userroute = require("./Route/UserRoute");
app.use('/user', userroute);

const locationroute=require('./Route/LocationRoute')
app.use('/location',locationroute)

const adminroute=require('./Route/AdminRoute')
app.use('/admin',adminroute)

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("running server", port);
});
