'use strict';

angular.module('Game', ['Grid'])
.service('GameManagerService', ['$interval', 'GridService' , function($interval, GridService) {
	/* Game State:
	 * game-init: hasn't started the game, only has empty grid, no moving tiles.
	 * game-pause: pause the game.
	 * game-over: moving tiles reach the middle top point of the grid.
	 * moving-tiles-building: moving tiles start to build, but hasn't shows entirely on the grid.
	 * moving-tiles-builddone: moving tiles has shown entirely on the grid.
	 *
		'game-init', 'game-pause', 'game-over', 'moving-tiles-building', 'moving-tiles-builddone' 
	 */

	this.gridSize = {};
	/* when you click the new Game button */
	this.newGame = function(){
		this.cur_game_state = 'game-init';
		GridService.buildEmptyGameBoard();			
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
	this.down_interval = 600;

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
