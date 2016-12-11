'use strict';

angular.module('Grid', [])
.factory('GenerateUniqueId', function() {
	  var generateUid = function() {
		  // http://www.ietf.org/rfc/rfc4122.txt
		  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
		  var d = new Date().getTime();
		  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			  var r = (d + Math.random()*16)%16 | 0;
			  d = Math.floor(d/16);
			  return (c === 'x' ? r : (r&0x7|0x8)).toString(16);
		  }); 
		  return uuid;
	  };  
	  return {
		  next: function() { return generateUid(); }
	  };  
})
.factory('TileModel', function(GenerateUniqueId) {
	var	Tile = function(pos) {
		this.x = pos.x;
		this.y = pos.y;

		this.id = GenerateUniqueId.next();
	};
	
	return Tile;
})
.provider('GridService', function() {
	/* settings the game grid size , using $controller to init
	 * this controller in app.js
	 *
	 *  set the grid size 
	 */
	this.set_grid_height_width = function(height, width) {
		this.height = height ? height : 15;	
		this.width = width ? width : 10;
	};

	this.$get = function(TileModel) {
		/* current static grid */
		this.grid = [];
		/* the moving grid tiles */
		this.tiles = [];

		// test tiles array
		this.tiles.push(new TileModel({x: 1, y: 2}));
		this.tiles.push(new TileModel({x: 2, y: 3}));

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
