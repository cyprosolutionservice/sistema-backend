const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cors());

//ROUTES

const userRoute = require('./api/routes/user');
app.use('/user', userRoute);
let variableData = userRoute.rutForeignKey;

//console.log("Esta es app.js variable global ->> "+variableData);


const userRoute3 = require('./api/routes/user3');
app.use('/user3', userRoute3);

module.exports = app;