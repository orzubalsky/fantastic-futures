;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
	    var width           = $('#interface').width();
	    var height          = $('#interface').height();
	    var lastClick       = -1;
        var sphere          = new Sphere3D();
        var rotation        = { x: deg_to_rad(0), y: deg_to_rad(0), z: deg_to_rad(0) };
        var distance        = 2000;
        var map_points      = [];
        var points_2D       = [];
        var connections_2D  = [];
        var stage           = new Kinetic.Stage({
            container: "interface",
            width: width,
            height: height,                     
        });
        var rotation_layer      = new Kinetic.Layer();
        var points_layer        = new Kinetic.Layer();        
        var connections_layer   = new Kinetic.Layer();

        /* set up the interface and run it */
        this.init = function()
        {           
            setup();            

            // Set framerate to 30 fps
            var framerate = 1000/30;
            
            // run update-draw loop
            setInterval(function() { update(); draw(); }, framerate);
        };
        
        this.setPoints = function(points)
        {
            map_points = points;
        };
        
        this.resetRotation = function()
        {
            var self = this;
            
            var rotation_interval = setInterval(function() 
            {
                self.rotateTo(0,0,0);
                
                if ( rotation.x == 0 && rotation.y == 0 && rotation.z == 0)
                {
                    clearInterval(rotation_interval);
                    $('#interface').fadeOut(2000);
                    $('#map').fadeIn(500);
                }
            }, 1000/30);            
        };
        
        this.rotateTo = function(x,y,z)
        {
            
            rotation.x = (rotation.x > x) ? rotation.x - rotation.x/30 : x;
            rotation.y = (rotation.y > y) ? rotation.y - rotation.y/30 : y;
            rotation.z = (rotation.z > z) ? rotation.z - rotation.z/30 : z;
            
            /*
            rotation.x = (rotation.x > x) ? rotation.x - deg_to_rad(3) : x;
            rotation.y = (rotation.y > y) ? rotation.y - deg_to_rad(3) : y;
            rotation.z = (rotation.z > z) ? rotation.z - deg_to_rad(3) : z;   */         
        };
        
        function setup()
        {   
            setupStageDragging();
            for(var i=0; i<map_points.length; i++)
            {
                p = new Point3D();
                p.z = lib.random(14,-7);
                p.x = reverse_projection(map_points[i].x, p.z, width/2.0, 100.0, distance)
                p.y = reverse_projection(map_points[i].y, p.z, height/2.0, 100.0, distance)
                sphere.point.push( p );             
            }            
            sphereRefresh();
            initPoints();
        }
        
        function initPoints()
        {

            for(var i=0; i<points_2D.length; i++) {
                addPointToLayer(points_2D[i]);   
            }            
            stage.add(points_layer);
            
            for (var i=0; i<sphere.connections.length; i++)
            {                
                addConnectionToLayer(sphere.connections[i]);
            }
            stage.add(connections_layer);
        }
        
        function update()
        {               
            // stage drag rotation calculation
            var rotation_canvas = rotation_layer.getChildren()[0];
            if (rotation_canvas.isDragging()) {
                 var mousePos = stage.getMousePosition();
                 
                 var s = 10;
                 var x = ((mousePos.x * 2*s) - width*s) / width;
                 var y = ((mousePos.y * 2*s) - height*s) / height;
                 rotation.y -= deg_to_rad(x);
                 rotation.y = (rotation.y >= deg_to_rad(360)) ? deg_to_rad(0) : rotation.y;
                 rotation.x += deg_to_rad(y); 
                 rotation.x = (rotation.x >= deg_to_rad(360)) ? deg_to_rad(0) : rotation.x;
                 
            }
            
            // sound drag volume calculation
            for (var i=0; i<points_layer.getChildren().length; i++)
            {
                var group = points_layer.getChildren()[i];
                
                if (group.isDragging()) 
                {                     
                    var group_y = group.getY();                     
                    var value = stage.getMousePosition().y;
                    var volume = map(value, group_y+40, group_y-40, 0.2, 0.9, true);
                    var radius = map(value, group_y+40, group_y-40, 5, 20, true);                    
                    var halo = group.getChildren()[0];
                    halo.setRadius(radius);
                }                
            }
            
            // rebuild projected 2d point array
            sphereRefresh();
        }
        
        function draw()
        {
            points_layer.clear();
            connections_layer.clear();
                                           
            for(var i=0; i<points_layer.getChildren().length; i++)
            {
                var point = points_2D[i];
                var sound = points_layer.getChildren()[i];
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
            
            for(var i=0; i<connections_layer.getChildren().length; i++)
            {
                var connection = sphere.connections[i];
                var child = connections_layer.getChildren()[i];

                var p1 = points_2D[connection.index_1];
                var p2 = points_2D[connection.index_2];
    
                child.setPoints([ {x: p1.x, y: p1.y}, {x: p2.x, y: p2.y} ]);
            }            
            
            rotation_layer.draw();
            points_layer.draw();
            connections_layer.draw();
        }
        
        
		function addPointToLayer(point)
		{		    
		    // Kinetic group to store coordinates and meta data about the sound
		    var sound = new Kinetic.Group({
                x           : point.x,
                y           : point.y,
                alpha       : 0.4,
                point_3d    : point.point_3d,
                index       : point.index,
                active      : false,
                draggable   : true,
                dragBounds: { top: 0, right: 0, bottom: 0, left: 0 },
                start_x     : 0,
                start_y     : 0
		    });	
            sound.on("mouseover", function() {
                $('#container').css({'cursor':'pointer'});
                if (!this.active)
                {
                    this.getChildren()[1].setFill('#000');                    
                }
            });            
            sound.on("mouseout", function() {
                $('#container').css({'cursor':'default'});
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

                    if (lastClick != -1) 
                    {
                        c = new Connection3D();
                        c.index_1 = lastClick;
                        c.index_2 = this.getAttrs().index;
                        sphere.connections.push(c);                        
                        addConnectionToLayer(c);  
                    }

                    lastClick = this.getAttrs().index;
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
            points_layer.add(sound);	
		};
		
		function addConnectionToLayer(connection)
		{	
		    var p1 = points_2D[connection.index_1];
		    var p2 = points_2D[connection.index_2];
		    		    		    
            var line = new Kinetic.Line({
                points          : [p1.x, p1.y, p2.x, p2.y],
                stroke          : "#005fff",
                strokeWidth     : 0.25,
                lineCap         : "round",
                lineJoin        : "round",
            });
            connections_layer.add(line);	
		};
		
		function setupStageDragging()
		{
		    var rotationCanvas = new Kinetic.Rect({
		        x       : 0,
		        y       : 0,
		        width   : width,
		        height  : height,
		        fill    : "transparent",
                draggable: true,
                dragBounds: { top: 0, right: 0, bottom: 0, left: 0 }
		    });
		    rotation_layer.add(rotationCanvas);
		    stage.add(rotation_layer);		    
		}
				
        function Point3D() 
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        
        function Connection3D()
        {
            this.index_1 = 0;
            this.index_2 = 0;
        }

        function Sphere3D(radius) 
        {
            this.point       = new Array();
            this.connections = new Array();
            this.radius      = (typeof(radius) == "undefined") ? 10.0 : radius;
            this.radius      = (typeof(radius) != "number") ? 10.0 : radius;

/*
            p1 = new Point3D();
            p1.x = 0;
            p1.y = 0;
            p1.z = 0;
            this.point.push(p1);
       
            p2 = new Point3D();            
            p2.x = 100;
            p2.y = 0;
            p2.z = 0;
            this.point.push(p2);
          
            p3 = new Point3D();            
            p3.x = 100;
            p3.y = 100;
            p3.z = 0;
            this.point.push(p3);
                     
            p4 = new Point3D();                        
            p4.x = 0;
            p4.y = 100;
            p4.z = 0;
            this.point.push(p4);            

         
            for(alpha = 0; alpha <= deg_to_rad(360); alpha += deg_to_rad(30)) {
                p = new Point3D();

                p.x = Math.cos(alpha) * this.radius;
                p.y = 0;
                p.z = Math.sin(alpha) * this.radius;
                
                this.point.push(p);
            }
         
            for(var direction = 1; direction >= -1; direction -= 2) {
                for(var beta = deg_to_rad(10); beta < deg_to_rad(90); beta += deg_to_rad(30)) {
                    var radius = Math.cos(beta) * this.radius;
                    var fixedY = Math.sin(beta) * this.radius * direction;

                    for(var alpha = 0; alpha < deg_to_rad(360); alpha += deg_to_rad(30)) {
                        p = new Point3D();

                        p.x = Math.cos(alpha) * radius;
                        p.y = fixedY;
                        p.z = Math.sin(alpha) * radius;

                        this.point.push(p);
                    }
                }
            }
            */
        }

        
        function sphereRefresh()
        {
            // empty points array
            points_2D = [];
                          
            // repopulate points array after projecting the points onto 2d
            for(var i = 0; i < sphere.point.length; i++) 
            {
                var coordinates = project3dPoint(sphere.point[i]);

                points_2D.push({
                    x       : coordinates.x_2d,       // 2d x 
                    y       : coordinates.y_2d,       // 2d y
                    point_3d: coordinates.point_3d,   // Point3D object
                    index   : i                       // point index
                });
            }
        }
        
        function project3dPoint(point)
        {
            var p = new Point3D();
            
            p.x = point.x;
            p.y = point.y;
            p.z = point.z;
                            
            rotateX(p, rotation.x);
            rotateY(p, rotation.y);
            rotateZ(p, rotation.z);

            var x = projection(p.x, p.z, width/2.0, 100.0, distance);
            var y = projection(p.y, p.z, height/2.0, 100.0, distance);            
            
            return {x_2d: x, y_2d: y, point_3d: p};
            
        }

        function rotateX(point, radians) {
            var y = point.y;
            point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians));
            
            return point;
        }

        function rotateY(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians));
            
            return point;            
        }

        function rotateZ(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0);
            point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians));
            
            return point;            
        }

        function projection(xy, z, xyOffset, zOffset, distance) {
            return ((distance * xy) / (z - zOffset)) + xyOffset;
        }
        
        function reverse_projection(xy_2d, z_3d, xyOffset, zOffset, distance)
        {
            return ((xy_2d * z_3d) - (xy_2d * zOffset) - (xyOffset * z_3d) + (xyOffset * zOffset)) / distance;
        }
        
        function deg_to_rad(degrees)
        {
            return degrees * Math.PI / 180.0;
        }
        
        function map(value, istart, istop, ostart, ostop, confine) 
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