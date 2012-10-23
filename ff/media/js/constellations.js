;(function($){
	var constellations = window.constellations = new function() 
	{
	    this.collection = [];
        this.constellation;                 // current active constellation
        this.loading_constellation = false  // set to true when a constellation is loaded (rotated + zoomed)
		this.addButton = false;                 // this is used to check whether the "save constellation" appeared        


        this.init = function()
        {
            var self = this;
            
            self.collection = CONSTELLATIONS;
        };


        this.clear = function()
        {
            var self = this;

            pov.clear();
            connections.collection = [];
            connections.layer.removeChildren();

            if (self.constellation > 0 && !pov.is_animating)
            {
                for (var i=0; i<CONSTELLATIONS.length; i++)
                {
                    if (CONSTELLATIONS[i].pk == self.constellation)
                    {
                        var constellation = CONSTELLATIONS[i].fields;
                        self.drawOne(constellation, true, true, function() {});                        
                    }
                }
            } 
        };


        this.previewOne = function(id, rotate, callback)
        {
            var self = this;

            // first clear the current connections
            self.clear();

            playhead.is_playing = false;
            playhead.togglePlayerSounds();

            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                if (CONSTELLATIONS[i].pk == id)
                {
                    var constellation = CONSTELLATIONS[i].fields;
                    self.drawOne(constellation, rotate, true, callback());
                }
            }
        };
        
        this.drawOne = function(constellation, rotate, volumes, callback) 
        {
            var self = this;

            for (var j=0; j<constellation.connections.length; j++)
            {
                var db_connection = constellation.connections[j].fields;
                var c = connections.add(db_connection.sound_1, db_connection.sound_2, false);
                
                if (volumes)
                {
                    var s1 = geosounds.collection[c.sound_1];
                    var s2 = geosounds.collection[c.sound_2];

                    s1.setVolume(db_connection.sound_1_volume);
                    s2.setVolume(db_connection.sound_2_volume);
                }
            }
            
            if (rotate)
            {
                pov.rotateTo(constellation.rotation_x, constellation.rotation_y, constellation.rotation_z, constellation.zoom, 25, function() 
                {
                    callback();
                });
            }                
        };
        
        this.preview = function()
        {
            var self = this;
            
            // first clear the current connections
            self.clear();
            
            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                var constellation = CONSTELLATIONS[i].fields;

                self.drawOne(constellation, false, false, function() {});
            }
        };
        
         this.loadOne = function(id, rotate)
         {
            var self = this;

            self.loading_constellation = true;
            self.constellation = id;
            self.previewOne(id, rotate, function() 
            {                                
                // after rotation/zoom is done, set loading_constellation to reflect the current state
                self.loading_constellation = false;
                                
                // set active state for all connected sounds
                geosounds.setActiveStateForAllSounds();
                
                // reset addButton, so the loaded constellation could be altered and saved
                self.addButton = false;
                
                // start the player
                playhead.is_playing = true;
            });

         };
	};
})(jQuery);