require("./db/mongodb.js");
const path = require("path");
const express = require("express");
const expressFile = require("express-fileupload");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT

const staticFilesDir = path.join(__dirname, "../public");
app.use(express.static(staticFilesDir));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({secret: process.env.SECRET, saveUninitialized: true, resave: true}))
app.use(expressFile());

app.listen(PORT, () =>{
    console.log("server is running!")
})