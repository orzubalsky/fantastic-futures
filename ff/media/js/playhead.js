;(function($){
	var playhead = window.playhead = new function() 
	{
        this.layer;                      // kinteticJS layer to animate the circular playhead
        this.shape;
        this.playhead           = 0;     // this is actually the radius of the circular playhead
		this.is_playing         = false; // this is used to check whether the player is playing or paused
		this.playheadCount      = 0;  
		this.playheadIntervals  =20;     //this is how often the playhead gets redrawn. A high number=less frequency of redrawing            


        this.init = function()
        {
            var self = this;
            
            self.layer = new Kinetic.Layer();
            
            self.shape = new Kinetic.Circle({
                x               : ffinterface.width / 2,
                y               : ffinterface.height / 2,
                alpha           : 0.8,
                radius          : 0,
                fill            : {image: ffinterface.images.playhead_fill, offset: [0, 0]}, //stripes
                stroke          : "#efefef",
                strokeWidth     : .25,
            });

            self.layer.add(self.shape);
            ffinterface.stage.add(self.layer);

            self.playerToggleControl();
        };


        this.clear = function()
        {
            var self = this;
            
            self.layer.clear();
        };


        this.update = function()
        {
            var self = this;
            
            var radius = self.shape.getRadius();

            if (self.is_playing)
            {
                radius = (radius.x < ffinterface.width / 2) ? Math.floor(radius.x) + 1 : 0;
                self.shape.setRadius(radius);
            }
            
            return radius;
        };
        
        
        this.draw = function()
        {
            var self = this;
            self.layer.draw();
        };
        
        
        this.adjustRadiusForConnection = function(c)
        {
            var self = this;
            
            var sound_1 = geosounds.collection[c.sound_1];
            var sound_2 = geosounds.collection[c.sound_2];
                                 
            var sound_1_distance_from_center = self.dist(sound_1.coords.x, sound_1.coords.y, ffinterface.width/2, ffinterface.height/2);                            
            var sound_2_distance_from_center = self.dist(sound_2.coords.x, sound_2.coords.y, ffinterface.width/2, ffinterface.height/2);                            
            
            var closest_distance             = (sound_1_distance_from_center < sound_2_distance_from_center) ? sound_1_distance_from_center : sound_2_distance_from_center;

            self.shape.setRadius(closest_distance-1); //subtracted 1 just so that first sound will change colors.
            
            // set the playhead to playing mode!
            self.is_playing = true;            
        };
        
        
        this.pointIsWithin = function(x,y)
        {
            var self = this;
            
            var distance_from_center = self.dist(x, y, ffinterface.width/2, ffinterface.height/2);
            
            if (distance_from_center <= self.shape.getRadius().x)
            {
                return true;
            }
            else
            {
                return false;
            }
        };
        
        this.pointIsOn = function(x,y)
        {
            var self = this;
            
            var distance_from_center = self.dist(x, y, ffinterface.width/2, ffinterface.height/2);
            
            if (distance_from_center == self.shape.getRadius().x)
            {
                return true;
            }
            else
            {
                return false;
            }
        };        

        this.playerToggleControl = function()
        {
            var self = this;
            
            $(window).keypress(function(e) 
            {
                // check if a form is open
                var formActive = ($('#clickLayer').css('display') == 'block') ? true : false;
                
                if (connections.getActiveConnections().length > 0 && !formActive)
                {
        	        var key = e.which || e.keyCode || e.keyChar;

        	        // return, backspace, escape, space
                    if (key == 8 || key == 13 || key == 27 || key == 32)
                    {
                        self.is_playing = !self.is_playing;                        
                        self.togglePlayerSounds();
                    }		            
                }
            });
        };

        this.togglePlayerSounds = function() 
        {
            var self = this;
            
            var sounds = geosounds.layer.getChildren();
            for (var i=0; i<sounds.length; i++)
            {
                var sound = sounds[i];
                if (sound.getAttrs().active)
                {
                    var player = sound.getAttrs().player;
                    (self.is_playing) ? player.play() : player.pause();                            
                }
            }		    
        };
        
        this.dist = function(x1,y1,x2,y2)
        {
            return Math.floor(Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) ));
        };
        
	};
})(jQuery);