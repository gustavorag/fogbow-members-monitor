var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var fogbowApi = require('./routes/fogbowApi.js');

var app = express();
var port = 8800;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, '/public'))); //Point to Angular frontend content


app.listen(port, function(err, res){
	if(err){
		console.log("Error while starting server");
	}else{
		console.log("Running at "+port);		
	}
});

//Return index page.
app.get("/members", function(req, res) {
	console.log("Returning "+fogbowApi.getMembers());
	res.send(fogbowApi.getMembers());
	res.end();
  //res.sendFile(path.join(__dirname + '/public/index.html'));
});

//Routing for api

//app.use('/api', fogbowApi);

// function validate(req, res, next){
// 	console.log("Validating")
// 	next();
// }

//Sampler for get
// app.get("URL",
// 	cors.initialize(),
// 	auth.verify(),
// 	function(req, res){

// });