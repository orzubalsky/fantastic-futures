;(function($){
	var playhead = window.site.playhead = new function() 
	{
        this.layer;                      // kinteticJS layer to animate the circular playhead
        this.playhead           = 0;     // this is actually the radius of the circular playhead
		this.is_playing         = false; // this is used to check whether the player is playing or paused
		this.playheadCount      = 0;  
		this.playheadIntervals  =20;     //this is how often the playhead gets redrawn. A high number=less frequency of redrawing            


        this.init = function()
        {
            var self = this;
            
            self.layer = new Kinetic.Layer();
            
            var playhead = new Kinetic.Circle({
                x               : site.ffinterface.width / 2,
                y               : site.ffinterface.height / 2,
                alpha           : 0.8,
                radius          : 0,
                fill            : {image: site.ffinterface.images.playhead_fill, offset: [0, 0]}, //stripes
                stroke          : "#efefef",
                strokeWidth     : .25,
            });

            self.layer.add(playhead);
            site.ffinterface.stage.add(self.layer);

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
            
            var playhead    = self.layer.getChildren()[0];
            var radius      = playhead.getRadius();

            if (self.is_playing)
            {
                radius = (radius.x < self.width / 2) ? Math.floor(radius.x) + 1 : 0;
                playhead.setRadius(radius);
            }
            
            return radius;
        };
        
        
        this.draw = function()
        {
            var self = this;
            self.layer.draw();
        };
        

        this.playerToggleControl = function()
        {
            var self = this;
            
            $(window).keypress(function(e) 
            {
                // check if a form is open
                var formActive = ($('#clickLayer').css('display') == 'block') ? true : false;
                
                if (site.connections.getActiveConnections().length > 0 && !formActive)
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
            
            var sounds = site.geosounds.points_layer.getChildren();
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
	};
})(jQuery);