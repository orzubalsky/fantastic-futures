;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
	    var width       = 900;
	    var height      = 600;
	    var lastClick   = '';
        var sphere      = new Sphere3D();
        var rotation    = 30 * Math.PI / 180.0;
        var distance    = 2000;
        var points_2D   = [];
        var connections_2D = [];
        var connections_3D = [];
        var stage       = new Kinetic.Stage({
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
            for(var i=0; i<points_2D.length; i++)
            {
                var point = points_2D[i];
                addPointToLayer(point);   
            }            
            stage.add(points_layer);
        }
        
        function update()
        {               
            // stage drag rotation calculation
            if (stage.isDragging()) {
                 var mousePos = stage.getMousePosition();
                 
                 var s = 50;
                 var x = ((mousePos.x * 2*s) - width*s) / width;
                 var radians = x * (Math.PI/180.0);
                 
                 rotation = radians
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
                        connections_3D.push({ point_1: lastClick, point_2: this.attrs.point_3d });
                        
                        var p1 = new Point3D();
                        var p2 = new Point3D();

                        // empty connections array
                        connections_2D = [];

                        // repopulate connections array after projecting the points onto 2d
                        for(var i = 0; i < connections_3D.length; i++) 
                        {
                            p1.x = connections_3D[i].point_1.x;
                            p1.y = connections_3D[i].point_1.y;
                            p1.z = connections_3D[i].point_1.z;

                            rotateX(p1, rotation);
                            rotateY(p1, rotation);
                            rotateZ(p1, rotation);

                            x1 = projection(p1.x, p1.z, width/2.0, 100.0, distance);
                            y1 = projection(p1.y, p1.z, height/2.0, 100.0, distance);
                            
                            p2.x = connections_3D[i].point_2.x;
                            p2.y = connections_3D[i].point_2.y;
                            p2.z = connections_3D[i].point_2.z;

                            rotateX(p2, rotation);
                            rotateY(p2, rotation);
                            rotateZ(p2, rotation);

                            x2 = projection(p2.x, p2.z, width/2.0, 100.0, distance);
                            y2 = projection(p2.y, p2.z, height/2.0, 100.0, distance);

                            connections_2D.push({ point_1: [x1,y1], point_2: [x2,y2] });
                        }                        
                        
                        for(var i=0; i<connections_2D.length; i++)
                        {
                            var connection = connections_2D[i];

                            var line = new Kinetic.Line({
                                points          : [connection.point_1[0], connection.point_1[1], connection.point_2[0], connection.point_2[1]],
                                stroke          : "red",
                                strokeWidth     : 0.5,
                                lineCap         : "round",
                                lineJoin        : "round",
                            });

                            connections_layer.add(line);
                        }            
                        
                        stage.add(connections_layer);
                    }
                    lastClick = this.attrs.point_3d;
                }
                else 
                {
                    this.setFill('#000');
                }
            });            
            points_layer.add(circle);		
		};
		
		
		function addConnectionToLayer(point_1, point_2)
		{		    
            var line = new Kinetic.Line({
                points          : [point_1[0], point_1[1], point_2[0], point_2[1]],
                stroke          : "red",
                strokeWidth     : 0.5,
                lineCap         : "round",
                lineJoin        : "round",
            });
             
            connections_layer.add(line);		
		};
				
        
		function addConnection(array_1, array_2)
		{		    
			connections.push(
			{
				point_3d_1  : array_1[1],
				point_3d_2  : array_2[1]
			});
						
			connections_2d.push({
				point_1     : array_1[0],
				point_2     : array_2[0],
			});
			
			addConnectionToLayer(array_1[0], array_2[0]);
		};
  
        function Point3D() 
        {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

        function Sphere3D(radius) 
        {
            this.point = new Array();
            this.radius = (typeof(radius) == "undefined") ? 10.0 : radius;
            this.radius = (typeof(radius) != "number") ? 10.0 : radius;
            this.numberOfVertexes = 0;

            // Ciclo da 0ø a 360ø con passo di 10ø...calcola la circonf. di mezzo
            for(alpha = 0; alpha <= 6.28; alpha += 0.45) {
                p = this.point[this.numberOfVertexes] = new Point3D();

                p.x = Math.cos(alpha) * this.radius;
                p.y = 0;
                p.z = Math.sin(alpha) * this.radius;

                this.numberOfVertexes++;
            }

            // Ciclo da 0ø a 90ø con passo di 10ø...calcola la prima semisfera (direction = 1)
            // Ciclo da 0ø a 90ø con passo di 10ø...calcola la seconda semisfera (direction = -1)
            for(var direction = 1; direction >= -1; direction -= 2) {
                for(var beta = 0.17; beta < 1.445; beta += 0.45) {
                    var radius = Math.cos(beta) * this.radius;
                    var fixedY = Math.sin(beta) * this.radius * direction;

                    for(var alpha = 0; alpha < 6.28; alpha += 0.17) {
                        p = this.point[this.numberOfVertexes] = new Point3D();

                        p.x = Math.cos(alpha) * radius;
                        p.y = fixedY;
                        p.z = Math.sin(alpha) * radius;

                        this.numberOfVertexes++;
                    }
                }
            }
        }


        function sphereRefresh()
        {
            var p = new Point3D();
            var p2= new Point3D();
         
            // empty points array
            points_2D = [];
                          
            // repopulate points array after projecting the points onto 2d
            for(var i = 0; i < sphere.numberOfVertexes; i++) 
            {
                p.x = sphere.point[i].x;
                p.y = sphere.point[i].y;
                p.z = sphere.point[i].z;
                                
                rotateX(p, rotation);
                rotateY(p, rotation);
                rotateZ(p, rotation);

                x = projection(p.x, p.z, width/2.0, 100.0, distance);
                y = projection(p.y, p.z, height/2.0, 100.0, distance);

                points_2D.push([x,y, {x: p.x, y: p.y, z: p.z }]);
            }
        }

        function rotateX(point, radians) {
            var y = point.y;
            point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians));
        }

        function rotateY(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
            point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians));
        }

        function rotateZ(point, radians) {
            var x = point.x;
            point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0);
            point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians));
        }

        function projection(xy, z, xyOffset, zOffset, distance) {
            return ((distance * xy) / (z - zOffset)) + xyOffset;
        }
	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		