;(function($){
var geosounds = window.geosounds = new function() 
{
    this.map_points = [];           // array of points from map.js
    this.map_points_count;          // keeps track of map sound count. this is used to determine whether a new sound was added
    this.lastClick = -1;            // holds the id of the Geosound object that was clicked on last        
    this.layer;                     // kinteticJS layer to hold all sound shapes
    this.collection = {};           // object that contains all Geosound objects


    this.init = function()
    {        
        this.layer = new Kinetic.Layer();
                    
        for(var i=0; i<this.map_points.length; i++)
        {
            this.add(this.map_points[i]);
        }
        this.map_points_count = this.map_points.length;
        
        ffinterface.stage.add(this.layer);
    };

    this.update = function()
    {        
        // check whether a new point was added on the openlayers map
        this.drawJustAddedSounds();
        
        // update geosounds
        for (var id in this.collection)
        {
            var geosound = this.collection[id];
            geosound.update();
        }
    };

    this.draw = function()
    {
        this.layer.draw();
    };

    this.clear = function()
    {
        this.layer.clear();            
    };
    
    this.drawJustAddedSounds = function()
    {
        if (this.map_points.length > this.map_points_count)
        {
            this.map_points_count = this.map_points.length;
            this.add(this.map_points[this.map_points_count-1]);                
        }
    };        
    
    this.add = function(map_point)
    {
        // the new sound index
        map_point.index = this.collection.length;
                    
        // the new sound coordinates
        map_point.x_3d = pov.reverse_projection(map_point.x, map_point.z, ffinterface.width/2.0, 100.0);
        map_point.y_3d = pov.reverse_projection(map_point.y, map_point.z, ffinterface.height/2.0, 100.0);

        // create the sound
        geosound = new Geosound(map_point);
        
        // add sound to collection array
        this.collection[map_point.id] = geosound;

        geosound.init();             
    };

    this.setActiveStateForConnectedSounds = function()
    {
         for (var id in this.collection)
         {
             var geosound = this.collection[id];
             if (geosound.isConnected)
             {
                 geosound.setActiveState();       
             }
         }
    };
    
	this.styleAllInactiveSoundShapes = function(color)
	{	    
        for (var id in this.collection)
        {
            var geosound = this.collection[id];

            // only apply the style change to sounds which are not active
            (!geosound.active) ? geosound.core().setFill(color) : geosound.core().setFill(color);  
        }
    };

    this.soundIsConnected = function(id)
    {
        for (var i=0; i<connections.collection.length; i++)
        {
            var c = connections.collection[i];
            if (id == c.sound_1 || id == c.sound_2)
            {
                return true;
            }
        }
        return false;
    };
    
    this.togglePlayerSounds = function() 
    {
        for (var id in this.collection)
        {
            var geosound = this.collection[id];
            
            if (geosound.active)
            {
                var player = geosound.player;
                (playhead.is_playing) ? player.play() : player.pause();                            
            }
        }		    
    };    
};
})(jQuery);