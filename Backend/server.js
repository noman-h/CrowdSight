const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const fileUpload = require("express-fileupload");
const { startAutoCheckoutJob } = require('./Utils/AutoCheckoutJob')


const app = express();

app.use(express.json());
app.use(cors());

app.use(fileUpload())
app.use(express.urlencoded({extended:true}))


mongoose
  .connect(process.env.url)
  .then(() => {
    console.log("connected to mongodb")
    startAutoCheckoutJob()
  })
  .catch((err) => console.log(err));

const userroute = require("./Route/UserRoute");
app.use('/user', userroute);

const locationroute=require('./Route/LocationRoute')
app.use('/location',locationroute)

const adminroute=require('./Route/AdminRoute')
app.use('/admin',adminroute)

const palaceroute=require('./Route/PalaceRoute')
app.use('/palace',palaceroute)

const qrroute=require('./Route/Qrroute')
app.use('/palaceqr',qrroute)

const checkinoutroute=require('./Route/CheckinRoute')
app.use('/checkin',checkinoutroute)

const reviewroute=require('./Route/ReviewRoute')
app.use('/review',reviewroute)

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("running server", port);
});
