'use strict';
var ngModule = angular.module('tetrisApp', ['Game', 'Grid', 'Keyboard']).
config(function(GridServiceProvider) {
	// Grid Size init
	GridServiceProvider.set_grid_height_width(15,10);
})
.controller('GameController', ['$scope', 'GameManagerService', 'KeyboardService',
function($scope, GameManagerService, KeyboardService) {
	this.game = GameManagerService;
	this.newGame = function() {
		KeyboardService.init();
		$scope.keydown_event_queue = KeyboardService.keydown_event_queue;
		this.game.newGame();	
	};
	this.newGame();
	this.game.moveShapeDown();

	$scope.$watch('keydown_event_queue', function() {
		return 'test';
	});
}]);

// Django compatibility
ngModule.config(['$interpolateProvider', '$httpProvider', 
	function($interpolateProvider, $httpProvider) {
		$interpolateProvider.startSymbol('{$');
		$interpolateProvider.endSymbol('$}');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHTTPRequest';
}]);
