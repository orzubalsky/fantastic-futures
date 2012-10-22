;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{
	    this.running = false;           // represents the high level state of the entire interface
	    this.frameRate;                 // refresh rate
	    this.width;                     // window width
	    this.height;                    // window height
	    this.lastClick       = -1;      // holds the sound shape object that was clicked on last
        this.connections_2D  = [];      // array of all connections 
        this.constellation;             // current active constellation
        this.loading_constellation = false  // set to true when a constellation is loaded (rotated + zoomed)
        this.stage;                     // kineticJS stage 
        this.connections_layer;         // kinteticJS layer to hold all connection lines
        this.playhead_layer;            // kinteticJS layer to animate the circular playhead
        this.playhead = 0;              // this is actually the radius of the circular playhead
		this.addButton = 0;             // this is used to check whether the "save constellation" appeared
		this.is_playing = false;        // this is used to check whether the player is playing or paused
		this.playheadCount=0;  
		this.playheadIntervals=20;		//this is how often the playhead gets redrawn. A high number=less frequency of redrawing            
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
                    site.pov.randomize();
                    self.running = true;                    
                }, 400);
            });
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

        
        this.setup = function()
        {   
            var self = this;
            
            self.stage              = new Kinetic.Stage({
                container: "interface",
                width: self.width,
                height: self.height,                     
            });

            self.connections_layer   = new Kinetic.Layer();
            self.playhead_layer      = new Kinetic.Layer();            
            
            site.pov.init();
            
            site.geosounds.init();

            self.playhead();
            
            site.pov.setupStageDragging();

            lib.log(self.stage);
            
            self.playerToggleControl();

            $("#loadingGif").fadeToggle("fast", "linear");
        }


        this.getActiveConnections = function()
        {
            var self = this;
            
            for (var i=0; i<site.geosounds.sphere.connections.length; i++)
            {
                var c = site.geosounds.sphere.connections[i];
                
                var sound_1 = self.points_layer.getChildren()[c.index_1];
                var sound_2 = self.points_layer.getChildren()[c.index_2];
                
                c.sound_1_volume = self.map(sound_1.getChildren()[0].getAttrs().radius.x, 5, 20, 0.2, 0.9);
                c.sound_2_volume = self.map(sound_2.getChildren()[0].getAttrs().radius.x, 5, 20, 0.2, 0.9);
                
                c.sound_1_volume = Math.floor(c.sound_1_volume*100) / 100;
                c.sound_2_volume = Math.floor(c.sound_2_volume*100) / 100;                
            }
            return site.geosounds.sphere.connections;
        };
        
        this.previewConstellation = function(id, rotate, callback)
        {
            var self = this;
            
            // first clear the current connections
            self.clearConnections();
            
            self.is_playing = false;                        
            self.togglePlayerSounds();            
            
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
                var connection = new self.Connection3D();

                connection.sound_1 = db_connection.sound_1;
                connection.sound_2 = db_connection.sound_2;
                
                connection.index_1 = site.geosounds.getPointIndexFromId(db_connection.sound_1);             
                connection.index_2 = site.geosounds.getPointIndexFromId(db_connection.sound_2);
                
                if (volumes)
                {
                    var sound_1 = site.geosounds.points_layer.getChildren()[connection.index_1];
                    var sound_1_halo = sound_1.getChildren()[0];
                    var volume_1 = db_connection.sound_1_volume;
                    var radius_1 = self.map(volume_1, 0.2, 0.9, 5, 20);
                    sound_1_halo.setRadius(radius_1);                            

                    var sound_2 = site.geosounds.points_layer.getChildren()[connection.index_2];
                    var sound_2_halo = sound_2.getChildren()[0];
                    var volume_2 = db_connection.sound_2_volume;
                    var radius_2 = self.map(volume_1, 0.2, 0.9, 5, 20);
                    sound_2_halo.setRadius(radius_2);
                }

                site.geosounds.sphere.connections.push(connection);
                self.addConnectionToLayer(connection);
            }        
            
            if (rotate)
            {
                site.pov.rotateTo(constellation.rotation_x, constellation.rotation_y, constellation.rotation_z, constellation.zoom, 25, function() 
                {
                    callback();
                });
            }                
        };
        
        this.previewAllConstellations = function()
        {
            var self = this;
            
            // first clear the current connections
            self.clearConnections();
            
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
                self.setActiveStateForAllSounds();
                
                // reset addButton, so the loaded constellation could be altered and saved
                self.addButton = 0;
                
                // start the player
                self.is_playing = true;              
            });

         };

        this.clearConnections = function() 
        {
            var self = this;
            
            site.pov.clear();
            self.connections_2D = [];
            site.geosounds.sphere.connections = [];
            self.connections_layer.removeChildren();
            
            if (self.constellation > 0 && !self.is_animating)
            {
                for (var i=0; i<CONSTELLATIONS.length; i++)
                {
                    if (CONSTELLATIONS[i].pk == self.constellation)
                    {
                        var constellation = CONSTELLATIONS[i].fields;
                        self.drawConstellation(constellation, true, true, function() {});                        
                    }
                }
            }
        };  
        
        
        this.update = function()
        {      
            var self = this;

            // clear all layers
            self.clear();
            
            // update point of view according to rotation and zoom
            site.pov.update();
            
            // update playhead position
            var radius = self.updatePlayhead();
            
            site.geosounds.update();
            
            // update state of each connection
            self.updateConnections();
        }
        
        this.clear = function()
        {
            var self = this;

            site.geosounds.clear();
            self.connections_layer.clear();
            self.playhead_layer.clear();
        };


        this.updatePlayhead = function()
        {
            var self = this;
            
            var playhead    = self.playhead_layer.getChildren()[0];
            var radius      = playhead.getRadius();

            if (self.is_playing)
            {
                radius = (radius.x < self.width / 2) ? Math.floor(radius.x) + 1 : 0;
                playhead.setRadius(radius);
            }
            
            return radius;
        };
        

        this.updateConnections = function()
        {
            var self = this;
            
            for(var i=0; i<self.connections_layer.getChildren().length; i++)
            {
                var connection = site.geosounds.sphere.connections[i];
                var child = self.connections_layer.getChildren()[i];

                var p1 = site.geosounds.collection[connection.index_1];
                var p2 = site.geosounds.collection[connection.index_2];

                child.setPoints([ {x: p1.x, y: p1.y}, {x: p2.x, y: p2.y} ]);
            }
        };
        


        this.draw = function()
        {
            var self = this;
            
            site.geosounds.draw();
            self.connections_layer.draw();
            self.playhead_layer.draw();
        };
        
		
		this.connectTwoSoundShapes = function(soundShape_1, soundShape_2)
		{
		    var self = this;
		    
            // create connection between the two sounds
            c = self.newConnectionFromTwoSoundShapes(soundShape_1, soundShape_2);

            // start playing both sounds when the connection is made
            var sound_1 = site.geosounds.points_layer.getChildren()[c.index_1];
            var sound_2 = site.geosounds.points_layer.getChildren()[c.index_2];
            sound_1.getAttrs().player.play();
            sound_2.getAttrs().player.play();    

            // now show all of the other possible connections by highlighting the other sounds                    
            site.geosounds.styleAllInactiveSoundShapes('white');		    
		};

        
        this.newConnectionFromTwoSoundShapes = function(soundShape_1, soundShape_2)
        {
            var self = this;

            c = new self.Connection3D();

            c.sound_1 = soundShape_1.getAttrs().id;
            c.sound_2 = soundShape_2.getAttrs().id;
            c.index_1 = soundShape_1.getAttrs().index;
            c.index_2 = soundShape_2.getAttrs().index;
            site.geosounds.sphere.connections.push(c);  
            self.addConnectionToLayer(c);
            
            return c;
        };

        this.playerToggleControl = function()
        {
            var self = this;
            
            $(window).keypress(function(e) 
            {
                // check if a form is open
                var formActive = ($('#clickLayer').css('display') == 'block') ? true : false;
                
                if (self.getActiveConnections().length > 0 && !formActive)
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
        
        
        this.playhead = function()
        {
            var self = this;
            var playhead = new Kinetic.Circle({
                x               : self.width / 2,
                y               : self.height / 2,
                alpha           : 0.8,
                radius          : 0,
                fill            : {image: self.images.playhead_fill, offset: [0, 0]}, //stripes
                stroke          : "#efefef",
                strokeWidth     : .25,
            });

            self.playhead_layer.add(playhead);
            self.stage.add(self.playhead_layer);            

        };
        
        this.addConnectionToLayer = function(connection)
        {	
            var self = this;
            
            var p1 = site.geosounds.collection[connection.index_1];
            var p2 = site.geosounds.collection[connection.index_2];
		    		    		    
            var line = new Kinetic.Line({
                points          : [p1.x, p1.y, p2.x, p2.y],
                stroke          : "#005fff",
                strokeWidth     : 0.25,
                lineCap         : "round",
                lineJoin        : "round"
            });
            self.connections_layer.add(line);
        };

        
        this.Connection3D = function()
        {
            this.sound_1 = 0;
            this.sound_2 = 0;
            this.index_1 = 0;
            this.index_2 = 0;
            this.sound_1_volume = 0.0;
            this.sound_2_volume = 0.0;
        }

      
        this.deg_to_rad = function(degrees)
        {
            return degrees * Math.PI / 180.0;
        }
        
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