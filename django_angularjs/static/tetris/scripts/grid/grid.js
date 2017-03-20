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
.factory('GameState', function() {
	/* Game State:
	 * game-init: hasn't started the game, only has empty grid, no moving tiles.
	 * game-pause: pause the game.
	 * game-over: moving tiles reach the middle top point of the grid.
	 * moving-tiles-building: moving tiles start to build, but hasn't shows entirely on the grid.
	 * moving-tiles-builddone: moving tiles has shown entirely on the grid.
	 *
		'game-init', 'game-pause', 'game-over', 'moving-tiles-building', 'moving-tiles-builddone' 
	 */
	function GameState() {
		this.cur_game_state = 'game-init';	
	};
	return GameState;
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
	function MovingShapeModel(width, height){
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
		this.width = width;
		this.height = height;
	}


	MovingShapeModel.prototype.rand = function(number){
		var today = new Date(); 
		var seed = today.getTime();
		function rnd(){
			seed = ( seed * 9301 + 49297 ) % 233280;
		    return seed / ( 233280.0 );
		};
		return Math.ceil(rnd(seed) * number);
	};

	/* Set the init Moving Shape initial position randomly */
	MovingShapeModel.prototype.initPos = function(gridWidth){
		var midX = parseInt((gridWidth-1)/2);
		var originPos = {'x': midX, 'y': -1}
		var initPosList = [];
		var d = new Date().getTime();
		var rand_idx = this.rand(7)-1;
		console.log('shapetype =', rand_idx)
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
				{'x': -1, 'y':-1 },{'x':-1, 'y': 0}
			] ,
			'3': /* L shape */
			[
				{'x': -1, 'y':0}, {'x':0, 'y': 0},
				{'x': -1, 'y':-1 },{'x':1, 'y': 0}
			],
			'4': /* T shape */
			[
				{'x':-1, 'y':0}, {'x':0, 'y': 0},
				{'x': 0, 'y':-1 },{'x':1, 'y': 0}
			],
			'5': /* reverse Z shape */
			[
				{'x':1, 'y':0}, {'x':0, 'y': 0},
				{'x': 0, 'y':1 },{'x':-1, 'y': 1}
			],
			'6': /* reverse L shape */
			[
				{'x':-1, 'y':0}, {'x':0, 'y': 0},
				{'x': 1, 'y':-1 },{'x':1, 'y': 0}
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
		return position;
	};

	MovingShapeModel.prototype.getRotateNextPosition = function(central_pos, 
		cur_pos, is_reverse=0) {

		var relX = cur_pos['x'] - central_pos['x']    
		var relY = cur_pos['y'] - central_pos['y']    
		var x2, y2;
		if (is_reverse == 0) {
			x2 = -relY + central_pos['x']    
			y2 = relX  + central_pos['y']    
		}else {
			x2 = relY + central_pos['x']
			y2 = -relX + central_pos['y']
		}
		return {'x': x2, 'y': y2} 

	};

	MovingShapeModel.prototype.is_shape_vertical = function() {
		var x = this.moving_tiles[0]['x'];
		var x1 = this.moving_tiles[1]['x'];
		return x == x1 ? 1 : 0;
	};

	MovingShapeModel.prototype.chooseLineShapeRotateTile = function(central_tile, tile_bits) {
		var pos = { 'x': central_tile.x - 1, 'y': central_tile.y };
		var left_hastile = this.is_tile(pos, tile_bits) || central_tile.x - 1 < 0;
		if (left_hastile) {
			var third_tile_pos = {'x': central_tile.x + 1, 'y': central_tile.y + 1};	
			return {'can_rotate': true, 'pos': third_tile_pos, 'is_reverse': false};	
		} else {
			var sec_tile_pos = {'x': central_tile.x, 'y': central_tile.y};				
			var hastile_of_two = false;
			for (var idx=1; idx < 3; idx++) {
				var cur_pos = {'x': sec_tile_pos.x + idx, 'y': sec_tile_pos.y };	
				if ( cur_pos.x > this.width - 1) {
					return {'can_rotate': false, 'pos': undefined, 'is_reverse': true};	
				}
				hastile_of_two = this.is_tile(cur_pos, tile_bits);	
				if (hastile_of_two) {
					return {'can_rotate': false, 'pos': undefined, 'is_reverse': true};	
				}
			}
			return {'can_rotate': true, 'pos': sec_tile_pos, 'is_reverse': true};	
		}
	};
	
	
	MovingShapeModel.prototype.get_second_tile_of_shape = function(is_vertical=0) {
		/* get the second tile , this if for line shape, and the 
		 * squence is from top to bottom 
		 */ 		
		function find_line_second_tile(moving_tiles, is_vertical) {
			var array = [];
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				if (is_vertical) {
					array.push(moving_tiles[idx].y);
				}else {
					array.push(moving_tiles[idx].x);
				}
			}
			var sec_min = Math.min.apply(null, array) + 1;
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				if (is_vertical) {
					if (moving_tiles[idx].y === sec_min) {
						return moving_tiles[idx];
					}
				} else {
					if (moving_tiles[idx].x === sec_min) {
						return moving_tiles[idx];
					}
				}
			}
		}


		function find_z_second_tile(moving_tiles) {
			var yarray = [];
			var xarray = [];
			var is_reverse = false;
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				yarray.push(moving_tiles[idx].y);
				xarray.push(moving_tiles[idx].x);
			}
			function swap(v1, v2) {
				return v1 - v2;	
			};
			yarray.sort(swap);
			xarray.sort(swap);
			if(yarray[0] != yarray[1]) {
				is_reverse = true;	
				for (var idx=0; idx < moving_tiles.length ; idx++) {
					if(moving_tiles[idx].y == yarray[1] && 
						moving_tiles[idx].x == xarray[3]) {
						return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
					}
				}
			}else{
				for (var idx=0; idx < moving_tiles.length ; idx++) {
					if(moving_tiles[idx].y == yarray[1] && 
						moving_tiles[idx].x == xarray[2]) {
						return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
					}
				}
			
			}
		}

		function find_reverse_z_second_tile(moving_tiles) {
			var yarray = [];
			var xarray = [];
			var is_reverse = false;
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				yarray.push(moving_tiles[idx].y);
				xarray.push(moving_tiles[idx].x);
			}
			function swap(v1, v2) {
				return v1 - v2;	
			};
			yarray.sort(swap);
			xarray.sort(swap);
			if(yarray[0] != yarray[1]) {
				for (var idx=0; idx < moving_tiles.length ; idx++) {
					if(moving_tiles[idx].y == yarray[1] && 
						moving_tiles[idx].x == xarray[1]) {
						return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
					}
				}
			}else{
				is_reverse = true;	
				for (var idx=0; idx < moving_tiles.length ; idx++) {
					if(moving_tiles[idx].y == yarray[1] && 
						moving_tiles[idx].x == xarray[2]) {
						return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
					}
				}
			
			}
		}

		function find_t_second_tile(moving_tiles) {
			var yarray = [];
			var xarray = [];
			var is_reverse = false;
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				yarray.push(moving_tiles[idx].y);
				xarray.push(moving_tiles[idx].x);
			}
			function swap(v1, v2) {
				return v1 - v2;	
			};
			yarray.sort(swap);
			xarray.sort(swap);
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				if(moving_tiles[idx].y == yarray[2] && 
					moving_tiles[idx].x == xarray[2]) {
					return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
				}
			}
		}

		function find_l_second_tile(moving_tiles, reverse_l=false) {
			var yarray = [];		
			var xarray = [];
			var is_reverse = false;
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				yarray.push(moving_tiles[idx].y);
				xarray.push(moving_tiles[idx].x);
			}

			function swap(v1, v2) {
				return v1 - v2;	
			};
			
			yarray.sort(swap);
			xarray.sort(swap);
			var x_value = 0;
			var y_value = 0;
			if (xarray[0] == xarray[1] && xarray[1] == xarray[2]) {
				x_value  = xarray[0];
				if (reverse_l){
					y_value = yarray[1];
				}else {
					y_value = yarray[2];
				}
			}else if (xarray[1] == xarray[2] && xarray[2] == xarray[3]){
				x_value  = xarray[1];
				if (reverse_l) {
					y_value = yarray[2];
				}else {
					y_value = yarray[1];
				}
			}else if (yarray[0] == yarray[1] && yarray[1] == yarray[2]){
				if (reverse_l) {
					x_value  = xarray[2];
				}else {
					x_value  = xarray[1];
				}
				y_value = yarray[0];
			}else {
				if (reverse_l) {
					x_value  = xarray[1];
				}else {
					x_value  = xarray[2];
				}
				y_value = yarray[1];
			}
			for (var idx=0; idx < moving_tiles.length ; idx++) {
				if(moving_tiles[idx].y == y_value && 
						moving_tiles[idx].x == x_value) {
						return {'tile': moving_tiles[idx], 'is_reverse': is_reverse};
					}
			}
			
		}

		if(this.shapetype == 0) {
			return find_line_second_tile(this.moving_tiles,is_vertical);
		}else if(this.shapetype == 1) {
			return find_z_second_tile(this.moving_tiles);	
		}else if(this.shapetype == 3 || this.shapetype == 6) {
			var reverse_l = (this.shapetype == 3) ? 0 : 1;
			return find_l_second_tile(this.moving_tiles, reverse_l);	
		}else if(this.shapetype == 4) {
			return find_t_second_tile(this.moving_tiles);
		}else if(this.shapetype == 5) {
			return find_reverse_z_second_tile(this.moving_tiles);
		}
	};

	/* is the posiont has a tile */
	MovingShapeModel.prototype.is_tile = function(pos, tile_bits) {
		var x = pos.x;	
		var y = pos.y;
		return ( tile_bits[y] >> x ) & 1;
	};

	MovingShapeModel.prototype.chooseCentralPoint = function(tile_bits) {
		/* help to change the rotation's central point, and the direction 
		 * of rotation, 		 
		 */
		var newCentralPos;
		if (this.shapetype == 0) {
			/* when the shape is a line, the shape is vertical and 
			 * reach the left or rigth edge, need to change the central point 
			 * of rotation.
		 	 */
			if(this.is_shape_vertical()) {
				var sec_tile = this.get_second_tile_of_shape(1);
				var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
				var ret = this.chooseLineShapeRotateTile(sec_tile, tile_bits);
				if(ret['can_rotate']) {
					return {'pos': ret['pos'], 'is_reverse': ret['is_reverse']};
				}
			}else {
				var sec_tile = this.get_second_tile_of_shape(0);
				var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
				return {'pos': sec_pos, 'is_reverse':0};
			}
		}else if(this.shapetype == 1) {
			var ret = this.get_second_tile_of_shape();
			var sec_tile = ret['tile'];
			var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
			return {'pos': sec_pos, 'is_reverse':ret['is_reverse']};
		}else if(this.shapetype == 3 || this.shapetype == 6) {
			var ret = this.get_second_tile_of_shape();		
			var sec_tile = ret['tile'];
			var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
			return {'pos': sec_pos, 'is_reverse':ret['is_reverse']};
		}else if(this.shapetype == 4) {
			var ret = this.get_second_tile_of_shape();
			var sec_tile = ret['tile'];
			var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
			return {'pos': sec_pos, 'is_reverse':ret['is_reverse']};
		}else if(this.shapetype == 5) {
			var ret = this.get_second_tile_of_shape();
			var sec_tile = ret['tile'];
			var sec_pos =  { 'x': sec_tile.x, 'y': sec_tile.y };
			return {'pos': sec_pos, 'is_reverse':ret['is_reverse']};
		}
		return {'pos': undefined};
	};

	MovingShapeModel.prototype.rotateShape = function(tile_bits) {
		/* alway rotate base on the second tile in moving_tiles[1]  */
		var central_tile = this.moving_tiles[1];
		var pos_change_list = [];
		var ret = this.chooseCentralPoint(tile_bits);
		if (ret['pos'] === undefined) {
			return [];
		}else {
			for(var pos_idx = 0; pos_idx < 4; pos_idx++) {
				var curPos = {'x': this.moving_tiles[pos_idx]['x'], 'y': this.moving_tiles[pos_idx]['y'] };
				var centralPos = ret['pos'];
				var nextPos = this.getRotateNextPosition(centralPos, curPos, ret['is_reverse']);
				var position_change = {'obj': this.moving_tiles[pos_idx], 'pos': nextPos};
				pos_change_list.push(position_change);
			}
			return pos_change_list;
		}
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

		/* when the position has a tile, set this bit as 1 
		 * this array include intergers */
		this.tile_bits = new Array(this.width);
		for (var idx = 0; idx < this.height; idx++) {
			this.tile_bits[idx] = 0;	
		}
	};

	this.$get = function(TileModel, MovingShapeModel, GameState) {
		this.movingShape = new MovingShapeModel(this.width, this.height);
		/* current static grid */
		this.grid = [];
		/* the moving grid tiles */
		this.tiles = [];
		/* the first time of moving shape reach the grid bottom */
		this.first_down = false;
		this.game_state_obj = {'state': 'game-init'};

		this.init = function() {
			this.movingShape = new MovingShapeModel(this.width, this.height);
			/* the first time of moving shape reach the grid bottom */
			this.first_down = false;
			this.game_state_obj = {'state': 'game-init'};
			this.tiles.length = 0;
			this.buildEmptyGameBoard();
		};

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

		/* set the bit as 1, when there is a tile on this position */
		this.set_bit = function(tile, pos) {
			var x = pos['x'];	
			var y = pos['y'];
		    this.tile_bits[y] =	this.tile_bits[y] | 1 << x;
		};	

		/* set the bit as 0, when there is no tile on it */
		this.del_bit = function(tile) {
			var x = tile.x;	
			var y = tile.y;
		    this.tile_bits[y] =	this.tile_bits[y] & ~(1 << x);
		};

		/* is the posiont has a tile */
		this.is_tile = function(pos) {
			var x = pos.x;	
			var y = pos.y;
			return ( this.tile_bits[y] >> x ) & 1;
		};

		/* build random mobile tiles */
		this.buildMobileTiles = function() {
			this.first_down = false;
			this.movingShape.moving_tiles = [];
			this.movingShape.randomShape();
			var moving_tiles = this.movingShape.moving_tiles;
			for (var moving_idx = 0; moving_idx < moving_tiles.length;
					moving_idx++) {
				var moving_tile = moving_tiles[moving_idx];
				this.tiles.push(moving_tile);
			}
		};


		/* check whether the moving shape can move to one direction */
		this.movesAvailable = function(direction){
			var moving_tiles = this.movingShape.moving_tiles;
			var moving_tiles_poslist = [];
			for (var moving_idx = 0; moving_idx < moving_tiles.length; 
				moving_idx++) {
				var single_moving_shape = moving_tiles[moving_idx];
				moving_tiles_poslist.push(single_moving_shape.x + '-' + single_moving_shape.y);
			}
			var pos_change_list = [];
			if (direction == 'up') {
				pos_change_list = this.movingShape.rotateShape(this.tile_bits);
				if (pos_change_list.length === 0) {
						return {'can_move': false, 'change_list': [] };	
				}
				for (var moving_idx = 0; moving_idx < pos_change_list.length; 
				moving_idx++) {
					var single_moving_shape = pos_change_list[moving_idx];
					var position = single_moving_shape['pos'];
					if (position.y > this.height - 1 || 
						position.x < 0 || position.x > this.width - 1 ) {
						return {'can_move': false, 'change_list': [] };	
					}
					var position_str = position.x + '-' + position.y;
					if (this.is_tile(position) && moving_tiles_poslist.indexOf(position_str) < 0) {
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
						return {'can_move': false, 'change_list': [] };	
					}
					var next_tile_position = position.x + '-' + position.y;
					if (this.is_tile(position) && moving_tiles_poslist.indexOf(next_tile_position) < 0 ) {
						return {'can_move': false, 'change_list': [] };	
					}
					var position_change = {'obj': single_moving_shape, 'pos': position};
					pos_change_list.push(position_change);
				}
			}
			return {'can_move': true, 'change_list': pos_change_list };	
		};

		this.moveTile = function(tile, newPosition){
			this.del_bit(tile);
			tile.x = newPosition.x;
			tile.y = newPosition.y;
		};

		this.setShapeBits = function(pos_change_list) {
			/* set the new moving shapes' tile bits*/
			for(var chg_idx = 0; chg_idx < pos_change_list.length; chg_idx++) {
				var pos_change = pos_change_list[chg_idx];
				var newPos = pos_change['pos']; 
				var tile = pos_change['obj'];
				this.set_bit(tile, newPos);
			}
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
			var line_max_number = Math.pow(2, this.width) - 1;
			var deleted_lines = 0;
			var deleted_idx = new Array();
			for (var idx = 0; idx < this.height; idx++) {
				if(this.tile_bits[idx] == line_max_number) {
					deleted_lines++;
					this.tile_bits[idx] = 0;
					deleted_idx.push(idx);
				}
			}
			if(deleted_lines > 0) {
				this.draw_new_tiles(deleted_idx);
			}
		};

		this.draw_new_tiles = function(deleted_idx) {
			/* clear the old tiles */
			this.tiles.length = 0;
			/* put the non-empty lines down */
			var goes_down_array = new Array(this.height);
			for (var idx=0; idx < this.height; idx++) {
				goes_down_array[idx] = 0;		
			}
			for(var idx=this.height-1; idx >=0; idx--) {
				if(this.tile_bits[idx] == 0 && deleted_idx.indexOf(idx) != -1) {
					for(var y=idx-1; y>=0; y--){
						goes_down_array[y]++;	
					}	
				}
			}
			for(var idx=this.height-2; idx >= 0; idx--) {
				if(goes_down_array[idx] == 0){ 
					continue;
				}
				this.tile_bits[goes_down_array[idx]+idx] = this.tile_bits[idx];				
				this.tile_bits[idx] = 0;
			}
			for(var idx=this.height-1; idx >= 0; idx--) {
				if(this.tile_bits[idx] != 0) {
					for (var x = 0; x < this.width; x++) {
						var pos = {'x': x, 'y': idx};
						if(this.is_tile(pos)){
							var tile_obj = new TileModel(pos);
							this.tiles.push(tile_obj);
						}
						
					}
				}
			}
		};

		this.is_game_over = function() {
			var moving_tiles = this.movingShape.moving_tiles;
			for (var moving_idx = 0; moving_idx < moving_tiles.length; 
				moving_idx++) {
				if (moving_tiles[moving_idx].y	 === -1) {
					return true;	
				}
			}
			return false;
		};

		this.moveShape = function(direction) {
			var pos_change_list;
			var can_move = false;
			var result = this.movesAvailable(direction);	
			if (direction == 'down') {
				if(!result['can_move']) {
					if (this.is_game_over()) {
						this.game_state_obj.state = 'game-over';
					}
					if (!this.first_down) { 
						/* If the moving shape is the first 
						 * time to reach the bottom, he still 
						 * have one chance to moving the shape
						 * left or right.
						 */
						this.first_down = true;	
						return;
					} 
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
