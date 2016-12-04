'use strict';

angular.module('Game', ['Grid'])
.service('GameManagerService', function(GridService) {
	this.gridSize = {};
	this.newGame = function(){
		GridService.buildEmptyGameBoard();			
	};
	this.move = function() {};
	this.updateScore = function() {};
	/*this.create_random_tiles = function() {};*/

	this.grid = GridService.grid;
	this.tiles = GridService.tiles;
	this.gridSize = GridService.get_grid_height_width();
	this.gridHeight = this.gridSize.height;
	this.gridWidth = this.gridSize.width;
});


