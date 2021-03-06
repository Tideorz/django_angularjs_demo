'use strict';
var ngModule = angular.module('tetrisApp', ['Game', 'Grid', 'Keyboard']).
config(function(GridServiceProvider) {
	// Grid Size init
	GridServiceProvider.set_grid_height_width(15,10);
})
.controller('GameController', ['$scope', 'GameManagerService', 'KeyboardService', 'GridService',
function($scope, GameManagerService, KeyboardService, GridService) {
	this.game = GameManagerService;
	this.newGame = function() {
		KeyboardService.init();
		this.game.newGame();	

		$scope.keydown_event_queue = KeyboardService.keydown_event_queue;
		$scope.position_change_queue = GridService.movingShape.position_change_queue;
		$scope.game_state_obj = GridService.game_state_obj;
	};
	this.newGame();
	KeyboardService.monitor_keydown();
	this.game.moveShapeDown();

	$scope.$watchCollection('keydown_event_queue', function() {
		for (var key_idx = 0; key_idx < $scope.keydown_event_queue.length; key_idx++) {
			GameManagerService.moveShape($scope.keydown_event_queue.shift());		
		}
	});

	$scope.$watch('game_state_obj', function() {
		if ($scope.game_state_obj.state == 'game-over') {
			GameManagerService.newGame();
		}
	}, true);

	$scope.$watchCollection('position_change_queue', function() {
		for(var queue_idx = 0; queue_idx < $scope.position_change_queue.length; queue_idx++) {
			var pos_change_list = $scope.position_change_queue.shift();
			for(var chg_idx = 0; chg_idx < pos_change_list.length; chg_idx++) {
				var pos_change = pos_change_list[chg_idx];
				var tile = pos_change['obj'];
				var newPos = pos_change['pos']; 
				GridService.moveTile(tile, newPos);		
			}
			GridService.setShapeBits(pos_change_list);		
		}
	});
}]);

// Django compatibility
ngModule.config(['$interpolateProvider', '$httpProvider', 
	function($interpolateProvider, $httpProvider) {
		$interpolateProvider.startSymbol('{$');
		$interpolateProvider.endSymbol('$}');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHTTPRequest';
}]);
