var dashboardServices = angular.module('fmmServices', ['ngResource']);

dashboardServices.service('GlobalMsgService', function () {

  var message;
  this.cleanMsg = function() {
    message = {content: undefined, level: undefined}
  };

  this.cleanMsg();

  this.pushMessageAlert = function (msg) {
    message.content = msg;
    message.level = "alert-info";
  };
  this.pushMessageSuccess = function (msg) {
    message.content = msg;
    message.level = "alert-success";
  };
  this.pushMessageInfo = function (msg) {
    message.content = msg;
    message.level = "alert-info";
  };
  this.pushMessageWarning = function (msg) {
    message.content = msg;
    message.level = "alert-warning";
  };
  this.pushMessageFail = function (msg) {
    message.content = msg;
    message.level = "alert-danger";
  };
  this.getContent = function(){
    return message.content;
  } 
  this.getLevel = function(){
    return message.level;
  }

});



dashboardServices.service('MembersService', function($log, $http, appConfig) {

  // var resourceUrl = appConfig.urlSebalSchedulerService+appConfig.imagePath;
  // var headerCredentials = AuthenticationService.getHeaderCredentials();
  
  // var imageService = {};

  // imageService.getImages = function(successCallback, errorCalback){
  //   $http.get(resourceUrl, {headers: headerCredentials})
  //     .success(successCallback).error(errorCalback);
      
  // };

  // return imageService;
  
});