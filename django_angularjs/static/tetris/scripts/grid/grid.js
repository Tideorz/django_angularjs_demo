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
.factory('TileModel', ['GenerateUniqueId', function(GenerateUniqueId) {
	function TileModel(pos) {
		this.x = pos.x;
		this.y = pos.y;

		this.id = GenerateUniqueId.next();
	};

	TileModel.prototype.setUniqueId = function(unique_id) {
		this.id = unique_id;
	}
	return TileModel;
}])
.factory('MovingShapeModel', ['TileModel', function(TileModel) {
	function MovingShapeModel(){
		/* list to store the TileModel's unique and its current
		 * position 
		 */
		this.moving_tiles = [];
		this.type = 1;
		this.randomShape();
	}
	// randomly create the four basic shapes.	
	MovingShapeModel.prototype.randomShape = function(){
		var pos = {x: 4, y: 0};	
		var tile_obj = new TileModel(pos);
		this.moving_tiles.push(tile_obj);
	};
	MovingShapeModel.prototype.getSingleShapePos = function(singleShape){
	
		var position = {'x': singleShape['x'], 
						'y': singleShape['y'] };
		return position
	};
	MovingShapeModel.prototype.rotateShape = function(){};
	MovingShapeModel.prototype.moveShape = function(){};

	return MovingShapeModel;
}])
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

	this.$get = function(TileModel, MovingShapeModel) {
		this.movingShape = new MovingShapeModel();
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
			var moving_tiles = this.movingShape.moving_tiles;
			for (var moving_idx = 0; moving_idx < moving_tiles.length;
					moving_idx++) {
				var moving_tile = moving_tiles[moving_idx];
				this.tiles.push(moving_tile);
			}
		};

		/* check whether the moving shape can move to one direction */
		this.movesAvailable = function(direction){
			var position_dict = [];
			for(var tile_idx = 0; tile_idx < this.tiles.length; 
				tile_idx++) {
				var position_str = this.tiles[tile_idx].x + '-' + this.tiles[tile_idx].y;
				position_dict[position_str] = 1;
			}
			if(direction === 'down') {
				var moving_tiles = this.movingShape.moving_tiles;
				for (var moving_idx = 0; moving_idx < moving_tiles.length; 
					moving_idx++) {
					var single_moving_shape = moving_tiles[moving_idx];
					var position = this.movingShape.getSingleShapePos(single_moving_shape);
					position.next_y = position.y + 1;
					if (position.next_y > this.height - 1) {
						return false;	
					}
					var next_tile_position = position.x + '-' + position.next_y;
					if (position_dict[next_tile_position] !== undefined) {
						return false;	
					}
				}
				return true;
			}
		};

		this.moveTile = function(tile, newPosition) {
			tile.x = newPosition.x;
			tile.y = newPosition.y;
		};

		this.getTile = function(uniqueId) {
			for (var tile_idx = 0; tile_idx < this.tiles.length; tile_idx++) {
				if(this.tiles[tile_idx].id === uniqueId)	{
					return this.tiles[tile_idx];		
				}
			}	
		};

		this.movingShapeDown = function() {
			if(this.movesAvailable('down')) {
				var moving_tiles = this.movingShape.moving_tiles;
				for (var moving_idx = 0; moving_idx < moving_tiles.length; 
					moving_idx++) {
					var single_moving_shape = moving_tiles[moving_idx];
					var position = this.movingShape.getSingleShapePos(single_moving_shape);
					var next_tile_position;
					next_tile_position = {'x': position.x, 'y': position.y + 1 };
					this.moveTile(single_moving_shape, next_tile_position);
				}
			}				
		};
		return this;	
	};
});
