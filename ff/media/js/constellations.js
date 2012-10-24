;(function($){
	var constellations = window.constellations = new function() 
{
    this.collection = [];
    this.constellation;                 // current active constellation
    this.loading_constellation = false  // set to true when a constellation is loaded (rotated + zoomed)
	this.addButton = false;             // this is used to check whether the "save constellation" appeared        


    this.init = function()
    {        
        this.collection = CONSTELLATIONS;
    };

    this.clear = function()
    {
        pov.clear();
        connections.collection = [];
        connections.layer.removeChildren();

        if (this.constellation > 0 && !pov.is_animating)
        {
            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                if (CONSTELLATIONS[i].pk == this.constellation)
                {
                    var constellation = CONSTELLATIONS[i].fields;
                    this.drawOne(constellation, true, true, function() {});                        
                }
            }
        } 
    };

    this.previewOne = function(id, rotate, callback)
    {
        // first clear the current connections
        this.clear();

        playhead.is_playing = false;
        playhead.togglePlayerSounds();

        for (var i=0; i<CONSTELLATIONS.length; i++)
        {
            if (CONSTELLATIONS[i].pk == id)
            {
                var constellation = CONSTELLATIONS[i].fields;
                this.drawOne(constellation, rotate, true, callback());
            }
        }
    };
    
    this.drawOne = function(constellation, rotate, volumes, callback) 
    {
        for (var i=0; i<constellation.connections.length; i++)
        {
            var db_connection = constellation.connections[i].fields;
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
        // first clear the current connections
        this.clear();
        
        for (var i=0; i<CONSTELLATIONS.length; i++)
        {
            var constellation = CONSTELLATIONS[i].fields;

            this.drawOne(constellation, false, false, function() {});
        }
    };
    
     this.loadOne = function(id, rotate)
     {
        this.loading_constellation = true;
        this.constellation = id;
        this.previewOne(id, rotate, function() 
        {                                
            // after rotation/zoom is done, set loading_constellation to reflect the current state
            this.loading_constellation = false;
                            
            // set active state for all connected sounds
            geosounds.setActiveStateForAllSounds();
            
            // reset addButton, so the loaded constellation could be altered and saved
            this.addButton = false;
            
            // start the player
            playhead.is_playing = true;
        });
     };
};
})(jQuery);