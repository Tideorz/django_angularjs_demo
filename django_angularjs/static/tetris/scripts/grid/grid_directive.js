'use strict'

angular.module('Grid')
.directive('gridDirective', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		scope: {
			'ngModel': '=',	
		},
		templateUrl: 'static/tetris/scripts/grid/grid.html'
	};
});
