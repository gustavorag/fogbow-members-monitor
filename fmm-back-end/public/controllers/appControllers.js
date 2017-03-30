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

	$scope.options = {
        tooltipEvents: [],
        showTooltips: true,
        tooltipCaretSize: 0,
        onAnimationComplete: function () {
            this.showTooltip(this.segments, true);
        },
    };


	var resourceUrl = appConfig.baseApiUrl+appConfig.membersPath

	var createMemberChart = function(member, index){

		var membChart = {
			name: member.name,
			memoryChart:{
				id: 'memory-pie-'+index,
				data: [],
	  			labels: ['Memory Usage','Free Memory'],
	  			colours: ['#64c896','#d2d2c8']
			},
			cpuChart:{
				id: 'cpu-pie-'+index,
				data: [],
	  			labels: ['CPU Usage','Free CPU'],
	  			colours: ['#64c896','#d2d2c8']
			},
			instanceChart:{
				id: 'instance-pie-'+index,
				data: [],
	  			labels: ['Instance Usage','Free Instances'],
	  			colours: ['#64c896','#d2d2c8']
			},
		  	instancesInUse: member.instancesInUse,
		  	intancesQuota: member.intancesQuota,
		  	lines: []
		}
		var freeMem = 100 - member.memUsage;
		var freeCpu = 100 - member.cpuUsage;
		var freenstance	= 100 - member.instanceUsage;
		var instancePerLine = 5;
		
		membChart.memoryChart.data.push(member.memUsage);
		membChart.memoryChart.data.push(freeMem);
		
		membChart.cpuChart.data.push(member.cpuUsage);
		membChart.cpuChart.data.push(freeCpu);

		membChart.instanceChart.data.push(member.instanceUsage);
		membChart.instanceChart.data.push(freenstance);

		var linesNumber = Math.floor(member.intancesQuota / instancePerLine);
		var mod = member.intancesQuota % instancePerLine;

		var itensCount = 0;
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
		$scope.members.push(membChart);
	}

	var getMembers = function(){
	$http.get(resourceUrl).then(
		function(response){
	  		console.log(JSON.stringify(response.data));
	  		response.data.forEach(createMemberChart)
	  	},
	  	function(error){

	  	});
	  
	};

	getMembers();

	$scope.$on('chart-create', function (evt, chart) {
  		
  		console.log(chart)

  // 		var canvas = document.getElementById(chart.chart.canvas.id);
		// var ctx = canvas.getContext("2d");
		// var midX = canvas.width/2;
		// var midY = canvas.height/2

		// for(var i=0; i< 2; i++) 
		// {
		// 	ctx.fillStyle="white";
		// 	var textSize = canvas.width/10;
		// 	ctx.font= textSize+"px Verdana";
		// 	// Get needed variables
		// 	var value = chart.segments[i].value;
		// 	var startAngle = chart.segments[i].startAngle;
		// 	var endAngle = chart.segments[i].endAngle;
		// 	var middleAngle = startAngle + ((endAngle - startAngle)/2);

		// 	// Compute text location
		// 	var posX = (radius/2) * Math.cos(middleAngle) + midX;
		// 	var posY = (radius/2) * Math.sin(middleAngle) + midY;

		// 	// Text offside by middle
		// 	var w_offset = ctx.measureText(value).width/2;
		// 	var h_offset = textSize/4;

		// 	ctx.fillText(value, posX - w_offset, posY + h_offset);
		// }
	});

 
});

