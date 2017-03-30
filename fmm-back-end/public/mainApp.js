var app = angular.module('fmmDashboard', [
	'fmmControllers',
	// 'fmmServices' 
	'chart.js',
	'ngRoute'
	
	//'ui.bootstrap'
]);
app.constant("appConfig", {
	"baseApiUrl":"http://localhost:8800/",
	"membersPath":"members",
	"LOGIN_SUCCEED":"login.succeed",
	"LOGIN_FAILED":"login.faild",
	"LOGOUT_SUCCEED":"logout.succed"
});
app.config(function($logProvider){
  $logProvider.debugEnabled(true);
});
app.config(function($routeProvider){

	$routeProvider
	// route for the home page
	.when('/', {
	    templateUrl : '/pages/main.html',
	})
	.otherwise({
        redirectTo: '/'
     });
});

