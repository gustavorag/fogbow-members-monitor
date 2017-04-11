var fmmControllers = angular.module('fmmControllers', []);

fmmControllers.controller('MainController', function($scope, $log, $filter, 
  $timeout, appConfig) {
  
  

});


fmmControllers.controller('newContrl', function ($scope, $http, $location, $window) {
    

    var diskDataJson = {
        "data": [80, 12],
            "labels": ["Used space", "Free Space"],
            "colours": ['#9AB6F0', '#C2D3F6']
    };

    $scope.pieDiskData = diskDataJson;
});

fmmControllers.controller('MonitorController', function($scope, $http, $log, 
  $timeout, $location, $window, appConfig) {
  
	$scope.members = [];
	$scope.membersId = [];

	$scope.options = {
        tooltipEvents: [],
        showTooltips: true,
        tooltipCaretSize: 0,
        onAnimationComplete: function () {
            this.showTooltip(this.segments, true);
        },
    };


	var resourceUrl = appConfig.baseApiUrl+appConfig.membersPath

	var membersCall = [];

	
	//List all member. If a member is new get its information
	var getMembers = function(){

	$http.get(resourceUrl).then(
		function(response){
	  		console.log(JSON.stringify(response.data));
	  		
	  		$scope.members.forEach(function(member, index){
	  			member.alive = false;
	  		});

	  		response.data.forEach(function(memberId, index){

	  			var memberCharte = getMemberChart(memberId);
	  			if(memberCharte === undefined){
	  				addMembers(memberId, $scope.members.length);
	  			}else{
	  				memberCharte.alive = true;
	  			}


	  		});	  	

	  		$timeout(getMembers, 300000); //Update members after 5 min
	  	},
	  	function(error){
	  		$timeout(getMembers, 5000);
	  	});
	  
	};

	var addMembers = function(item, index){
		var membChart = {
				name: item,
				status: 'loading',
				alive: true,
				memoryChart:{
					id: 'memory-pie-'+index,
					data: [0,100],
						labels: ['Memory Usage','Free Memory'],
						colours: ['#64c896','#d2d2c8']
				},
				cpuChart:{
					id: 'cpu-pie-'+index,
					data: [0,100],
						labels: ['CPU Usage','Free CPU'],
						colours: ['#64c896','#d2d2c8']
				},
				instanceChart:{
					id: 'instance-pie-'+index,
					data: [0,100],
						labels: ['Instance Usage','Free Instances'],
						colours: ['#64c896','#d2d2c8']
				},
				instancesInUse: 0,
				intancesQuota: 0,
				lines: [],
				promisse: undefined
		};
		$scope.members.push(membChart);
		$timeout(function(){
	  		updateMemberChart(membChart);			
	  	}, 2000);
		

	}

	var getMemberChart = function(memberId){
		$scope.members.forEach(function(item, index){
			if(item.name === memberId){
				return item;
			}
		});
		return undefined;
	}

	var updateMemberChart = function(membChart, index){

		//membChart.status: 'loading';

		$http.get(resourceUrl+"/"+membChart.name).then(
			
			function(response){
				
				console.log("Member Details : "+JSON.stringify(response.data));

				var member = response.data;

				var freeMem = 100 - member.memUsage;
				var freeCpu = 100 - member.cpuUsage;
				var freenstance	= 100 - member.instanceUsage;
				var instancePerLine = (member.intancesQuota <= 30) ? 5 : 10;

				if(membChart.memoryChart.data[0] != member.memUsage){
					membChart.memoryChart.data[0] = member.memUsage;
					membChart.memoryChart.data[1] = freeMem;	
				}

				
				if(membChart.cpuChart.data[0] != member.cpuUsage){
					membChart.cpuChart.data[0] = member.cpuUsage;
					membChart.cpuChart.data[1] = freeCpu;
				}

				if(membChart.instanceChart.data[0] != member.instanceUsage){
					membChart.instanceChart.data[0] = member.instanceUsage;
					membChart.instanceChart.data[1] = freenstance;
				}

				if(membChart.instancesInUse != member.instancesInUse || membChart.intancesQuota != member.intancesQuota){

					membChart.instancesInUse = member.instancesInUse;
					membChart.intancesQuota = member.intancesQuota;

					var linesNumber = Math.floor(member.intancesQuota / instancePerLine);
					var mod = member.intancesQuota % instancePerLine;

					var itensCount = 0;
					membChart.lines = [];

					for (i = 0; i < linesNumber; i++) { 
						var newLine = {
							itens: []
						}
						var lineSize = instancePerLine;
						if((i+1) == linesNumber && mod > 0){//If is the last line and has mod, so size is mod size
							lineSize = mod;
						}
						for(z = 0; z < lineSize; z++){
							itensCount++;
							var newIntance = {
								css: 'fa fa-desktop free-instance'
							}
							if(itensCount <= member.instancesInUse){
								newIntance.css = 'fa fa-desktop used-instance';
							}
							newLine.itens.push(newIntance)
						}
						membChart.lines.push(newLine);
					}
				}
				membChart.status = 'ok';
				membChart.promisse = $timeout(function(){updateMemberChart(membChart)}, 1000);
			},
		  	function(error){
		  		membChart.status = 'error';
		  		membChart.promisse = $timeout(function(){updateMemberChart(membChart)}, 5000);
		  	}
		);
		
	}

	getMembers();

	// $scope.$on('chart-create', function (evt, chart) {
  		
 //  		console.log(chart)

	// });

 
});

