;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
	    var width           = 900;
	    var height          = 600;
	    var lastClick       = '';
        var sphere          = new Sphere3D();
        var rotation        = { x: deg_to_rad(0), y: deg_to_rad(0), z: deg_to_rad(0) };
        var distance        = 100;
        var points_2D       = [];
        var connections_2D  = [];
        var stage           = new Kinetic.Stage({
            container: "container",
            width: width,
            height: height,
            draggable: true,
            dragBounds: { top: 0, right: 0, bottom: 0, left: 0 }                        
        });               
        var points_layer        = new Kinetic.Layer();        
        var connections_layer   = new Kinetic.Layer();

        this.init = function()
        {   
            setup();            

            // Set framerate to 30 fps
            var framerate = 1000/30;
            setInterval(function() { update(); draw(); }, framerate);
        };
        
        
        function setup()
        {            
            sphereRefresh();
            initPoints();
            stage.add(connections_layer);
        }
        
        function initPoints()
        {
            for(var i=0; i<points_2D.length; i++) {
                addPointToLayer(points_2D[i]);   
            }            
            stage.add(points_layer);
            
            for(var i=0; i<connections_2D.length; i++) {
                addConnectionToLayer(connections_2D[i]);
            }
            stage.add(connections_layer);
        }
        
        function update()
        {               
            // stage drag rotation calculation
            if (stage.isDragging()) {
                 var mousePos = stage.getMousePosition();
                 
                 var s = 180;
                 var x = ((mousePos.x * 2*s) - width*s) / width;
                 var y = ((mousePos.y * 2*s) - height*s) / height;
                 rotation.y = deg_to_rad(x);
                 rotation.x = deg_to_rad(y);
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
                var child = points_layer.getChildren()[i];
                
                child.setX(point[0]);
                child.setY(point[1]);
                
                var attrs = child.getAttrs();
                attrs.point_3d.x = point[2].x;
                attrs.point_3d.y = point[2].y;
                attrs.point_3d.z = point[2].z;

                child.setAttrs(attrs);
            }                        
            
            // for(var i=0; i<connections_layer.getChildren().length; i++)
            // {
            //     var connection = connections_2D[i];
            //     var child = connections_layer.getChildren()[i];
            //     child.setPoints([ {x: connection.point_1.x, y: connection.point_1.y}, {x: connection.point_2.x, y: connection.point_2.y} ]);
            // }            
            // 
            
            for (var i=0; i<sphere.connections.length; i++)
            {
                addConnectionToLayer(sphere.connections[i]);
            }
            points_layer.draw();
            connections_layer.draw();
        }
        
        
		function addPointToLayer(point)
		{		    
            var circle = new Kinetic.Circle({
              x             : point[0],
              y             : point[1],
              radius        : 4,
              fill          : "black",
              stroke        : "white",
              strokeWidth   : 0,
              active        : false,
              point_3d      : point[2]
            });
            circle.on("mouseout", function() {
                $('#container').css({'cursor':'default'});
                if (!this.active)
                {
                    this.setFill('#000');                    
                }
            });
            circle.on("mousemove", function() {
                $('#container').css({'cursor':'pointer'});
				if (!this.active) {
                    this.setFill('#fff000');
				}                
            });       
            circle.on("mousedown", function() {
                this.active = !this.active;
                if (this.active) 
                {
                    this.setFill('#ff0000');
                    
                    if (lastClick != '') 
                    {
                        c = new Connection3D();
                        c.point_1 = lastClick;
                        c.point_2 = this.getAttrs().point_3d;
                        sphere.connections.push(c);                        
                        
                        // var connection_2D = project3dConnection(sphere.connections.slice(-1)[0]);                                          
                        // connections_2D.push(connection_2D);
                        // addConnectionToLayer(connection_2D);
                        
                    }
                                            
                    lastClick = this.getAttrs().point_3d;
                }
                else 
                {
                    this.setFill('#000');
                }
            });            
            points_layer.add(circle);		
		};
		
		function addConnectionToLayer(connection)
		{		    
            var line = new Kinetic.Line({
                points          : [connection.point_1.x, connection.point_1.y, connection.point_2.x, connection.point_2.y],
                stroke          : "red",
                strokeWidth     : 0.5,
                lineCap         : "round",
                lineJoin        : "round",
            });
            connections_layer.add(line);	
		};
				
        function Point3D() 
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        
        function Connection3D()
        {
            this.point_1 = new Point3D();
            this.point_2 = new Point3D();            
        }

        function Sphere3D(radius) 
        {
            this.point       = new Array();
            this.connections = new Array();
            this.radius      = (typeof(radius) == "undefined") ? 10.0 : radius;
            this.radius      = (typeof(radius) != "number") ? 10.0 : radius;

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

            c = new Connection3D();
            c.point_1 = p1;
            c.point_2 = p3;
            this.connections.push(c);

            /*
            for(alpha = 0; alpha <= deg_to_rad(360); alpha += deg_to_rad(10)) {
                p = this.point[this.numberOfVertexes] = new Point3D();

                p.x = Math.cos(alpha) * this.radius;
                p.y = 0;
                p.z = Math.sin(alpha) * this.radius;

                this.numberOfVertexes++;
            }

            for(var direction = 1; direction >= -1; direction -= 2) {
                for(var beta = deg_to_rad(10); beta < deg_to_rad(90); beta += deg_to_rad(30)) {
                    var radius = Math.cos(beta) * this.radius;
                    var fixedY = Math.sin(beta) * this.radius * direction;

                    for(var alpha = 0; alpha < deg_to_rad(360); alpha += deg_to_rad(10)) {
                        p = this.point[this.numberOfVertexes] = new Point3D();

                        p.x = Math.cos(alpha) * radius;
                        p.y = fixedY;
                        p.z = Math.sin(alpha) * radius;

                        this.numberOfVertexes++;
                    }
                }
            }
            
            for (var i=0; i<1; i++)
            {
                // p_1 = new Point3D();
                // p_1.x = p_1.y = p_1.z = Math.cos(deg_to_rad(10)) * this.radius;
                // 
                // p_2 = new Point3D();
                // p_2.x = p_2.y = p_2.z = 0.4;
                // 
                // this.connections.push({ point_1: p_1, point_2: p_2 });
                // this.numberOfConnections++;
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

                points_2D.push([
                    coordinates.x_2d,
                    coordinates.y_2d,
                    coordinates.point_3d
                ]);
            }
            
            // empty connections array
            connections_2D = [];
            
            // repopulate connections array after projecting points onto 2d
            for(var i = 0; i < sphere.connections.length; i++) 
            {                
                var connection_2D = project3dConnection(sphere.connections[i]);
                connections_2D.push(connection_2D);
            }       
        }

        
        function project3dConnection(connection)
        {
            coordinates_1 = project3dPoint(connection.point_1);
            coordinates_2 = project3dPoint(connection.point_2);

            var connection_2D = {
                 point_1 : {x: coordinates_1.x_2d, y: coordinates_1.y_2d},
                 point_2 : {x: coordinates_2.x_2d, y: coordinates_2.y_2d}
            };
            
            return connection_2D;
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
        
        function deg_to_rad(degrees)
        {
            return degrees * Math.PI / 180.0;
        }
	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		