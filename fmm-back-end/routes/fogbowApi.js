var express = require('express');
var fs = require("fs");
var exec = require('child_process').exec;
var router = express.Router();

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
var token;

var createTokenBase=" token --create --type ldap ";

var CLI_BASE_COMMAND = "";
var CLI_CREATE_TOKEN = "";


// fs.readFile( __dirname + "/" + "membersDetail.json", 'utf8', function (err, data) {
// 	// console.log("File readed "+data);
//    	membersDetail = data
// });


var countCall = 0;

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
	  	startApi();
	  }
	});
}



initialConfiguration();

var startApi = function(){

	console.log("Starting api");
	var api = {
		getMembers: function(){
			// var getMembersCli=" member --url "+managerUrl+" --auth-token "+token;
			// var CLI_GET_MEMBERS = CLI_BASE_COMMAND+getMembersCli;

			//console.log("Executing: "+CLI_GET_MEMBERS);
			// var childTest = exec(CLI_GET_MEMBERS, function (error, stdout, stderr) {
			// 	console.log("Stdout: "+stdout);
			// 	console.log("Stderr: "+stderr);
			// 	if (error !== null) {
			// 		console.log('exec error: ' + error);
			// 	}else{
			// 		return stdout.split(/(\r\n|\n|\r)/gm);
			// 	}
			// });
			//var stdout = "catch-all.manager.naf.lsd.ufcg.edu.br\\nfogbow-manager-rec.compute.rnp.br\\nlsd.manager.naf.lsd.ufcg.edu.br\\nmanager.naf.ufscar.br\\ntu.dresden.manager.naf.lsd.ufcg.edu.br"
			//return stdout.split(/(\r\n|\n|\r)/gm);
			return ["catch-all.manager.naf.lsd.ufcg.edu.br", "manager.naf.lsd.ufcg.edu.br"]
		},
		getMemberDetail: function(memberId){
			// var getMemberDetailCli=" member --url "+managerUrl+" --quota --id "+memberId+" --auth-token "+token;
			// var CLI_GET_MEMBER_DETAIL = CLI_BASE_COMMAND+getMemberDetailCli;

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
			countCall = countCall++;
			if(countCall > 20){
				return "X-OCCI-Attribute: cpuQuota=60\n"+
				"X-OCCI-Attribute: cpuInUse=50\n"+
				"X-OCCI-Attribute: cpuInUseByUser=16\n"+
				"X-OCCI-Attribute: memQuota=77824\n"+
				"X-OCCI-Attribute: memInUse=65536\n"+
				"X-OCCI-Attribute: memInUseByUser=57344\n"+
				"X-OCCI-Attribute: instancesQuota=15\n"+
				"X-OCCI-Attribute: instancesInUse=10\n"+
				"X-OCCI-Attribute: instancesInUseByUser=2"
			}else{
				return "X-OCCI-Attribute: cpuQuota=60\n"+
				"X-OCCI-Attribute: cpuInUse=20\n"+
				"X-OCCI-Attribute: cpuInUseByUser=16\n"+
				"X-OCCI-Attribute: memQuota=77824\n"+
				"X-OCCI-Attribute: memInUse=65536\n"+
				"X-OCCI-Attribute: memInUseByUser=57344\n"+
				"X-OCCI-Attribute: instancesQuota=10\n"+
				"X-OCCI-Attribute: instancesInUse=6\n"+
				"X-OCCI-Attribute: instancesInUseByUser=2"	
			}
			
		}
	};

	console.log("Returning api: "+JSON.stringify(api));
	module.exports = api;
}



java -cp /home/gustavorag/git/fogbow-members-monitor/fmm-back-end/fogbow-components/fogbow-cli-0.0.1-SNAPSHOT-jar-with-dependencies.jar org.fogbowcloud.cli.Main  member --url http://10.11.4.234:8182 --auth-token eyJsb2duaW4iOiJmb2dib3dhZG0iLCJuYW1lIjoiRm9nYm93IEFETSIsImV4cGlyYXRpb25EYXRlIjoxNTIyNjQ2Nzk3MDA1fSEjIU1rRE9mR3lkcDBGYzNaSFNLTEU2TloyeEtaa1p3WWpUeGpaZURwSU5PdmtxNW5UaWVlUmtOOGVIcFQvZjVBYWNHMExML2lySjBzOG9qNXJualcvVm1LSHBTMHNCR3ZkZGdER0JRRjhYbGtaRXdHU00rVmJZT0ZWNWxocTFpRGl0N2Z3dGxXdHRubU41Qno3YTBUcElNQmNxSjg3UWROZ2RUdXY4b3cyS2dKdXBrV0JEN20valZBQlVER0NpUXRqcXRIMDNPcGh5OEFMc2FNSTdHa012djVKVFdMRFIrVVd3L25DRXRJT3JEUkRmWGlvV2g5ZUFoVkRHWUtKckhjSEVPYWxVQ2Nja0N0by9wRjl6d1A2RDFWRkh2QW9hNlhKYnM4NE4xSEFjQXRIQ3FvdnpJeDV1LzJsVGZwQkkwQm9vc0ZNMWQweTJacE53cEVvNVllSEVWQT09
