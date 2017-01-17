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

	TileModel.prototype.setPos = function(pos) {
		this.x = pos.x;
		this.y = pos.y;
	}
	return TileModel;
}])
.factory('MovingShapeModel', ['TileModel', function(TileModel) {
	function MovingShapeModel(){
		/* list to store the TileModel instance */
		this.moving_tiles = [];
		
		/* the moving Tile instance's position change queue 
		 *  {tileInstance: [position1, postion2, ...] }
		 */
		this.position_change_queue = [];

		/* current shape type, including line, Z, square , L and
		 * T shapes
		 */
		this.shapetype = 0;
		this.relPosList = [];
		this.tempPosList = [];
	}

	/* Set the init Moving Shape initial position randomly */
	MovingShapeModel.prototype.initPos = function(gridWidth){
		var midX = parseInt((gridWidth-1)/2);
		var originPos = {'x': midX, 'y': -1}
		var initPosList = [];
		var rand_idx = 1; //Math.floor(Math.random() * 4);
		rand_idx = rand_idx.toString();
		var relPosArray = {
			'0': /* line shape */
			[
				{'x': -1, 'y':0}, {'x':0, 'y': 0},
				{'x': 1, 'y': 0},{'x':2, 'y': 0} 
			] ,
			'1': /* Z shape */
			[
				{'x': -1, 'y':0}, {'x':0, 'y': 0},
				{'x': 0, 'y':1 },{'x':1, 'y': 1}
			] ,
			'2': /* square shape */
			[
				{'x': 0, 'y':-1}, {'x':0, 'y': 0},
				{'x': -1, 'y':-1 },{'x':1, 'y': 0}
			] ,
			'3': /* L shape */
			[
				{'x': -1, 'y':0}, {'x':0, 'y': 0},
				{'x': -1, 'y':-1 },{'x':1, 'y': 0}
			],
		};
		this.relPosList = relPosArray[rand_idx];
		this.shapetype = rand_idx;
		for(var pos_idx = 0; pos_idx < 4; pos_idx++) {
			var relX = this.relPosList[pos_idx]['x'];
			var relY = this.relPosList[pos_idx]['y'];
			var absPos = {'x': originPos['x']+relX, 'y': originPos['y']+relY};
			initPosList.push(absPos);
		}
		return initPosList;
	};

	/* randomly create the four basic shapes. */	
	MovingShapeModel.prototype.randomShape = function(){
		this.initPosList = this.initPos(10);
		for (var pos_idx = 0; pos_idx < this.initPosList.length; pos_idx++) {
			var pos = this.initPosList[pos_idx];			
			var tile_obj = new TileModel(pos);
			this.moving_tiles.push(tile_obj);
		}
	};
	MovingShapeModel.prototype.getSingleShapePos = function(singleShape){
	
		var position = {'x': singleShape['x'], 
						'y': singleShape['y'] };
		return position
	};

	MovingShapeModel.prototype.getRotateNextPosition = function(central_pos, 
		cur_pos, reverse) {
		/* central_pos: central point's position						
		 * cur_pos: the position of point which need to be rotated
		 * reverse: if set True, means counterclockwise rotation
		 */
		var factor = reverse === undefined || reverse === 0  ? 1 : -1 ;
		var nextX =  factor * (central_pos['y'] - cur_pos['y']) + central_pos['x'];
		var nextY =  factor * (cur_pos['x'] - central_pos['x']) +  central_pos['y'];
		var nextPos = {'x': nextX, 'y': nextY};
		return nextPos;
	};

	MovingShapeModel.prototype.is_shape_vertical = function() {
		var y = this.moving_tiles[0]['y'];
		for(var pos_idx = 1; pos_idx < this.moving_tiles.length ; pos_idx++) {
			y1 = this.moving_tiles[pos_idx]['y'];
			y = y^y1;
		}
		return y ? 0 : 1;
			
	};

	MovingShapeModel.prototype.changeCentraoPoint = function() {
		if (this.shapetype == 1) {
			/* when the shape is a line, the shape beacome vertical and 
			 * reach the left or rigth edge, need to change the central point 
			 * of rotation.
		 	 */
			if(this.is_shape_vertical()) {
				// pass	
			}
		}
	};

	MovingShapeModel.prototype.rotateShape = function() {
		/* alway rotate base on the second tile in moving_tiles[1]  */
		var central_tile = this.moving_tiles[1];
		var pos_change_list = [];
		for(var pos_idx = 0; pos_idx < 4; pos_idx++) {
			var curPos = {'x': this.moving_tiles[pos_idx]['x'], 'y': this.moving_tiles[pos_idx]['y'] } ;
			var centralPos = {'x': central_tile.x, 'y': central_tile.y };
			var nextPos = this.getRotateNextPosition(centralPos, curPos);
			var next_relative_x = nextPos['x'] - centralPos['x'];
			var next_relative_y = nextPos['y'] - centralPos['y'];
			/* for the line shape, must keep central point
			 * in second point from left to right when it's horizontal 
			 * and second point from top to bottom when it's vertical
			 */
			if (next_relative_x == -2) {
				nextPos['x'] = nextPos['x'] + 4;		
				next_relative_x = 2;
			}
			if (next_relative_y == -2) {
				nextPos['y'] = nextPos['y'] + 4;	
				next_relative_y = 2;
			}
			var position_change = {'obj': this.moving_tiles[pos_idx], 'pos': nextPos};
			pos_change_list.push(position_change);
		}
		return pos_change_list;
	};

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
			this.movingShape.moving_tiles = [];
			this.movingShape.randomShape();
			var moving_tiles = this.movingShape.moving_tiles;
			for (var moving_idx = 0; moving_idx < moving_tiles.length;
					moving_idx++) {
				var moving_tile = moving_tiles[moving_idx];
				this.tiles.push(moving_tile);
			}
		};

		this.rotateAvailable = function(direction) {
		}

		/* check whether the moving shape can move to one direction */
		this.movesAvailable = function(direction){
			/*  position_dict['x-y'] set as 1, means this position has a tile already. */
			var position_dict = [];
			for(var tile_idx = 0; tile_idx < this.tiles.length; 
				tile_idx++) {
				var position_str = this.tiles[tile_idx].x + '-' + this.tiles[tile_idx].y;
				position_dict[position_str] = 1;
			}
			var moving_tiles = this.movingShape.moving_tiles;
			var moving_tiles_poslist = [];
			for (var moving_idx = 0; moving_idx < moving_tiles.length; 
				moving_idx++) {
				var single_moving_shape = moving_tiles[moving_idx];
				moving_tiles_poslist.push(single_moving_shape.x + '-' + single_moving_shape.y);
			}
			var pos_change_list = [];
			if (direction == 'up') {
				pos_change_list = this.movingShape.rotateShape();
				for (var moving_idx = 0; moving_idx < pos_change_list.length; 
				moving_idx++) {
					var single_moving_shape = pos_change_list[moving_idx];
					var position = single_moving_shape['pos'];
					if (position.y > this.height - 1 || 
						position.x < 0 || position.x > this.width - 1 ) {
						return {'can_move': false, 'change_list': [] };	
					}
					var next_tile_position = position.x + '-' + position.y;
					if (position_dict[next_tile_position] !== undefined 
							&& moving_tiles_poslist.indexOf(next_tile_position) < 0) {
						return {'can_move': false, 'change_list': [] };	
					}
				}
			}else {
				/* 'left', 'right', 'down' direction */
				for (var moving_idx = 0; moving_idx < moving_tiles.length; 
					moving_idx++) {
					var single_moving_shape = moving_tiles[moving_idx];
					var position = this.getTileNextPosition(single_moving_shape, direction);
					if (position.y > this.height - 1 || 
						position.x < 0 || position.x > this.width - 1 ) {
						return false, [];	
					}
					var next_tile_position = position.x + '-' + position.y;
					if (position_dict[next_tile_position] !== undefined 
							&& moving_tiles_poslist.indexOf(next_tile_position) < 0 ) {
						return {'can_move': false, 'change_list': [] };	
					}
					var position_change = {'obj': single_moving_shape, 'pos': position};
					pos_change_list.push(position_change);
				}
			}
			return {'can_move': true, 'change_list': pos_change_list };	
		};

		this.moveTile = function(tile, newPosition){
			tile.x = newPosition.x;
			tile.y = newPosition.y;
		}

		this.addPositionChange = function(position_change_list) {
			this.movingShape.position_change_queue.push(position_change_list);
		};

		this.getTile = function(uniqueId) {
			for (var tile_idx = 0; tile_idx < this.tiles.length; tile_idx++) {
				if(this.tiles[tile_idx].id === uniqueId)	{
					return this.tiles[tile_idx];		
				}
			}	
		};

		this.getTileNextPosition = function(tile, direction) {
			/* when player click up, down, left, right
			 * get the tile next position 
			 */
			var position = {'x': tile['x'], 'y': tile['y'] };
			switch (direction)
			{
				case 'down':
					position.y = position.y + 1;
					position.x = position.x;
					break;
				case 'left': 
					position.y = position.y ;
					position.x = position.x - 1;
					break;
				case 'right':
					position.y = position.y ;
					position.x = position.x + 1;
					break;
				default:
					break;
			}
			return position; 
		};

		this.calculateScore = function() {
			/* delete line */	

		};

		this.moveShape = function(direction) {
			var pos_change_list;
			var can_move = false;
			var result = this.movesAvailable(direction);	
			if (direction == 'down') {
				if(!result['can_move']) {
					this.calculateScore();
					this.buildMobileTiles();
				}	
			}
			if (result['can_move']){
				this.addPositionChange(result['change_list']);
			}
		};
		return this;	
	};
});
