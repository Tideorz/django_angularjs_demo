'use strict';

angular.module('Grid', [])
.provider('GridService', function() {
	/* settings the game grid size , using $controller to init
	 * this controller in app.js
	 *
	 *  set the grid size 
	 */
	this.set_grid_height_width = function(height, width) {
		this.height = height ? height : 20;	
		this.width = width ? width : 10;
	};

	this.$get = function() {
	this.height = 20;	
	this.width = 10;
	/* current static grid */
	this.grid = [];
	/* the moving grid tiles */
	this.tiles = [];

	

	this.get_grid_height_width = function() {
		return {
			height: this.height,	
			width: this.width,
		};	
	};

	/* build empty grid */
	this.buildEmptyGameBoard = function() {
		for (var x = 0; x < this.height * this.width; x++) {
			this.grid[x] = null; 	
		}
	};

	/* build random mobile tiles */
	this.buildMobileTiles = function() {

	};
		return this;	
	};
	
	
});
