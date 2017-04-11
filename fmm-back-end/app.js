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
		CLI_BASE_COMMAND = "java -cp "+baseDiretory
		+"/fogbow-components/fogbow-cli-0.0.1-SNAPSHOT-jar-with-dependencies.jar "
		+"org.fogbowcloud.cli.Main "
		CLI_CREATE_TOKEN = CLI_BASE_COMMAND+createTokenBase+"-Dbase="+baseLdap
		+" -Dencrypt= -DprivateKey="+privateKey+" -DpublicKey="+publicKey+" -Dusername="
		+username+" -Dpassword="+password+" -DauthUrl="+authUrl
		
	  	startApp();
	  }
	});
}


var extractMemberDetail = function(details){
	console.log("extracting details: "+details)
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

var countCall = 0;

var processMemberDetail = function(member, details){
	console.log("Processing Member details: "+member+" \n "+JSON.stringify(details))
	//Calculate Usages in %
	if(details.memInUse > 0){
		member.memUsage = ((details.memInUse * 100) / details.memQuota).toFixed(2);	
	}else{
		member.memUsage = 0;
	}
	if(details.cpuInUse > 0){
		member.cpuUsage = ((details.cpuInUse * 100) / details.cpuQuota).toFixed(2);
	}else{
		member.cpuUsage = 0;
	}
	if(details.instancesInUse > 0){
		member.instanceUsage = ((details.instancesInUse * 100) / details.instancesQuota).toFixed(2);
	}else{
		member.instanceUsage = 0;
	}
	
	member.instancesInUse = details.instancesInUse;
	member.intancesQuota = details.instancesQuota;

	return member;
}


function startApp(){

	var fogbowApi = {
		countCall : 0,
		getMemberDetail: function(req, res, memberId){
			
			var getMemberDetailCli=" member --url "+managerUrl+" --quota --id "
			+memberId+" --auth-token "+token;
			var CLI_GET_MEMBER_DETAIL = CLI_BASE_COMMAND+getMemberDetailCli;
			
			console.log("Executing: "+CLI_GET_MEMBER_DETAIL);

			var newMember = {
				name:memberId,
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
					membersErrorCount++;
					console.log('exec error: ' + error);
				}else{
					
					var detailsString = stdout.replace(/(\r\n|\n|\r)/gm, ';');
					if(detailsString.match(/X-OCCI-Attribute: /)){

						detailsString = detailsString.replace(/X-OCCI-Attribute: /g, '');
						//console.log('Detalhes: '+JSON.stringify(detailsString));

						var memberDetails = extractMemberDetail(detailsString);

						newMember = processMemberDetail(newMember, memberDetails);

						membersJson.push(newMember);

						res.send(newMember);
						res.end();

					}else{
						membersErrorCount++
					}
				}
				
			});

			// var newMember = {
			// 	name:memberId,
			// 	memUsage:0,
			// 	cpuUsage:0,
			// 	instanceUsage:0,
			// 	instancesInUse:0,
			// 	intancesQuota:0
			// };
			// var detailsString = "";

			// this.countCall = this.countCall+1;
			// console.log("Call number "+this.countCall);
			// if(this.countCall > 20){
			// 	detailsString = "X-OCCI-Attribute: cpuQuota=60\n"+
			// 	"X-OCCI-Attribute: cpuInUse=50\n"+
			// 	"X-OCCI-Attribute: cpuInUseByUser=16\n"+
			// 	"X-OCCI-Attribute: memQuota=77824\n"+
			// 	"X-OCCI-Attribute: memInUse=65536\n"+
			// 	"X-OCCI-Attribute: memInUseByUser=57344\n"+
			// 	"X-OCCI-Attribute: instancesQuota=15\n"+
			// 	"X-OCCI-Attribute: instancesInUse=10\n"+
			// 	"X-OCCI-Attribute: instancesInUseByUser=2"
			// }else{
			// 	detailsString= "X-OCCI-Attribute: cpuQuota=60\n"+
			// 	"X-OCCI-Attribute: cpuInUse=20\n"+
			// 	"X-OCCI-Attribute: cpuInUseByUser=16\n"+
			// 	"X-OCCI-Attribute: memQuota=77824\n"+
			// 	"X-OCCI-Attribute: memInUse=65536\n"+
			// 	"X-OCCI-Attribute: memInUseByUser=57344\n"+
			// 	"X-OCCI-Attribute: instancesQuota=10\n"+
			// 	"X-OCCI-Attribute: instancesInUse=6\n"+
			// 	"X-OCCI-Attribute: instancesInUseByUser=2"	
			// }

			// detailsString = detailsString.replace(/(\r\n|\n|\r)/gm, ';');
			// detailsString = detailsString.replace(/X-OCCI-Attribute: /g, '');

			// var memberDetails = extractMemberDetail(detailsString);
			// newMember = processMemberDetail(newMember, memberDetails);
			// console.log("Returning member detail")
			// res.send(newMember);
			// res.end();
				
		},
		getMembers: function(req, res){

			var getMembersCli=" member --url "+managerUrl+" --auth-token "+token;
			var CLI_GET_MEMBERS = CLI_BASE_COMMAND+getMembersCli;
			var members;
			var membersValidate = [];

			console.log("Executing: "+CLI_GET_MEMBERS);
			var childTest = exec(CLI_GET_MEMBERS, function (error, stdout, stderr) {
				
				if (error !== null) {
					console.log('exec error: ' + error);
				}else{

					stdout = stdout.replace(/(\r\n|\n|\r)/gm, ';');
					members = stdout.split(';')

					if(Array.isArray(members)){

						members.forEach(function(item, index){
							console.log('Verificando '+item)
							if(item){
								membersValidate.push(item);
							}
						});

					}

					res.send(membersValidate);
					res.end();

				}
			});

			// res.send(["catch-all.manager.naf.lsd.ufcg.edu.br"]);
			// res.end();
			
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

	//Return list of members
	app.get("/members", function(req, res) {
		fogbowApi.getMembers(req, res);
	});

	//Return details of specific member.
	app.get("/members/:memberId", function(req, res) {
		fogbowApi.getMemberDetail(req, res, req.params.memberId);
	});

}

initialConfiguration();