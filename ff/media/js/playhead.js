;(function($){
	var playhead = window.playhead = new function() 
{
    this.layer;                      // kinteticJS layer to animate the circular playhead
    this.shape;
    this.playhead           = 0;     // this is actually the radius of the circular playhead
	this.is_playing         = false; // this is used to check whether the player is playing or paused
	this.playheadCount      = 0;  
	this.playheadIntervals  =20;     //this is how often the playhead gets redrawn. A high number=less frequency of redrawing            


    this.init = function()
    {        
        this.layer = new Kinetic.Layer();
        
        this.shape = new Kinetic.Circle({
            x               : ffinterface.width / 2,
            y               : ffinterface.height / 2,
            alpha           : 0.8,
            radius          : 0,
            fill            : {image: ffinterface.images.playhead_fill, offset: [0, 0]}, //stripes
            stroke          : "#efefef",
            strokeWidth     : .25,
        });

        this.layer.add(this.shape);
        ffinterface.stage.add(this.layer);

        this.playerToggleControl();
    };

    this.clear = function()
    {        
        this.layer.clear();
    };

    this.update = function()
    {        
        var radius = this.shape.getRadius();

        if (this.is_playing)
        {
            radius = (radius.x < ffinterface.width / 2) ? Math.floor(radius.x) + 1 : 0;
            this.shape.setRadius(radius);
        }
        
        return radius;
    };

    this.draw = function()
    {
        this.layer.draw();
    };
    
    this.adjustRadiusForConnection = function(c)
    {        
        var sound_1 = geosounds.collection[c.sound_1];
        var sound_2 = geosounds.collection[c.sound_2];
                             
        var sound_1_distance_from_center = this.dist(sound_1.coords.x, sound_1.coords.y, ffinterface.width/2, ffinterface.height/2);                            
        var sound_2_distance_from_center = this.dist(sound_2.coords.x, sound_2.coords.y, ffinterface.width/2, ffinterface.height/2);                            
        
        var closest_distance = (sound_1_distance_from_center < sound_2_distance_from_center) ? sound_1_distance_from_center : sound_2_distance_from_center;

        this.shape.setRadius(closest_distance-2); //subtracted 2 just so that first sound will change colors.
        
        // set the playhead to playing mode!
        this.is_playing = true;            
    };
    
    this.pointIsWithin = function(x,y)
    {        
        var distance_from_center = this.dist(x, y, ffinterface.width/2, ffinterface.height/2);
        
        return (distance_from_center <= this.shape.getRadius().x) ? true : false;
    };
    
    this.pointIsOn = function(x,y)
    {        
        var distance_from_center = this.dist(x, y, ffinterface.width/2, ffinterface.height/2);
        
        return (distance_from_center == this.shape.getRadius().x) ? true : false;
    };        

    this.playerToggleControl = function()
    {        
        $(window).keypress(function(e) 
        {
            // check if a form is open
            var formActive = ($('#clickLayer').css('display') == 'block') ? true : false;
            
            if (connections.collection.length > 0 && !formActive)
            {
    	        var key = e.which || e.keyCode || e.keyChar;

    	        // return, backspace, escape, space
                if (key == 8 || key == 13 || key == 27 || key == 32)
                {
                    this.is_playing = !this.is_playing;                        
                    this.togglePlayerSounds();
                }		            
            }
        });
    };

    this.togglePlayerSounds = function() 
    {        
        var sounds = geosounds.layer.getChildren();
        for (var i=0; i<sounds.length; i++)
        {
            var sound = sounds[i];
            if (sound.getAttrs().active)
            {
                var player = sound.getAttrs().player;
                (this.is_playing) ? player.play() : player.pause();                            
            }
        }		    
    };
    
    this.dist = function(x1,y1,x2,y2)
    {
        return Math.floor(Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) ));
    };    
};
})(jQuery);