;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{
	    this.running = false;           // represents the high level state of the entire interface
	    this.frameRate;                 // refresh rate
	    this.width;                     // window width
	    this.height;                    // window height
	    this.lastClick       = -1;      // holds the sound shape object that was clicked on last
        this.sphere;                    // an object that contains the entire 3D space TODO: move this out of this file
        this.rotation;                  // 3D rotation for the sphere, in radians. {x: 0.0, y: 0.0, z:0.0 }
        this.rotation_interval;         // holds the js interval variable for rotation animations
        this.base_distance   = 2000;    // 
        this.distance        = 2000;    // POV for 3D sphere
        this.map_points      = [];      // array of points from map.js
        this.points_2D       = [];      // array of all 2D points, coordinates are calculated every frame
        this.connections_2D  = [];      // array of all connections 
        this.constellation;             // current active constellation
        this.map_points_count;          // keeps track of map sound count. this is used to determine whether a new sound was added
        this.stage;                     // kineticJS stage 
        this.points_layer;              // kinteticJS layer to hold all sound shapes
        this.connections_layer;         // kinteticJS layer to hold all connection lines
        this.playhead_layer;            // kinteticJS layer to animate the circular playhead
        this.rotation_layer;            // kinteticJS layer, allows drag interaction to rotate the stage
        this.playhead = 0;              // this is actually the radius of the circular playhead
		this.addButton = 0;             // this is used to check whether the "save constellation" appeared
		this.is_playing = false;        // this is used to check whether the player is playing or paused
		this.playheadCount=0;  
		this.playheadIntervals=20;		//this is how often the playhead gets redrawn. A high number=less frequency of redrawing            
		this.zoom = 1.0;
		this.search_results = { 'Geosounds': [], 'Constellations': [] }; 
		

        /* set up the interface and run it */
        this.init = function()
        {
            var self = this;
            
            self.rotation           = { x: 0, y: 0, z: 0 };            
    	    self.width              = $('#interface').width();
    	    self.height             = $('#interface').height();            
            self.sphere             = new self.Sphere3D();
            self.stage              = new Kinetic.Stage({
                container: "interface",
                width: self.width,
                height: self.height,                     
            });
            self.rotation_layer      = new Kinetic.Layer();
            self.points_layer        = new Kinetic.Layer();        
            self.connections_layer   = new Kinetic.Layer();            
            self.playhead_layer      = new Kinetic.Layer();            
				
            self.setup();            

            // Set framerate to 30 fps
            self.framerate = 1000/30;
            
            // run update-draw loop
            setInterval(function() { self.update(); self.draw(); }, self.framerate);
            
            self.running = true;            
        };
        
        this.resetRotation = function()
        {
            var self = this;
            var rotation = self.rotation;
            
            self.rotateTo(0,0,0, 1.0, function() 
            {
                $('#interface').fadeOut(2000);
                $('#map').css('opacity','1');
                $('#map').fadeIn(500);                
            });
        };
        
        this.rotateTo = function(x,y,z, zoom, callback)
        {   
            var self = this;
            
            clearInterval(self.rotation_interval)
            
            self.rotation_interval = setInterval(function() 
            {   
                self.rotation.x = self.rotateAxis(self.rotation.x, x, 25);
                self.rotation.y = self.rotateAxis(self.rotation.y, y, 25);
                self.rotation.z = self.rotateAxis(self.rotation.z, z, 25);
                self.zoom       = self.rotateAxis(self.zoom, zoom, 100);
                
                if ( self.rotation.x == x && self.rotation.y == y && self.rotation.z == z && self.zoom == zoom)
                {
                    clearInterval(self.rotation_interval);
                    callback();
                }
            }, self.frameRate);
        };
        
        this.rotateAxis = function(current, target, pace)
        {
            var self = this;
            var difference = Math.abs(current - target);
            var multiplier = (current > target) ? -1 : 1;
            
            return (difference > self.deg_to_rad(1)) ? current + multiplier * difference/pace : target;
        };  
        
        this.changeZoom = function(amount)
        {
            var self = this;
            
            self.zoom += amount;
            
            self.zoom = (self.zoom > 15.0) ? 15.0 : self.zoom;
            self.zoom = (self.zoom < 1.0) ? 1.0 : self.zoom;
        };   
        
        this.setup = function()
        {   
            var self = this;
                        
            for(var i=0; i<self.map_points.length; i++)
            {
                self.mapPointToSpherePoint(self.map_points[i]);
            }
            self.map_points_count = self.map_points.length;        
            
    		self.playhead(); //comment out to get rid of playhead
            
            self.setupStageDragging();
            
            self.sphereRefresh();
            
            self.playerToggleControl();
            
            self.initPoints();
                                    
            $("#loadingGif").fadeToggle("fast", "linear");
        }
        
        this.mapPointToSpherePoint = function(map_point)
        {
            var self = this;
            
            p = new self.Point3D();
            
            p.z         = map_point.z;
            p.x         = self.reverse_projection(map_point.x, p.z, self.width/2.0, 100.0, self.distance);
            p.y         = self.reverse_projection(map_point.y, p.z, self.height/2.0, 100.0, self.distance);
            p.id        = map_point.id;
            p.title     = map_point.title;
            p.created_by= map_point.created_by;
            p.location  = map_point.location;
            p.story     = map_point.story;
            p.filename  = map_point.filename;
            p.volume    = map_point.volume;
            p.is_recent = map_point.is_recent;
                        
            // add point to sphere point array
            self.sphere.point.push(p);
                        
            // the new sound index
            var index = self.sphere.point.length - 1;
                                    
            // push the point manually to the 2D point array so we can add a sound to the interface
            self.addSpherePointToPoints2D(p, index);
            
            // the newly added 2D point
            var new_2d_point = self.points_2D[index];
            
            // add sound shape to the interface
            self.addPointToLayer(new_2d_point);               
        };
        
        this.initPoints = function()
        {
            var self = this;
            
            self.stage.add(self.points_layer);
            
            for (var i=0; i<self.sphere.connections.length; i++)
            {                
                self.addConnectionToLayer(self.sphere.connections[i]);
            }
            self.stage.add(self.connections_layer);
        }
        
        this.getActiveConnections = function()
        {
            var self = this;
            
            return self.sphere.connections;
        };
        
        this.loadConstellation = function(id, rotate)
        {
            var self = this;
            
            // first clear the current connections
            self.clearConnections();
            
            for (var i=0; i<CONSTELLATIONS.length; i++)
            {
                if (CONSTELLATIONS[i].pk == id)
                {
                    var constellation = CONSTELLATIONS[i].fields;
                    
                    if (rotate)
                    {
                        self.rotateTo(constellation.rotation_x, constellation.rotation_y, constellation.rotation_z, constellation.zoom, function() {});
                    }
                    
                    for (var j=0; j<constellation.connections.length; j++)
                    {
                        var db_connection = constellation.connections[j].fields;
                        var connection = new self.Connection3D();

                        connection.sound_1 = db_connection.sound_1;
                        connection.sound_2 = db_connection.sound_2;
                        connection.index_1 = self.getPointIndexFromId(db_connection.sound_1);             
                        connection.index_2 = self.getPointIndexFromId(db_connection.sound_2);
                        self.sphere.connections.push(connection);                        
                        self.addConnectionToLayer(connection);
                    }                    
                }
            }
        };      
        
        this.clearConnections = function() 
        {
            var self = this;
            
            self.connections_2D = [];
            self.sphere.connections = [];
            self.connections_layer.removeChildren();
        };  
        
        this.getPointIndexFromId = function(sound_id)
        {
            var self = this;
            
            for(var j=0; j<self.points_2D.length; j++)
            {
                var point = self.points_2D[j];
                if (point.id == sound_id)
                {
                    return point.index;
                }
            }            
        };
        
        this.update = function()
        {      
            var self = this;
            var rotation = self.rotation;

             
            // stage drag rotation calculation
            var rotation_canvas = self.rotation_layer.getChildren()[0];
            if (rotation_canvas.isDragging()) {
                
                // stop any rotation animation that was running
                 clearInterval(self.rotation_interval);
                
                 var mousePos = self.stage.getMousePosition();
                 
                 var s = 10;
                 var x = ((mousePos.x * 2*s) - self.width*s) / self.width;
                 var y = ((mousePos.y * 2*s) - self.height*s) / self.height;
                 
                 rotationYAmount = self.deg_to_rad(Math.abs(x)) / self.zoom;
                 rotation.y += rotationYAmount;
                 rotation.y = (rotation.y >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : rotation.y;

                 rotationXAmount = self.deg_to_rad(Math.abs(y)) / self.zoom;
                 rotation.x += rotationXAmount;
                 rotation.x = (rotation.x >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : rotation.x;
            }
            
            // stage zoom calculation
            $('#interface').mousewheel(function(event, delta, deltaX, deltaY) 
            {
                self.changeZoom(deltaY / 10000);
            });
            self.distance = self.base_distance * self.zoom;
            
            //playhead //comment out to get rid of playhead
            var playhead    = self.playhead_layer.getChildren()[0];
            var radius      = playhead.getRadius();
			        
            if (self.is_playing)
            {	
                radius = (radius.x < self.width / 2) ? radius.x + 1 : 0;
				playhead.setRadius(radius); 
            }
            
            //unhide to get rid of playhead
            /*var radius = self.playhead;
            radius = (radius < self.width / 2) ? radius + 1 : 0;
            self.playhead = radius;*/

            var sounds = self.points_layer.getChildren();
            for (var i=0; i<sounds.length; i++)
            {
                var sound = sounds[i];
                var player = sound.getAttrs().player;
                var distance_from_center = self.dist(sound.getX(), sound.getY(), self.width/2, self.height/2);
                if (distance_from_center == radius)
                {                    
                    if (sound.getAttrs().active == true)
                    {
                        player.stop();  
                        player.play();
						sound.getChildren()[1].setFill("#005fff");	//style sound that is playing
                    }
                }
            }
            
            
            // check whether a new point was added on the openlayers map
            if (self.map_points.length > self.map_points_count)
            {     
                lib.log("a sound was added");
                self.map_points_count = self.map_points.length;
                self.mapPointToSpherePoint(self.map_points[self.map_points_count-1]);                
            }
            
            // style sounds and constellations according to the search results
            self.styleAllSearchedSoundShapes();
            
            if (self.search_results.Constellations.length > 0)
            {
                var searched_constellations = self.search_results.Constellations;
            }
            
            // rebuild projected 2d point array
            self.sphereRefresh();
        }

        this.draw = function()
        {
            	var self = this;
		
            self.points_layer.clear();
            self.connections_layer.clear();
            //self.playhead_layer.clear();
	
            for(var i=0; i<self.points_layer.getChildren().length; i++)
            {
                var point = self.points_2D[i];
                var sound = self.points_layer.getChildren()[i];
                var halo = sound.getChildren()[0];
                var core = sound.getChildren()[1];
               
                sound.setX(point.x);
                sound.setY(point.y);
               
                var attrs = sound.getAttrs();
                attrs.point_3d.x = point.point_3d.x;
                attrs.point_3d.y = point.point_3d.y;
                attrs.point_3d.z = point.point_3d.z;

                sound.setAttrs(attrs);
            }                        
           
            for(var i=0; i<self.connections_layer.getChildren().length; i++)
            {
                var connection = self.sphere.connections[i];
                var child = self.connections_layer.getChildren()[i];

                var p1 = self.points_2D[connection.index_1];
                var p2 = self.points_2D[connection.index_2];
   
                child.setPoints([ {x: p1.x, y: p1.y}, {x: p2.x, y: p2.y} ]);
            }            
           	
			//self.playhead_layer.draw();   
            self.rotation_layer.draw();
            self.points_layer.draw();
            self.connections_layer.draw();
	
			self.playhead_layer.clear();
			self.playhead_layer.draw();
			/*if (this.playheadCount%this.playheadIntervals==0){ //playhead does something at regular intervals
				self.playhead_layer.clear();
				self.playhead_layer.draw(); 
			//makes playhead flash
				$(".kineticjs-content canvas:first-child").fadeOut(800, function(){
					self.playhead_layer.clear();
				});
				$(".kineticjs-content canvas:first-child").fadeIn(800, function(){
					self.playhead_layer.draw(); 
				});
			
				this.playheadCount++;   
				
			}      
			else {
				this.playheadCount++;
			}*/
        }
        
        
		this.addPointToLayer = function(point)
		{	
		    var self = this;
		    
		    // radius value for halo is calculated according to the sound's default volume
            var radius = self.map(point.sphere_point.volume, 0.2, 0.8, 5, 20, true);		    
		    
		    // Kinetic group to store coordinates and meta data about the sound
		    var sound = new Kinetic.Group({
                x           : point.x,
                y           : point.y,
                alpha       : 0.4,
                point_3d    : point.point_3d,
                data        : point.sphere_point,
                index       : point.index,
                id          : point.id,
                active      : false,
                draggable   : true,
                dragBounds: { top: 0, right: 0, bottom: 0, left: 0 },
                start_x     : 0,
                start_y     : 0, 
				name		: point.sphere_point.created_by,
				location	: point.sphere_point.location,
				story		: point.sphere_point.story,
				isNew		: point.sphere_point.is_recent,
				justAdded	: false,
				player      : '',
				timeout     : '',
				interval    : '',
		    });
		    		    		     
            sound.on("mouseover", function() 
            {
                // change cursor 
                $('#container').css({'cursor':'pointer'});
                
                // populate the sound text div with this sound's data, position it, and display it
				$('.soundText')
				    .html(this.getAttrs().name+'<br/>'+this.getAttrs().location+'<br/><div class="story">'+this.getAttrs().story+'</div>') 
				    .css({ 
				        'top'   : (this.getAttrs().y-110) + 'px',
                        'left'  : (this.getAttrs().x-27) + 'px'				        
                    })
                    .fadeIn("400");

				if (this.getAttrs().story==""){
					$('.story').css('display','none');
				}

                // if the sound isn't active, highlight it
                if (! this.getAttrs().active)
                {
                    this.setAlpha(1);                    
                }
            });            
            sound.on("mouseout", function() 
            {
                // clear volume halo animation timing variables
                clearTimeout(sound.timeout);
                clearInterval(sound.interval);

                // reset cursor 
                $('#container').css({'cursor':'default'});
                
                // hide the sound text div
				$('.soundText').fadeOut("400");
				
				// reset the sound style
                if (!this.getAttrs().active)
                {
                    this.setAlpha(0.4);                    
                }
            });
            sound.on("mouseup", function() 
            {
                // clear volume halo animation timing variables                
                clearTimeout(sound.timeout);
                clearInterval(sound.interval);             
            });
            sound.on("mousedown", function() 
            {
                // if the sound is connected to connections it's always "active"
                if (self.soundShapeConnectsToExistingConnection(this))
                {
                    this.getAttrs().active = true;
                }
                else 
                {
                    // if it's not connected, the active state is toggled with every mouse click
                    this.getAttrs().active = !this.getAttrs().active;                    
                }
                
                if ( this.getAttrs().active) 
                {
                     // create a player instance for this sound
                     if (this.getAttrs().player == '')
            	     {
            	         var player = new site.Player(this.getAttrs().id, this.getAttrs().index, this.getAttrs().data.filename, 0.8);
            	         this.setAttrs({player: player});
        		         this.getAttrs().player.init();
    		         }

                     // change the "core" color
                     this.getChildren()[1].setFill('#005fff');

                     // store the sound instance in a variable (js timeout function creates a new scope for "this")
                     var shape = this;
                    
                    // wait 500ms and then start animating the halo/volume
                    this.timeout = setTimeout(function() 
                    {
                        // the halo shape is the first child of the sound group
                        var halo = shape.getChildren()[0];
                        
                        // since halo is an ellipse, it has x & y values for its radius
                        var radius = halo.getRadius().x;
                        
                        // animate the radius in a loop
                        sound.interval = setInterval(function() 
                        {
                            radius = (radius <= 20) ? radius + 0.1 : 5;
                            	halo.setRadius(radius);
                        }, self.frameRate);
                    }, 500);
                                        
                    
                    /* SOUND CONNECTION LOGIC */
                    
                    // if this is the first sound clicked in order to make a connection
                    if (self.lastClick == -1) 
                    {
                        // if there are connections, you can only connect the sound to them
                        if (self.getActiveConnections().length > 0)
                        {
                            self.styleAllOtherActiveSoundShapes(this, 'white');                            
                        }
                        else 
                        {
                            // if there aren't, this is the first sound ever clicked, and anything is possible!
                            self.styleAllInactiveSoundShapes('white');
                        }                        
                    }
                    else
                    {
                        // this is the second sound clicked on, several scenarios are possible:
                        
                        // 1. this is the first connection made
                        if (self.getActiveConnections().length == 0)
                        {
                            // make the connection between this sound and the one last clicked
                            c = self.connectTwoSoundShapes(self.lastClick, this);
                            
                            // show add constellation link upon making the first connection 
                            if (self.addButton == 0)
                            {
                                $('#addConstellationText').fadeToggle("fast", "linear");
                                self.addButton = 1;
                            }
                            
                            // expand the playhead so the radius is as big as the sound that's closest to the center
                            var sound_1_distance_from_center = self.dist(self.lastClick.getX(), self.lastClick.getY(), self.width/2, self.height/2);                            
                            var sound_2_distance_from_center = self.dist(this.getX(), this.getY(), self.width/2, self.height/2);                            
                            var closest_distance             = (sound_1_distance_from_center < sound_2_distance_from_center) ? sound_1_distance_from_center : sound_2_distance_from_center;
                            var playhead                     = self.playhead_layer.getChildren()[0];
                            playhead.setRadius(closest_distance);
                            
                            // set the interface to playing mode!
                            self.is_playing = true;
                        }
                        else 
                        {                            
                            // 2. this is a connection made in succession, right after another was just made
                            if (self.soundShapeConnectsToExistingConnection(this) == false && self.soundShapeConnectsToExistingConnection(self.lastClick) == true)
                            {
                                // make the connection between this sound and the one last clicked
                                c = self.connectTwoSoundShapes(self.lastClick, this);                                
                            }
                            
                            // 3. this a connection made after resetting he lastClick variable, 
                            //    clicking on a sound that isn't conneted, 
                            //    and connecting it to a sound which is connected
                            if (self.soundShapeConnectsToExistingConnection(this) == true && self.soundShapeConnectsToExistingConnection(self.lastClick) == false)
                            {
                                // make the connection between this sound and the one last clicked
                                c = self.connectTwoSoundShapes(self.lastClick, this);                                
                            }  
                            
                            // 4. this a connection made after resetting he lastClick variable, 
                            //    clicking on a sound that *is* conneted, 
                            //    and connecting it to a sound which isn't connected
                            if (self.soundShapeConnectsToExistingConnection(this) == true && self.soundShapeConnectsToExistingConnection(self.lastClick) == true)
                            {
                                // make the connection between this sound and the one last clicked
                                c = self.connectTwoSoundShapes(self.lastClick, this);                                
                            }  
                        }
                    }

                    // store the sound which was clicked in the interface lastClick variable
                    self.lastClick = this;
                }
                else 
                {
                    // reset core color to original
                    this.getChildren()[1].setFill('#000');
                    
                    // remove audio player instance
                    this.player.destroy();
                }
            });		    
		
		    // volume halo ellipse
		    var halo = new Kinetic.Circle({
                radius        : radius,
                fill          : "#ccc",
                stroke        : "white",
                strokeWidth   : 0,
		    });
		    
		    // core ellipse for interaction
            var core = new Kinetic.Circle({
              radius        : 2,
              fill          : "black",
              stroke        : "transparent",
              strokeWidth   : 0,
            }); 
			
			//checking if sound is new and changing the color
			if (sound.getAttrs().isNew) {
			//	halo.setFill('#005fff');
				halo.setFill('#666');
			}
			 
			/*if (sound.getAttrs().justAdded) {
				sound.setAlpha(1);
			}*/
			
			//trying to add animation
			/*
			var duration = 1000 ; // we set it to last 1s 
			var anim = new Kinetic.Animation({
			    func: function(frame) {
			        if (frame.time >= duration) {
			           anim.stop() ;
			       } else {
					
			            sound.setOpacity(frame.time / duration) ;
			        }
			    },
			    node: layer
			});*/
			
            sound.add(halo);
            sound.add(core);
			//anim.start();
            self.points_layer.add(sound);	
		};
		
		this.connectTwoSoundShapes = function(soundShape_1, soundShape_2)
		{
		    var self = this;
		    
            // create connection between the two sounds
            c = self.newConnectionFromTwoSoundShapes(soundShape_1, soundShape_2);

            // start playing both sounds when the connection is made
            var sound_1 = self.points_layer.getChildren()[c.index_1];
            var sound_2 = self.points_layer.getChildren()[c.index_2];
            sound_1.getAttrs().player.play();
            sound_2.getAttrs().player.play();    

            // now show all of the other possible connections by highlighting the other sounds                    
            self.styleAllInactiveSoundShapes('white');		    
		};

        this.soundShapeConnectsToExistingConnection = function(soundShape)
        {
            var self = this;
            
            for (var i=0; i<self.sphere.connections.length; i++)
            {
                var c = self.sphere.connections[i];
                if (soundShape.getAttrs().index == c.index_1 || soundShape.getAttrs().index == c.index_2)
                {
                    return true;
                }
            }
            
            return false;
        };

		this.styleAllOtherActiveSoundShapes = function(clickedSoundShape, color)
		{
		    var self = this;
		    
            var allSoundsShapes = self.points_layer.getChildren();		    

            for(var i=0; i<allSoundsShapes.length; i++)
            {
                var soundShape = allSoundsShapes[i];

                // only apply the style change to sounds which are active and aren't this specific sound
                if (soundShape.getAttrs().active && i != clickedSoundShape.getAttrs().index)
                {                    
                    // color the "core" shape
                    soundShape.getChildren()[1].setFill(color);                                
                } 
                else
                {
                    soundShape.getChildren()[1].setFill('black');
                }
            }		    
		};
		
		this.styleAllInactiveSoundShapes = function(color)
		{
		    var self = this;
		    
            var allSoundsShapes = self.points_layer.getChildren();		    

            for(var i=0; i<allSoundsShapes.length; i++)
            {
                var soundShape = allSoundsShapes[i];

                // only apply the style change to sounds which are not active
                if (!soundShape.getAttrs().active)
                {                    
                    // color the "core" shape
                    soundShape.getChildren()[1].setFill(color);                                
                } 
                else
                {
                    soundShape.getChildren()[1].setFill('black');
                }
            }
        };
        
        this.styleAllSearchedSoundShapes = function()
        {
            var self = this;

            var allSoundsShapes = self.points_layer.getChildren();
            var searched_sounds = self.search_results.Geosounds;
            
            for(var i=0; i<allSoundsShapes.length; i++)
            {
                var soundShape = allSoundsShapes[i];
                
                if (searched_sounds.length > 0)
                {
                    for (var j=0; j<searched_sounds.length; j++)
                    {
                        var searched_sound = searched_sounds[j];
						var range = 1;

                        if (soundShape.getAttrs().id == searched_sound.id)
                        {
                            // color the "halo" shape
							//console.log(searched_sound.score);
                            var searchScore=Math.round((searched_sound.score/range)*255); //trying to correlate score to color
                            soundShape.getChildren()[0].setFill('rgb('+searchScore+',0,0)');
							//soundShape.getChildren()[0].setFill('rgb(255,0,0)');
                            //console.log(searchScore);
                            //soundShape.getChildren()[0].setFill("red");
                            break;
                        }
                        else 
                        {
                            soundShape.getChildren()[0].setFill("#ccc");
                        }
                    }
                }
                else
                {
                    soundShape.getChildren()[0].setFill("#ccc");
                }
            }
        };
        
        this.newConnectionFromTwoSoundShapes = function(soundShape_1, soundShape_2)
        {
            var self = this;

            c = new self.Connection3D();

            c.sound_1 = soundShape_1.getAttrs().id;
            c.sound_2 = soundShape_2.getAttrs().id;
            c.index_1 = soundShape_1.getAttrs().index;
            c.index_2 = soundShape_2.getAttrs().index;
            self.sphere.connections.push(c);  
            self.addConnectionToLayer(c);
            
            return c;
		};
		
		this.playerToggleControl = function()
		{
		    var self = this;
		    
		    $(window).keypress(function(e) 
		    {
		        // return, backspace, escape, space
                if (e.keyCode == 8 || e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 32)
                {
                    self.is_playing = !self.is_playing;
                    
                    var sounds = self.points_layer.getChildren();
                    for (var i=0; i<sounds.length; i++)
                    {
                        var sound = sounds[i];
                        var player = sound.getAttrs().player;
                        
                        (self.is_playing) ? player.play() : player.pause();
                    }
                }
		    });
		};
		
		this.playhead = function()
		{
		    var self = this;
			//trying to fill with stripey image
			self.stripes = new Image();
			self.stripes.src = MEDIA_URL +"images/stripes_5.png";
		
		    
		    var playhead = new Kinetic.Circle({
                x               : self.width / 2,
                y               : self.height / 2,
                alpha           : 0.8,		        
                radius          : 0,
               	//fill            : "#f6f9f9",
				fill			: {image: self.stripes, offset: [0, 0]},
                stroke          : "#efefef",
                strokeWidth     : .25,
		    });
		    
            self.playhead_layer.add(playhead);
		    self.stage.add(self.playhead_layer);            
		    
		};
		
		this.addConnectionToLayer = function(connection)
		{	
		    var self = this;
            
		    var p1 = self.points_2D[connection.index_1];
		    var p2 = self.points_2D[connection.index_2];
		    		    		    
            var line = new Kinetic.Line({
                points          : [p1.x, p1.y, p2.x, p2.y],
                stroke          : "#005fff",
                strokeWidth     : 0.25,
                lineCap         : "round",
                lineJoin        : "round",
            });
            self.connections_layer.add(line);	
		};
		
		this.setupStageDragging = function()
		{
		    var self = this;
		    
		    var rotationCanvas = new Kinetic.Rect({
		        x       : 0,
		        y       : 0,
		        width   : self.width,
		        height  : self.height,
		        fill    : "transparent",
                draggable: true,
                dragBounds: { top: 0, right: 0, bottom: 0, left: 0 }
		    });
            rotationCanvas.on("mousedown", function() 
            {
                // reset the interface last click variable 
                self.lastClick = -1;
                
                lib.log('resetting last click');
                
                // reset the style of all sounds
                self.styleAllInactiveSoundShapes('black');

				//hide all sound text
				$(".soundText").fadeOut(200);
            });
		    
		    
		    self.rotation_layer.add(rotationCanvas);
		    self.stage.add(self.rotation_layer);		    
		}
				
        this.Point3D = function() 
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.id;
            this.title;
            this.created_by;
            this.location;
            this.story;
            this.filename;
            this.volume;
            this.is_recent;
        }
        
        this.Connection3D = function()
        {
            this.sound_1 = 0;
            this.sound_2 = 0;
            this.index_1 = 0;
            this.index_2 = 0;
        }

        this.Sphere3D = function(radius) 
        {
            var self = this;
            
            this.point       = new Array();
            this.connections = new Array();
            this.radius      = (typeof(radius) == "undefined") ? 10.0 : radius;
            this.radius      = (typeof(radius) != "number") ? 10.0 : radius;
        }

        
        this.sphereRefresh = function()
        {
            var self = this;
            
            // empty points array
            self.points_2D = [];
                          
            // repopulate points array after projecting the points onto 2d
            for(var i = 0; i < self.sphere.point.length; i++) 
            {
                var point = self.sphere.point[i];
                self.addSpherePointToPoints2D(point, i);
            }
        }
        
        this.addSpherePointToPoints2D = function(sphere_point, index)
        {
            var self = this;
            
            var coordinates = self.project3dPoint(sphere_point);
            
            self.points_2D.push({
                x            : coordinates.x_2d,       // 2d x 
                y            : coordinates.y_2d,       // 2d y
                point_3d     : coordinates.point_3d,   // Point3D object
                index        : index,                  // point index
                id           : sphere_point.id,
                sphere_point : sphere_point
            });            
        };
        
        this.project3dPoint = function(point)
        {
            var self = this;
            var rotation = self.rotation;
            
            var p = new self.Point3D();
            
            p.x = point.x;
            p.y = point.y;
            p.z = point.z;
                            
            self.rotateX(p, rotation.x);
            self.rotateY(p, rotation.y);
            self.rotateZ(p, rotation.z);

            var x = self.projection(p.x, p.z, self.width/2.0, 100.0, self.distance);
            var y = self.projection(p.y, p.z, self.height/2.0, 100.0, self.distance);            
            
            return {x_2d: x, y_2d: y, point_3d: p};
            
        }

        this.rotateX = function(point, radians) {
            var y = point.y;
            point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians));
            
            return point;
        }

        this.rotateY = function(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians));
            
            return point;            
        }

        this.rotateZ = function(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0);
            point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians));
            
            return point;            
        }

        this.projection = function(xy, z, xyOffset, zOffset, distance) {
            return ((distance * xy) / (z - zOffset)) + xyOffset;
        }
        
        this.reverse_projection = function(xy_2d, z_3d, xyOffset, zOffset, distance)
        {
            return ((xy_2d * z_3d) - (xy_2d * zOffset) - (xyOffset * z_3d) + (xyOffset * zOffset)) / distance;
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
        
        this.dist = function(x1,y1,x2,y2)
        {
            return Math.round(Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) ));
        }
	};
})(jQuery);	