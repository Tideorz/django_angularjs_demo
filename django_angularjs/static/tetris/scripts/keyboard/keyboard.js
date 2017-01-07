'use strict';

angular.module('Keyboard', [])
.service('KeyboardService', function($document) {
	this.init = function() {
		/* reset the keydown event queue when 
		 * restart game.
		 */
		this.keydown_event_queue = [];
	};
	/* queue to store the player's keydown event*/
	this.keydown_event_queue = [];
	var keyboardMap = { 
    	37: 'left',
    	38: 'up', 
    	39: 'right',
    	40: 'down' 
  	};  

	this.monitor_keydown = function() {
		var self = this;
		$document.bind('keydown', function(evt) {
			var key = keyboardMap[evt.which];					
			/* only the Map event will be added into the queue */
			if (key){
				// An interesting key was pressed
        		evt.preventDefault();
        		self.keydown_event_queue.push(key);	
			}
		});			
	};
});

