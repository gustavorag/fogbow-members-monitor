var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var exec = require('child_process').exec;
//var fogbowApi = require('./routes/fogbowApi.js');

var app = express();
var port = 8800;


var membersDetail;

var baseLdap="dc=lsd,dc=ufcg,dc=edu,dc=br";
var encrypt="";
var privateKey="";
var publicKey="";
var username="fogbowadm";
var password="f0gb0w4dm";
var authUrl="ldap://ldap.lsd.ufcg.edu.br:389";
var managerUrl="http://10.11.4.234:8182"


var baseDiretory="";
var tokenFile = "";
var token = "eyJsb2duaW4iOiJmb2dib3dhZG0iLCJuYW1lIjoiRm9nYm93IEFETSIsImV4cGlyYXRpb25EYXRlIjoxNTIyNjQ2Nzk3MDA1fSEjIU1rRE9mR3lkcDBGYzNaSFNLTEU2TloyeEtaa1p3WWpUeGpaZURwSU5PdmtxNW5UaWVlUmtOOGVIcFQvZjVBYWNHMExML2lySjBzOG9qNXJualcvVm1LSHBTMHNCR3ZkZGdER0JRRjhYbGtaRXdHU00rVmJZT0ZWNWxocTFpRGl0N2Z3dGxXdHRubU41Qno3YTBUcElNQmNxSjg3UWROZ2RUdXY4b3cyS2dKdXBrV0JEN20valZBQlVER0NpUXRqcXRIMDNPcGh5OEFMc2FNSTdHa012djVKVFdMRFIrVVd3L25DRXRJT3JEUkRmWGlvV2g5ZUFoVkRHWUtKckhjSEVPYWxVQ2Nja0N0by9wRjl6d1A2RDFWRkh2QW9hNlhKYnM4NE4xSEFjQXRIQ3FvdnpJeDV1LzJsVGZwQkkwQm9vc0ZNMWQweTJacE53cEVvNVllSEVWQT09";

var createTokenBase=" token --create --type ldap ";

var CLI_BASE_COMMAND = "";
var CLI_CREATE_TOKEN = "";


var createTokenFunc = function(startApiFunc){

	console.log("Creating token");
	console.log("Executing: "+CLI_CREATE_TOKEN+" > "+tokenFile);
	
	var childTest = exec(CLI_CREATE_TOKEN+" > "+tokenFile, function (error, stdout, stderr) {
		console.log("Stdout: "+stdout);
		console.log("Stderr: "+stderr);
		if (error !== null) {
			console.log('exec error: ' + error);
		}else{
			token = "eyJsb2duaW4iOiJmb2dib3dhZG0iLCJuYW1lIjoiRm9nYm93IEFETSIsImV4cGlyYXRpb25EYXRlIjoxNTIyNjQ2Nzk3MDA1fSEjIU1rRE9mR3lkcDBGYzNaSFNLTEU2TloyeEtaa1p3WWpUeGpaZURwSU5PdmtxNW5UaWVlUmtOOGVIcFQvZjVBYWNHMExML2lySjBzOG9qNXJualcvVm1LSHBTMHNCR3ZkZGdER0JRRjhYbGtaRXdHU00rVmJZT0ZWNWxocTFpRGl0N2Z3dGxXdHRubU41Qno3YTBUcElNQmNxSjg3UWROZ2RUdXY4b3cyS2dKdXBrV0JEN20valZBQlVER0NpUXRqcXRIMDNPcGh5OEFMc2FNSTdHa012djVKVFdMRFIrVVd3L25DRXRJT3JEUkRmWGlvV2g5ZUFoVkRHWUtKckhjSEVPYWxVQ2Nja0N0by9wRjl6d1A2RDFWRkh2QW9hNlhKYnM4NE4xSEFjQXRIQ3FvdnpJeDV1LzJsVGZwQkkwQm9vc0ZNMWQweTJacE53cEVvNVllSEVWQT09"
			if(startApiFunc){
				startApiFunc();
			}
		}
	});
}

var initialConfiguration = function(){

	console.log("Initiating configuration");

	var childReadDir = exec("pwd", function (error, stdout, stderr) {

	  baseDiretory=stdout.replace(/(\r\n|\n|\r)/gm,""); //This rex is for remove linebreak
	  tokenFile=baseDiretory+"/fogbow-components/token-file";
	  privateKey=baseDiretory+"/fogbow-components/keys/private_key.pem";
	  publicKey=baseDiretory+"/fogbow-components/keys/public_key.pem";
	  console.log('Base diretory: ' + baseDiretory);
	  console.log('tokenFile: ' + tokenFile);
	  if (error !== null) {
	    console.log('exec error: ' + error);
	  }else{
		CLI_BASE_COMMAND = "java -cp "+baseDiretory+"/fogbow-components/fogbow-cli-0.0.1-SNAPSHOT-jar-with-dependencies.jar org.fogbowcloud.cli.Main"
		CLI_CREATE_TOKEN = CLI_BASE_COMMAND+createTokenBase+"-Dbase="+baseLdap+" -Dencrypt= -DprivateKey="+privateKey+" -DpublicKey="+publicKey+" -Dusername="+username+" -Dpassword="+password+" -DauthUrl="+authUrl
		
	  	//createTokenFunc(startApi);
	  	startApp();
	  }
	});
}


var extractMemberDetail = function(details){
	
	var detailsJson = {};
	// Format: cpuQuota=10;cpuInUse=6;cpuInUseByUser=4;memQuota=1024;memInUse=512;memInUseByUser=512;instancesQuota=10;instancesInUse=3;instancesInUseByUser=1
	var itens = details.split(';');
	if(Array.isArray(itens)){
		itens.forEach(function(value, index){
			//Format: cpuInUse=6
			var keyValue = value.split('=');
			if(Array.isArray(keyValue) && keyValue.length > 1){
				detailsJson[String(keyValue[0])] = keyValue[1];	
			}
		});
	}

	return detailsJson;
}

