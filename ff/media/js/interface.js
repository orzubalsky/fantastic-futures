;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{
	    this.running = false;
	    this.frameRate;
	    this.width;
	    this.height;
	    this.lastClick       = -1;
        this.sphere;
        this.rotation;
        this.rotation_interval;
        this.distance        = 2000;
        this.map_points      = [];
        this.points_2D       = [];
        this.connections_2D  = [];
        this.constellation;
        this.map_points_count;
        this.sphere_point_count;
        this.stage;
        this.rotation_layer;
        this.points_layer;       
        this.connections_layer;
		this.addButton = 0;

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
            
            self.rotateTo(0,0,0, function() 
            {
                $('#interface').fadeOut(2000);
                $('#map').css('opacity','1');
                $('#map').fadeIn(500);                
            });
        };
        
        this.rotateTo = function(x,y,z, callback)
        {   
            var self = this;
            
            clearInterval(self.rotation_interval)
            
            self.rotation_interval = setInterval(function() 
            {   
                self.rotation.x = self.rotateAxis(self.rotation.x, x, 25);
                self.rotation.y = self.rotateAxis(self.rotation.y, y, 25);
                self.rotation.z = self.rotateAxis(self.rotation.z, z, 25);
                
                if ( self.rotation.x == x && self.rotation.y == y && self.rotation.z == z)
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
        
        this.setup = function()
        {   
            var self = this;
            
            self.setupStageDragging();
            
            for(var i=0; i<self.map_points.length; i++)
            {
                self.mapPointToSpherePoint(self.map_points[i]);
            }
            self.map_points_count = self.map_points.length;        
            
            self.sphereRefresh();
            
            self.initPoints();
                                    
            $("#loadingGif").fadeToggle("fast", "linear");
        }
        
        this.mapPointToSpherePoint = function(map_point)
        {
            var self = this;
            
            p = new self.Point3D();
            
            p.z = lib.random(14,-7);
            p.x = self.reverse_projection(map_point.x, p.z, self.width/2.0, 100.0, self.distance)
            p.y = self.reverse_projection(map_point.y, p.z, self.height/2.0, 100.0, self.distance)
            p.id= map_point.id
            
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
                        self.rotateTo(constellation.rotation_x, constellation.rotation_y, constellation.rotation_z, function() {});
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
                 var mousePos = self.stage.getMousePosition();
                 
                 var s = 10;
                 var x = ((mousePos.x * 2*s) - self.width*s) / self.width;
                 var y = ((mousePos.y * 2*s) - self.height*s) / self.height;

                 rotation.y += self.deg_to_rad(x);
                 rotation.y = (rotation.y >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : rotation.y;

                 rotation.x += self.deg_to_rad(y); 
                 rotation.x = (rotation.x >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : rotation.x;
            }
            
            // sound drag volume calculation
            for (var i=0; i<self.points_layer.getChildren().length; i++)
            {
                var group = self.points_layer.getChildren()[i];
                
                if (group.isDragging()) 
                {                     
                    var group_y = group.getY();
                    if (group_y > 0)
                    {
                        lib.log(group);
                        lib.log(group_y);
                        var halo = group.getChildren()[0];
                    
                        var value = self.stage.getMousePosition().y;
                        var volume = self.map(value, group_y+40, group_y-40, 0.2, 0.9, true);
                        var radius = self.map(value, group_y+40, group_y-40, 5, 20, true);
                        lib.log("yPos: " + group_y + " low: " + (group_y+40) + " high: " + (group_y-40) + " value: " + value + " radius: " + radius);
                        halo.setRadius(radius);
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
            
            // rebuild projected 2d point array
            self.sphereRefresh();
        }
        
        this.draw = function()
        {
            var self = this;
            
            self.points_layer.clear();
            self.connections_layer.clear();
                                           
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
            
            self.rotation_layer.draw();
            self.points_layer.draw();
            self.connections_layer.draw();
        }
        
        
		this.addPointToLayer = function(point)
		{	
		    var self = this;
		    	    
		    // Kinetic group to store coordinates and meta data about the sound
		    var sound = new Kinetic.Group({
                x           : point.x,
                y           : point.y,
                alpha       : 0.4,
                point_3d    : point.point_3d,
                index       : point.index,
                id          : point.id,
                active      : false,
                draggable   : true,
                dragBounds: { top: 0, right: 0, bottom: 0, left: 0 },
                start_x     : 0,
                start_y     : 0, 
				name		: 'Or Zublinsky',
				location	: 'Toledo, OH'
		    });	
		    		     
            sound.on("mouseover", function() {
                $('#container').css({'cursor':'pointer'});
				$('.soundText').html(this.getAttrs().name+'<br/>'+this.getAttrs().location);
				$('.soundText').fadeToggle("fast", "linear");
				$('.soundText').css({'top':this.getAttrs().y-110+'px'});
				$('.soundText').css({'left':this.getAttrs().x-27+'px'});
                if (!this.active)
                {
                    this.getChildren()[1].setFill('#000');                    
                }
            });            
            sound.on("mouseout", function() {
                $('#container').css({'cursor':'default'});
				$('.soundText').fadeToggle("fast", "linear");
                if (!this.active)
                {
                    this.getChildren()[1].setFill('#000');                    
                }
            });   
            sound.on("mousedown", function() {
                this.active = !this.active;
                if (this.active) 
                {
                    this.getChildren()[1].setFill('#005fff');

                    if (self.lastClick != -1) 
                    {
                        c = new self.Connection3D();
                        c.sound_1 = self.lastClick.id;
                        c.sound_2 = this.getAttrs().id;
                        c.index_1 = self.lastClick.index;
                        c.index_2 = this.getAttrs().index;
                        self.sphere.connections.push(c);  
                        self.addConnectionToLayer(c);
						if (self.addButton==0){
							$('#addConstellationText').fadeToggle("fast", "linear");
							self.addButton=1;
						}
                    }

                    self.lastClick = {id: this.getAttrs().id, index: this.getAttrs().index}
                }
                else 
                {
                    this.getChildren()[1].setFill('#000');
                }
            });		    
		
		    // volume halo ellipse
		    var halo = new Kinetic.Circle({
                radius        : 8,
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
            
            sound.add(halo);
            sound.add(core);
            self.points_layer.add(sound);	
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
		    self.rotation_layer.add(rotationCanvas);
		    self.stage.add(self.rotation_layer);		    
		}
				
        this.Point3D = function() 
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
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
                x       : coordinates.x_2d,       // 2d x 
                y       : coordinates.y_2d,       // 2d y
                point_3d: coordinates.point_3d,   // Point3D object
                index   : index,                  // point index
                id      : sphere_point.id
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
	};
})(jQuery);	