var express = require('express');
var fs = require("fs");
var router = express.Router();

var membersDetail;

var CLI_GET_MEMBERS = "fogbow-cli member --url http://10.11.4.172:8182 --auth-token /tmp/token "



// token --create -Dbase="+"-Dencrypt="+"-DprivateKey="+"-DpublicKey="

fs.readFile( __dirname + "/" + "membersDetail.json", 'utf8', function (err, data) {
	console.log("File readed "+data);
   	membersDetail = data
});


var api = {
	getMembers: function(){
		return membersDetail;
	}
};

module.exports = api