var processMemberDetail = function(member, details){

	//Calculate Usages in %
	member.memUsage = ((details.memInUse * 100) / details.memQuota).toFixed(2);
	member.cpuUsage = ((details.cpuInUse * 100) / details.cpuQuota).toFixed(2);
	member.instanceUsage = ((details.instancesInUse * 100) / details.instancesQuota).toFixed(2);
	member.instancesInUse = details.instancesInUse;
	member.intancesQuota = details.instancesQuota;

	return member;
}


function startApp(){

	var fogbowApi = {
		getMembers: function(req, res){

			var getMemberDetail = function(req, res, members){
				

				//console.log("Executing: "+CLI_GET_MEMBERS);
				// var childTest = exec(CLI_GET_MEMBER_DETAIL, function (error, stdout, stderr) {
				// 	console.log("Stdout: "+stdout);
				// 	console.log("Stderr: "+stderr);
				// 	if (error !== null) {
				// 		console.log('exec error: ' + error);
				// 	}else{
				// 		return stdout.split(/(\r\n|\n|\r)/gm);
				// 	}
				// });

				var membersJson = [];
				//console.log("Members: "+JSON.stringify(members));
				if(Array.isArray(members)){
					
					members.forEach(function(item, index){
						if(item){
							var getMemberDetailCli=" member --url "+managerUrl+" --quota --id "+item+" --auth-token "+token;
							var CLI_GET_MEMBER_DETAIL = CLI_BASE_COMMAND+getMemberDetailCli;
							
							console.log("Executing: " CLI_GET_MEMBER_DETAIL);

							var newMember = {
								name:item,
								memUsage:0,
								cpuUsage:0,
								instanceUsage:0,
								instancesInUse:0,
								intancesQuota:0
							}
							var childTest = exec(CLI_GET_MEMBER_DETAIL, function (error, stdout, stderr) {
								//console.log("Stdout: "+stdout);
								//console.log("Stderr: "+stderr);
								if (error !== null) {
									console.log('exec error: ' + error);
								}else{
									
									var detailsString = stdout.replace(/(\r\n|\n|\r)/gm, ';');
									detailsString = detailsString.replace(/X-OCCI-Attribute: /g, '');
									//console.log('Detalhes: '+JSON.stringify(detailsString));

									var memberDetails = extractMemberDetail(detailsString);

									newMember = processMemberDetail(newMember, memberDetails);

									membersJson.push(newMember);
									
								}
								if(index+1 == members.length){
									res.send(membersJson);
									res.end();
								}
							});
							// var detailsString = "X-OCCI-Attribute: cpuQuota=60\n"+
							// 					"X-OCCI-Attribute: cpuInUse=20\n"+
							// 					"X-OCCI-Attribute: cpuInUseByUser=16\n"+
							// 					"X-OCCI-Attribute: memQuota=77824\n"+
							// 					"X-OCCI-Attribute: memInUse=65536\n"+
							// 					"X-OCCI-Attribute: memInUseByUser=57344\n"+
							// 					"X-OCCI-Attribute: instancesQuota=30\n"+
							// 					"X-OCCI-Attribute: instancesInUse=6\n"+
							// 					"X-OCCI-Attribute: instancesInUseByUser=2";

							
							// detailsString = detailsString.replace(/(\r\n|\n|\r)/gm, ';');
							// detailsString = detailsString.replace(/X-OCCI-Attribute: /g, '');
							// //console.log('Detalhes: '+JSON.stringify(detailsString));

							// var memberDetails = extractMemberDetail(detailsString);

							// newMember = processMemberDetail(newMember, memberDetails);

							// membersJson.push(newMember);
						}
					});

				}

				// res.send(membersJson);
				// res.end();				
			}

			var getMembersCli=" member --url "+managerUrl+" --auth-token "+token;
			var CLI_GET_MEMBERS = CLI_BASE_COMMAND+getMembersCli;

			console.log("Executing: "+CLI_GET_MEMBERS);
			var childTest = exec(CLI_GET_MEMBERS, function (error, stdout, stderr) {
				
				if (error !== null) {
					console.log('exec error: ' + error);
				}else{
					// return stdout.split(/(\r\n|\n|\r)/gm);
					// var stdout = "catch-all.manager.naf.lsd.ufcg.edu.br\nfogbow-manager-rec.compute.rnp.br\nlsd.manager.naf.lsd.ufcg.edu.br\nmanager.naf.ufscar.br\ntu.dresden.manager.naf.lsd.ufcg.edu.br"
					stdout = stdout.replace(/(\r\n|\n|\r)/gm, ';');
					getMemberDetail(req, res, stdout.split(';'));
				}
			});
			// var stdout = "catch-all.manager.naf.lsd.ufcg.edu.br\nfogbow-manager-rec.compute.rnp.br\nlsd.manager.naf.lsd.ufcg.edu.br\nmanager.naf.ufscar.br\ntu.dresden.manager.naf.lsd.ufcg.edu.br"
			// stdout = stdout.replace(/(\r\n|\n|\r)/gm, ';');
			// getMemberDetail(req, res, stdout.split(';'));
			
		}
	};

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

		//console.log("Returning "+fogbowApi.getMembers());
		fogbowApi.getMembers(req, res);
	  //res.sendFile(path.join(__dirname + '/public/index.html'));
	});

}

initialConfiguration();


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