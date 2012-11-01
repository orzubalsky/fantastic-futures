;(function($){
var pov = window.pov = new function() 
{
    this.layer;
    this.shape;
    this.base_distance      = 2000;     // used as a constant to multiply by current zoom
    this.distance           = 2000;     // POV for 3D sphere	    
    this.rotation;                      // 3D rotation for the sphere, in radians. {x: 0.0, y: 0.0, z:0.0 }
    this.target_rotation;
    this.is_animating       = false;    // represents the state of rotation & zooming
    this.zoom               = 1.0;
    this.target_zoom        = 1.0;
    this.zoom_max           = 15.0;
    this.zoom_min           = 1.0;
    this.callback = '';


    this.init = function()
    {        
        this.layer = new Kinetic.Layer();
        
        this.rotation        = { x: 0, y: 0, z: 0 };
        this.target_rotation = { x: 0, y: 0, z: 0 };
        
        this.setup();
    };
    
    this.update = function()
    {                        
        var rotation = this.rotation;
        var target   = this.target_rotation;
        var zoom     = this.zoom;
        var target_zoom = this.target_zoom;
        
        // stage drag rotation calculation
        this.rotateInteraction();
                
        // stage zoom calculation
        this.zoomInteraction();

        // determine whether anything should be animating
        this.is_animating = (rotation.x == target.x && rotation.y == target.y && rotation.z == target.z && zoom == target_zoom) ? false : true;

        if (this.is_animating && target != '') 
        {
            this.rotate();
        }
        else
        {
            this.target_rotation = '';
            this.target_zoom = '';
            if (this.callback != '')
            {
                this.callback();
            }
        }
    };

    this.resetRotation = function()
    {        
        this.rotateTo(0,0,0, 1.0, 25, function() 
        {
            $('#interface').fadeOut(1000);
            $('#map').css('opacity','1');
            $('#map').fadeIn(500);
            this.callback = '';
        });
    };

    this.rotateTo = function(x,y,z, zoom, pace, callback)
    {
        this.target_rotation = { x: x, y: y, z: z};
        this.target_zoom = zoom;
        this.pace = pace;
        this.callback = callback;
    };

    this.rotate = function()
    {
        this.rotation.x = this.rotateAxis(this.rotation.x, this.target_rotation.x, this.pace);
        this.rotation.y = this.rotateAxis(this.rotation.y, this.target_rotation.y, this.pace);
        this.rotation.z = this.rotateAxis(this.rotation.z, this.target_rotation.z, this.pace);

        this.rotation.x = (this.rotation.x >= this.deg_to_rad(360)) ? this.deg_to_rad(0) : this.rotation.x;
        this.rotation.y = (this.rotation.y >= this.deg_to_rad(360)) ? this.deg_to_rad(0) : this.rotation.y;
        this.rotation.z = (this.rotation.z >= this.deg_to_rad(360)) ? this.deg_to_rad(0) : this.rotation.z;

        this.zoom = this.rotateAxis(this.zoom, this.target_zoom, Math.round(this.pace/2));
    };

    this.rotateAxis = function(current, target, pace)
    {
        var difference = Math.abs(current - target);
        var multiplier = (current > target) ? -1 : 1;

        return (difference > this.deg_to_rad(1)) ? current + multiplier * difference/pace : target;
    };

    this.clear = function()
    {        
        this.target_rotation = '';
        this.target_zoom = this.zoom;
        this.callback = '';
        geosounds.lastClick = -1;
    };

    this.randomize = function()
    {
        var rotate_to = lib.random(90,30);
        var zoom_to = lib.random(150,50) / 100;
        
        this.rotateTo(this.deg_to_rad(rotate_to), this.deg_to_rad(rotate_to), this.deg_to_rad(0) ,zoom_to, 90, function() {});
    };

    this.rotateInteraction = function()
    {
        if (this.shape.isDragging()) 
        {
            // stop any rotation animation that was running
            this.clear();

            var mousePos = ffinterface.stage.getMousePosition();

            var s = 10;
            var x = ((mousePos.x * 2*s) - ffinterface.width*s) / ffinterface.width;
            var y = ((mousePos.y * 2*s) - ffinterface.height*s) / ffinterface.height;

            rotationYAmount = this.deg_to_rad(Math.abs(x)) / this.zoom;
            rotationXAmount = this.deg_to_rad(Math.abs(y)) / this.zoom;
            
            var rotation_x = this.rotation.x;
            var rotation_y = this.rotation.y;
            
            this.rotation = this.target_rotation = { 
                x: rotation_x += rotationXAmount,
                y: rotation_y += rotationYAmount,
                z: 0,
            };
            
            this.rotate();
        }
    };

    this.zoomInteraction = function()
    {
        var self = this;

        $('#interface').mousewheel(function(event, delta, deltaX, deltaY) 
        {                
            self.changeZoom(deltaY / 10000);
        });

        self.distance = self.base_distance * self.zoom;
    };
    
    this.changeZoom = function(amount)
    {        
        this.clear();
        
        this.zoom += amount;
        
        this.zoom = (this.zoom > this.zoom_max) ? this.zoom_max : this.zoom;
        this.zoom = (this.zoom < this.zoom_min) ? this.zoom_min : this.zoom;
    };    

    this.setup = function()
    {
        this.shape = new Kinetic.Rect({
            x       : 0,
            y       : 0,
            width   : ffinterface.width,
            height  : ffinterface.height,
            fill    : "transparent",
            draggable: true,
            dragBounds: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        
        this.shape.on("mousedown", function() 
        {
            // reset the interface last click variable 
            geosounds.lastClick = -1;
            
            // reset the style of all sounds
            geosounds.styleAllInactiveSoundShapes('black');

            //hide all sound text
            $(".soundText").fadeOut(200);
        });

        this.layer.add(this.shape);
        ffinterface.stage.add(this.layer);
    };

    this.projection = function(xy, z, xyOffset, zOffset) 
    {        
        return Math.floor(((this.distance * xy) / (z - zOffset)) + xyOffset);
    };
    
    this.reverse_projection = function(xy_2d, z_3d, xyOffset, zOffset)
    {        
        return ((xy_2d * z_3d) - (xy_2d * zOffset) - (xyOffset * z_3d) + (xyOffset * zOffset)) / this.distance;
    };
    
    this.rotatePoint = function(point)
    {
        point = this.rotateX(point);
        point = this.rotateY(point);
        point = this.rotateZ(point);
                
        var x = this.projection(point.x, point.z, ffinterface.width/2.0, 100.0);
        var y = this.projection(point.y, point.z, ffinterface.height/2.0, 100.0);
        
        var result = {x: x, y: y};
        
        return result;
    };

    this.rotateX = function(point) 
    {
        point.y = (point.y * Math.cos(this.rotation.x)) + (point.z * Math.sin(this.rotation.x) * -1.0);
        point.z = (point.y * Math.sin(this.rotation.x)) + (point.z * Math.cos(this.rotation.x));

        return point;
    };

    this.rotateY = function(point)
    {
        point.x = (point.x * Math.cos(this.rotation.y)) + (point.z * Math.sin(this.rotation.y) * -1.0);
        point.z = (point.x * Math.sin(this.rotation.y)) + (point.z * Math.cos(this.rotation.y));

        return point;
    };

    this.rotateZ = function(point)
    {
        point.x = (point.x * Math.cos(this.rotation.z)) + (point.y * Math.sin(this.rotation.z) * -1.0);
        point.y = (point.x * Math.sin(this.rotation.z)) + (point.y * Math.cos(this.rotation.z));

        return point;
    };
    
    this.deg_to_rad = function(degrees)
    {
        return degrees * Math.PI / 180.0;
    };        
};
})(jQuery);