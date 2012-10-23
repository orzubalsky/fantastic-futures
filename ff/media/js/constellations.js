;(function($){
	var constellations = window.constellations = new function() 
	{
	    this.collection = [];
        this.constellation;                 // current active constellation
        this.loading_constellation = false  // set to true when a constellation is loaded (rotated + zoomed)


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
                var connection = new Connection();

                connection.sound_1 = db_connection.sound_1;
                connection.sound_2 = db_connection.sound_2;
                
                connection.index_1 = geosounds.getPointIndexFromId(db_connection.sound_1);             
                connection.index_2 = geosounds.getPointIndexFromId(db_connection.sound_2);
                
                if (volumes)
                {
                    var sound_1 = geosounds.layer.getChildren()[connection.index_1];
                    var sound_1_halo = sound_1.getChildren()[0];
                    var volume_1 = db_connection.sound_1_volume;
                    var radius_1 = self.map(volume_1, 0.2, 0.9, 5, 20);
                    sound_1_halo.setRadius(radius_1);                            

                    var sound_2 = geosounds.layer.getChildren()[connection.index_2];
                    var sound_2_halo = sound_2.getChildren()[0];
                    var volume_2 = db_connection.sound_2_volume;
                    var radius_2 = self.map(volume_1, 0.2, 0.9, 5, 20);
                    sound_2_halo.setRadius(radius_2);
                }

                connections.collection.push(connection);
                connection.init();
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
                self.addButton = 0;
                
                // start the player
                playhead.is_playing = true;
            });

         };
	};
})(jQuery);