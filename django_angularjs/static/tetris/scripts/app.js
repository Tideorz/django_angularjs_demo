'use strict';
var ngModule = angular.module('tetrisApp', ['Game', 'Grid',]).
config(function(GridServiceProvider) {
	// Grid Size init
	GridServiceProvider.set_grid_height_width(15,10);
})
.controller('GameController', function(GameManagerService) {
	this.game = GameManagerService;
	this.newGame = function() {
		this.game.newGame();	
	};

	this.newGame();
});


// Django compatibility
ngModule.config(['$interpolateProvider', '$httpProvider', 
	function($interpolateProvider, $httpProvider) {
		$interpolateProvider.startSymbol('{$');
		$interpolateProvider.endSymbol('$}');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHTTPRequest';
}]);
