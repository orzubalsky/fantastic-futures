;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
        this.fov = 100;
        this.SCREEN_WIDTH = 600; 
        this.SCREEN_HEIGHT = 300; 
        this.HALF_WIDTH = this.SCREEN_WIDTH/2; 
        this.HALF_HEIGHT = this.SCREEN_HEIGHT/2; 
        this.numPoints = 100; 
        this.mouseX = 0; 
        this.mouseY = -200;
        this.canvas;
        this.c;
        this.points = [];
        this.loop;

	    this.init = function()
	    {
	        var self = this;
	        
            self.canvas = document.getElementById('interface');
            self.c = self.canvas.getContext('2d');

            self.initPoints();
            self.loop = setInterval(function(){ self.render(); }, 50);            

            // document.onmousemove = self.updateMouse;            	        
	    };


        this.draw3Din2D = function(point3d)
        {  
            var self = this;
            var c = self.c;
            
        	var x3d     = point3d[0];
        	var y3d     = point3d[1]; 
        	var z3d     = point3d[2]; 
        	var scale   = self.fov / ( self.fov + z3d ); 
        	var x2d     = (x3d * scale) + self.HALF_WIDTH;	
        	var y2d     = (y3d * scale)  + self.HALF_HEIGHT;

        	c.lineWidth = scale; 
        	c.strokeStyle = "rgb(255,255,255)"; 	
        	c.beginPath();
        	c.moveTo(x2d, y2d); 
        	c.lineTo(x2d + scale, y2d); 
        	c.stroke(); 
        };


        this.initPoints = function()
        {
            var self = this;
            
        	for (i=0; i<self.numPoints; i++)
        	{
        		var point = [(Math.random()*400)-200, (Math.random()*400)-200 , (Math.random()*400)-200 ];
        		self.points.push(point); 
        	}

        };

        this.render = function() 
        {
            var self = this;
            var c = self.c;
            var fov = self.fov;

        	c.fillStyle="rgb(0,0,0)";
          	c.fillRect(0,0, self.SCREEN_WIDTH, self.SCREEN_HEIGHT);

        	for (i=0; i<self.numPoints; i++)
        	{
        		var point3d = self.points[i]; 
        		self.rotatePointAroundY(point3d, self.mouseX*-0.0003); 
        		point3d[2] += (self.mouseY*0.08); 	


        		if(point3d[0]<-300) point3d[0] = 300; 
        		else if(point3d[0]>300) point3d[0] = -300; 
        		if(point3d[2]<-fov) point3d[2] = fov; 
        		else if(point3d[2]>249) point3d[2] = -249;

        		self.draw3Din2D(point3d); 
        	}
        };

        this.rotatePointAroundY = function(point3d, angle)
        {
            var self = this;
            
        	var x = point3d[0]; 
        	var z = point3d[2] + self.fov; 

        	var cosRY = Math.cos(angle);
        	var sinRY = Math.sin(angle);
        	var tempz = z; 
        	var tempx = x; 


        	x = (tempx*cosRY)+(tempz*sinRY);
        	z = (tempx*-sinRY)+(tempz*cosRY);
        	point3d[0] = x; 
        	point3d[2] = z - self.fov; 
        };

        this.updateMouse = function(e) 
        {
            var self = this;
            
        	lib.log(self.canvas); 
        	
        	self.mouseX = e.pageX - self.canvas.offsetLeft - self.HALF_WIDTH;
        	self.mouseY = e.pageY - self.canvas.offsetTop - self.HALF_HEIGHT;
        };
	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		