;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
        var sphere = new Sphere3D();
        var rotation = 20;
        var distance = 2000;
        var points_2D = [];

        this.init = function()
        {
            // Set framerate to 30 fps
            // setInterval(render, 1000/30);
            render();
            this.interaction();
            
        };
        
        
        this.interaction = function() 
        {
            $("#interface").click(function(e)
            {
                var x = Math.floor((e.pageX-$(this).offset().left));
                var y = Math.floor((e.pageY-$(this).offset().top));
                lib.log([x,y]);
                lib.log(points_2D);
                lib.log(sphere.point);
                
                for(i=0; i<points_2D.length; i++)
                {
                    if (points_2D[i][0] >= x-sphere.point_size && points_2D[i][0] <= x+sphere.point_size && points_2D[i][1] >= y-sphere.point_size && points_2D[i][1] <= y+sphere.point_size)
                    {
                        lib.log(points_2D[i][0]);
                        lib.log(points_2D[i][1]);

                        var canvas = document.getElementById("interface");
                        var ctx = canvas.getContext('2d');
                        drawPoint(ctx, points_2D[i][0], points_2D[i][1], sphere.point_size, "rgba(100,120,150,1.0)");

                        lib.log("yay");
                    }
                }
                
            });
        };
        
        function Point3D() {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        
        function Sphere3D(radius) {
            this.point = new Array();
            this.color = "rgb(0,0,0)";
            this.point_size = 4;
            this.radius = (typeof(radius) == "undefined") ? 20.0 : radius;
            this.radius = (typeof(radius) != "number") ? 20.0 : radius;
            this.numberOfVertexes = 0;

            // Ciclo da 0ø a 360ø con passo di 10ø...calcola la circonf. di mezzo
            for(alpha = 0; alpha <= 6.28; alpha += 0.05) {
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

        function render() {
            var canvas = document.getElementById("interface");
            var width = canvas.getAttribute("width");
            var height = canvas.getAttribute("height");
            var ctx = canvas.getContext('2d');
            var x, y;

            var p = new Point3D();
            
            ctx.save();
            ctx.clearRect(0, 0, width, height);

            ctx.globalCompositeOperation = "lighter";
            
            for(i = 0; i < sphere.numberOfVertexes; i++) {
                
                p.x = sphere.point[i].x;
                p.y = sphere.point[i].y;
                p.z = sphere.point[i].z;

                rotateX(p, rotation);
                rotateY(p, rotation);
                rotateZ(p, rotation);

                x = projection(p.x, p.z, width/2.0, 100.0, distance);
                y = projection(p.y, p.z, height/2.0, 100.0, distance);

                drawPoint(ctx, x, y, sphere.point_size, "rgba(0,0,0,1.0)");
            }
            ctx.restore();
            ctx.fillStyle = "rgb(255,255,255)";
            // rotation += Math.PI/90.0;

            // if(distance < 1000) {
            //     distance += 10;
            // }
        }
        
        function drawPoint(ctx, x, y, size, color) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.arc(x, y, size, 0, 2*Math.PI, true);
            ctx.fill();
            ctx.restore();
            
            points_2D.push([x,y]);
            
            
            //          $("canvas").drawArc({
            //  layer       : true,
            //  group       : "sounds",
            //  name        : "sound_x",
            //  fromCenter  : true,
            //  ccw         : true,
            //  fillStyle   : '#fff000',
            //                 x           : x,
            //                 y           : y,
            //  radius      : size,
            //  active      : false,
            //              mouseover   : function(layer)
            //  {                   
            //      $(this).css({cursor:'pointer'});
            // 
            //      if (!layer.active) {
            //          layer.fillStyle = '#000';                       
            //      }                   
            //  },
            //  mouseout    : function(layer)
            //  {
            //      $(this).css({cursor:'default'});
            // 
            //      if (!layer.active) {
            //          layer.fillStyle = '#fff000';
            //      }
            //  },              
            // });    
            //             ctx.fill();
            //             ctx.restore();   		        
            
        }

	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		