;(function($){
	var ffinterface = window.ffinterface = new function() 
	{
	    this.running = false;           // represents the high level state of the entire interface
	    this.frameRate;                 // refresh rate
	    this.width;                     // window width
	    this.height;                    // window height
	    this.lastClick       = -1;      // holds the sound shape object that was clicked on last
        this.constellation;             // current active constellation
        this.loading_constellation = false  // set to true when a constellation is loaded (rotated + zoomed)
        this.stage;                     // kineticJS stage 
		this.addButton = 0;             // this is used to check whether the "save constellation" appeared
		this.search_results = { 'Geosounds': [], 'Constellations': [] }; 
		this.justAddedCountdown = 0;
		this.images;

        /* set up the interface and run it */
        this.init = function()
        {
            var self = this;
            
    	    self.width              = $('#interface').width();
    	    self.height             = $('#interface').height();            
            
            var sources = {
                playhead_fill   : STATIC_URL + 'images/stripes_5.png',
                loading_gif     : STATIC_URL + 'images/loading_greystripes.gif'
            };
            
            // first load images, then init kineticJS shapes and everything else
            self.loadImages(sources, function(images) 
            {
                // assign the loaded images to the interface scope
                self.images = images;

                self.setup();            

                // Set framerate to 30 fps
                self.framerate = 1000/30;

                // run update-draw loop
                setInterval(function() { self.update(); self.draw(); }, self.framerate);

                setTimeout(function() 
                {
                    pov.randomize();
                    self.running = true;                    
                }, 400);
            });
        };


        this.setup = function()
        {   
            var self = this;
            
            self.stage = new Kinetic.Stage({container: "interface", width: self.width, height: self.height });

            playhead.init();
            
            pov.init();
            
            geosounds.init();
            
            connections.init();
                                    
            $("#loadingGif").fadeToggle("fast", "linear");
        }


        this.previewConstellation = function(id, rotate, callback)
        {
            var self = this;
            
            // first clear the current connections
            connections.clearConnections();
            
            playhead.is_playing = false;
            playhead.togglePlayerSounds();
            
            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                if (CONSTELLATIONS[i].pk == id)
                {
                    var constellation = CONSTELLATIONS[i].fields;
                    self.drawConstellation(constellation, rotate, true, callback());
                }
            }
        };
        
        this.drawConstellation = function(constellation, rotate, volumes, callback) 
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
                    var sound_1 = geosounds.points_layer.getChildren()[connection.index_1];
                    var sound_1_halo = sound_1.getChildren()[0];
                    var volume_1 = db_connection.sound_1_volume;
                    var radius_1 = self.map(volume_1, 0.2, 0.9, 5, 20);
                    sound_1_halo.setRadius(radius_1);                            

                    var sound_2 = geosounds.points_layer.getChildren()[connection.index_2];
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
        
        this.previewAllConstellations = function()
        {
            var self = this;
            
            // first clear the current connections
            connections.clearConnections();
            
            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                var constellation = CONSTELLATIONS[i].fields;

                self.drawConstellation(constellation, false, false, function() {});
            }
        };
        
         this.loadConstellation = function(id, rotate)
         {
            var self = this;

            self.loading_constellation = true;
            self.constellation = id;
            self.previewConstellation(id, rotate, function() 
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


        this.update = function()
        {      
            var self = this;

            // clear all layers
            self.clear();
            
            // update point of view according to rotation and zoom
            pov.update();
            
            // update playhead position
            playhead.update();
            
            geosounds.update();
            
            // update state of each connection
            connections.update();
        }
        
        this.clear = function()
        {
            var self = this;

            geosounds.clear();
            connections.clear();
            playhead.clear();
        };


        this.draw = function()
        {
            var self = this;
            
            geosounds.draw();
            connections.draw();
            playhead.draw();
        };


        this.loadImages = function(sources, callback) 
        {
            var self = this;

            var images = {};
            var loadedImages  = 0;
            var numImages     = 0;

            // get num of sources
            for(var src in sources) 
            {
                numImages++;
            }

            for(var src in sources) 
            {   
                images[src] = new Image();
                images[src].onload = function() 
                {
                    if (++loadedImages >= numImages) 
                    {
                        callback(images);
                    }
                };
                images[src].src = sources[src];
            }
        };


        this.map = function(value, istart, istop, ostart, ostop, confine) 
        {
           var result = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
           if (confine)
           {
               result = (result > ostop) ? ostop : result;
               result = (result < ostart) ? ostart : result;
           }
           return result;
        }
	};
})(jQuery);	