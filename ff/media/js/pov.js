;(function($){
	var pov = window.site.pov = new function() 
	{
        this.rotation;                      // 3D rotation for the sphere, in radians. {x: 0.0, y: 0.0, z:0.0 }
        this.target_rotation;
        this.is_animating       = false;    // represents the state of rotation & zooming
		this.zoom               = 1.0;
		this.target_zoom        = 1.0;
		this.zoom_max           = 15.0;
		this.zoom_min           = 1.0;
		this.callback = '';

        /* set up the interface and run it */
        this.init = function()
        {
            var self = this;
            
            self.rotation        = { x: 0, y: 0, z: 0 };
            self.target_rotation = { x: 0, y: 0, z: 0 };
        };
        
        
        this.resetRotation = function()
        {
            var self = this;
            var rotation = self.rotation;
            
            self.rotateTo(0,0,0, 1.0, 25, function() 
            {
                $('#interface').fadeOut(2000);
                $('#map').css('opacity','1');
                $('#map').fadeIn(500);                
            });
        };
        
        this.rotateTo = function(x,y,z, zoom, pace, callback)
        {   
            var self = this;

            self.target_rotation = { x: x, y: y, z: z};
            self.target_zoom = zoom;
            self.pace = pace;
            self.callback = callback;
        };
        
        this.rotate = function()
        {
            var self = this;
            
            self.rotation.x = self.rotateAxis(self.rotation.x, self.target_rotation.x, self.pace);
            self.rotation.y = self.rotateAxis(self.rotation.y, self.target_rotation.y, self.pace);
            self.rotation.z = self.rotateAxis(self.rotation.z, self.target_rotation.z, self.pace);
            
            self.rotation.x = (self.rotation.x >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : self.rotation.x;
            self.rotation.y = (self.rotation.y >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : self.rotation.y;
            self.rotation.z = (self.rotation.z >= self.deg_to_rad(360)) ? self.deg_to_rad(0) : self.rotation.z;
            
            self.zoom       = self.rotateAxis(self.zoom, self.target_zoom, Math.round(self.pace/2));
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
            
            self.zoom = (self.zoom > self.zoom_max) ? self.zoom_max : self.zoom;
            self.zoom = (self.zoom < self.zoom_min) ? self.zoom_min : self.zoom;
        };
        
        
        this.clear = function()
        {
            var self = this;
            
            self.target_rotation = '';
            self.target_zoom = '';
            self.callback = '';
        };
        
        
        this.randomize = function()
        {
            var self = this;
            
            var rotate_to = lib.random(90,30);
            var zoom_to = lib.random(150,50) / 100;
            
            self.rotateTo(self.deg_to_rad(rotate_to), self.deg_to_rad(rotate_to), self.deg_to_rad(0) ,zoom_to, 90, function() {});
        }; 
        
        
        this.update = function()
        {      
            var self = this;
            var rotation = self.rotation;
            var target   = self.target_rotation;
            var zoom     = self.zoom;
            var target_zoom = self.target_zoom;
            
            self.is_animating = (rotation.x == target.x && rotation.y == target.y && rotation.z == target.z && zoom == target_zoom) ? false : true;
            
            if (self.is_animating && target != '') 
            {
                self.rotate();
            }
            else 
            {
                self.target_rotation = '';
                self.target_zoom = '';
                if (self.callback != '')
                {
                    self.callback();
                }
                self.callback = '';
            }
        };
        
        this.deg_to_rad = function(degrees)
        {
            return degrees * Math.PI / 180.0;
        };        
	};
})(jQuery);