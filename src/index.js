require("./db/mongodb.js");
const path = require("path");
const express = require("express");
const expressFile = require("express-fileupload");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT

const adminRouter = require("./routers/admin-router.js");
const productRouter = require("./routers/product-router.js");
const orderRouter = require("./routers/order-router.js");
const userRouter = require("./routers/user-router.js");
const cartRouter = require("./routers/cart-router.js");

app.use((req, res, next) =>{
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

const staticFilesDir = path.join(__dirname, "../public");
app.use(express.static(staticFilesDir));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({secret: process.env.SECRET, saveUninitialized: true, resave: true}))
app.use(expressFile());

app.use(adminRouter);
app.use(productRouter);
app.use(orderRouter);
app.use(userRouter);
app.use(cartRouter);

app.listen(PORT, () =>{
    console.log("server is running!")
})