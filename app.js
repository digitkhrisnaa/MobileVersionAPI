/*
* Author: digitkhrisnaa
*/

//import dependecies
var express = require ("express");
var expressJWT = require("express-jwt");
var bodyParser   = require('body-parser');
var config = require("./src/util/config");
var MongoClient = require('mongodb').MongoClient , assert = require('assert');
var versionRoutes = require("./src/routes/version_routes");

//Use express
var app = express();

//Set bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//Except JWT header for login path
//app.use(expressJWT({secret:config.secret}).unless({path:['/api/v1/index']}));

//Create routes
versionRoutes(app);

//Open port and start application
app.listen(config.port, () => console.log('App started listening on port', config.port));
