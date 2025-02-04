require("./db/mongodb.js");
const path = require("path");
const express = require("express");
const expressFile = require("express-fileupload");
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT

const adminRouter = require("./routers/admin-router.js");
const productRouter = require("./routers/product-router.js");
const orderRouter = require("./routers/order-router.js");
const userRouter = require("./routers/user-router.js");
const cartRouter = require("./routers/cart-router.js");
const reviewRouter = require("./routers/review-router.js");
const paymentRouter = require("./routers/payment-router.js");

app.use(cors({
    origin: process.env.URL,
    methods: ['POST', 'PATCH', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    exposedHeaders: ["set-cookie"]
  }));
const staticFilesDir = path.join(__dirname, "../public");
app.use(express.static(staticFilesDir));

app.use(session({
  secret: process.env.SECRET,
  saveUninitialized: false, resave: false, 
  proxy:true,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60
  }
}));

app.use(expressFile());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(adminRouter);
app.use(productRouter);
app.use(orderRouter);
app.use(userRouter);
app.use(cartRouter);
app.use(reviewRouter);
app.use(paymentRouter)

app.use((err, req, res, next) =>{
  err.statusCode = err.statusCode || 500
  err.status = err.status || "Something went wrong in server side!"

  res.status(err.statusCode).send({
    error: err.message,
    status: err.status
  })
})

app.listen(PORT, () =>{
    console.log("server is running!")
})