;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
		this.sounds			= [];
		this.connections	= [];
		this.lastClick		= '';
		
        this.focalLength    = 1000;
        this.context        = canvas.getContext("2d");
        this.sceneWidth     = canvas.width;
        this.sceneHeight    = canvas.height;
        this.points3D       = [];
        this.points2D       = [];
        this.numPoints      = 0;		
		
		
		
		
		
		this.init = function() 
		{
			// this.loadSounds();
            
            for(var i=0; i< 100; i++)
                this.draw3dPoint(100,100,i*20);
			
		};
		
		this.debug = function() 
		{
			$("canvas").drawArc({
			  fillStyle: "#000",
			  x: 100, y: 100,
			  radius: 50
			});
		};		
		
		/* load sound data from db and store it in an array */
		this.loadSounds = function() 
		{
			var self = this;
			
			// define url that returns a json array of all sounds
			var postUrl		= baseUrl + '/../ajax/interface/all-sounds/';

			// define the DOM element that contains the html (used for positioning of the loading gif)
			var container	= $('#interface');
			
			// call this function when the ajax call is successful
			var onSuccess	= function(data) 
			{				
				for (var i=0; i< data.sounds.length; i++) 
				{
					// push sound's data to the sounds array
					self.addSound(data.sounds[i], i);
				}
				
				// after iterating over data, draw the sounds on the canvas
				self.drawSounds();
			};
			
			// after defining everything, execute ajax call
			lib.ajax(postUrl, '', onSuccess, container);			
		};
		
		/* draw all sounds on canvas element */		
		this.drawSounds = function()
		{
			var self = this;

			for (var i=0; i<self.sounds.length; i++) 
			{
				self.drawSound(self.sounds[i]);				
			}		
		};		
		
		/* draw all connections on canvas element */				
		this.drawConnections = function() 
		{
			var self = this;
			
			$("canvas").removeLayerGroup("connections");
			
			for (var i=0; i<self.connections.length; i++) 
			{
				var connection = self.connections[i];							
				var layer_1 = $("canvas").getLayer(connection.layer_1);
				var layer_2 = $("canvas").getLayer(connection.layer_2);
								
				self.drawConnection(connection, layer_1, layer_2);
			}
		};
		
		
		
		
		
		/* draw one sounds on canvas element */				
		this.draw3dPoint = function(x_3d, y_3d, z_3d)
		{
			var self = this;
			
			var focalLength = 1000;
            var scale = focalLength / (z_3d + focalLength);
			
			$("canvas").drawArc({
				layer		: true,
				fromCenter	: true,
				fillStyle	: '#fff000',
                x           : x_3d * scale,
                y           : y_3d * scale,
				radius		: 20,
			  	ccw			: true,
				active		: false,
                myScene     : null,
                x_3d        : x_3d,
                y_3d        : y_3d,
                z_3d        : z_3d,                
                xIdx        : '',
                yIdx        : '',
                zIdx        : '',
                xIdx2D      : '',
                yIdx2D      : '',
			});			
		};
		
		
		
		
		
		
		/* draw one sounds on canvas element */				
		this.drawSound = function(sound)
		{
			var self = this;
			
			
			
			$("canvas").drawArc({
				layer		: true,
				group		: "sounds",					
				name		: "sound_" + sound.id,
				fromCenter	: true,
				fillStyle	: sound.fill,
				x			: sound.x,
				y			: sound.y,
				radius		: sound.radius,
			  	ccw			: true,
			  	draggable	: true,
			  	bringToFront: true,
				active		: false,
				player		: sound.player,
				mouseover	: function(layer)
				{
					$(this).css({cursor:'pointer'});
										
					if (!layer.active) {
						layer.fillStyle = '#000';						
					}					
				},
				mouseout	: function(layer)
				{
					$(this).css({cursor:'default'});
					
					if (!layer.active) {
						layer.fillStyle = sound.fill;
					}
				},
				click		: function(layer)
				{
					layer.active = true;
					layer.fillStyle = '#000';

					// push connection's data to the connections array												
					(self.lastClick != '') ? self.addConnection(layer) : '';
					
					// last click should hold the last layer that was clicked on
					self.lastClick	= {	'name'	: layer.name };	

					// draw all connections
					self.drawConnections();
				},
				drag		: function(layer)
				{
					// refresh connections upon dragging
					self.drawConnections();					
				}
			});			
		};
	
		
		/* draw one connection on canvas element */
		this.drawConnection = function(connection, layer_1, layer_2)
		{
			var self = this;
			
			$("canvas").drawLine({
				layer		: true,
				group		: "connections",					
				name		: connection.layer_1 + '-' + connection.layer_2,
				strokeStyle	: connection.style,
				strokeWidth	: connection.width,
				x1			: layer_1.x, 
				y1			: layer_1.y,
				x2			: layer_2.x, 
				y2			: layer_2.y
			});
			
			// layer_1.player.updateVolume(self.calculateVolume(layer_1.y));
			// layer_2.player.updateVolume(self.calculateVolume(layer_2.y));			
			layer_1.player.play();
			layer_2.player.play();
		};
		
		
		this.addSound = function(sound, i) 
		{
			var self = this;
			
			// randomize position & radius (temporary)
			var x = lib.random(975,0);
			var y = lib.random(458,0);
			var radius = lib.random(5,2);
			var player = self.addPlayer(sound, i);		
			var volume = self.calculateVolume(y);

			self.sounds.push(
			{
				index	: i,
				id 		: sound.id,
				title	: sound.title,
				user_id	: sound.user_id,
				filename: sound.filename,
				player	: player,
				volume	: volume,
				x		: x,						
				y		: y,
				radius	: radius,
				fill	: "#ccc",
			});	
			
			player.updateVolume(volume);
			player.init();						
		};
		
		this.addConnection = function(layer)
		{
			var self = this;
			
			self.connections.push(
			{
				layer_1	: self.lastClick.name,
				layer_2	: layer.name,
				width	: 2,
				style	: "#000",
			});			
		};
		
		this.addPlayer = function(sound, index)
		{
			var self = this;
			var file = baseUrl + '/uploads/' + sound.user_id + '/' + sound.filename;
			var player = 'player' + index + '_' + sound.id;
			var sound_player = new site.Player(sound.id, index, file, volume);
			return sound_player;
		};
		
		this.calculateVolume = function(y) 
		{
			var self = this;
			
			var parentHeight = 975;
			var masterVolume = 0.9;
			
			var volume = Math.round(((parentHeight - y) / parentHeight)*100) / 100;
			volume = volume * masterVolume;
			return volume;
		};			
	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		