'use strict';

angular.module('Game', ['Grid'])
.service('GameManagerService', ['$interval', 'GridService' , function($interval, GridService) {
	this.gridSize = {};
	/* when you click the new Game button */
	this.newGame = function(){
		GridService.init();			
	};
	this.move = function() {};
	this.updateScore = function() {};

	/* grid and tiles */
	this.grid = GridService.grid;
	this.tiles = GridService.tiles;
	this.gridSize = GridService.get_grid_height_width();
	this.gridHeight = this.gridSize.height;
	this.gridWidth = this.gridSize.width;

	/* default moving tiles down interval */
	this.down_interval = 300;

	this.moveShapeDown = function(){
		var moving_tiles_down = function() {
			GridService.moveShape('down');
		};
		GridService.buildMobileTiles();
		$interval(moving_tiles_down, this.down_interval)		
	};

	this.moveShape = function(direction) {
		GridService.moveShape(direction);
	}
}]);
