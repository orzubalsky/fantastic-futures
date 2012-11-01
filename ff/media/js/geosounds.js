;(function($){
var geosounds = window.geosounds = new function() 
{
    this.map_points = [];           // array of points from map.js
    this.map_points_count;          // keeps track of map sound count. this is used to determine whether a new sound was added
    this.lastClick = -1;            // holds the id of the Geosound object that was clicked on last        
    this.layer;                     // kinteticJS layer to hold all sound shapes
    this.collection = {};           // object that contains all Geosound objects


    /* call this function once to do all necessary setting up */
    this.init = function()
    {
        // create a kineticJS layer to hold the playhead shape        
        this.layer = new Kinetic.Layer();

        // add a geosound for each point coming from map.js
        for(var i=0; i<this.map_points.length; i++)
        {
            this.add(this.map_points[i]);
        }

        // store the count of the map_points array.
        // this will be compared to in order to check whether a new sound was added
        this.map_points_count = this.map_points.length;

        // add layer to the one interface stage        
        ffinterface.stage.add(this.layer);
    };

    /* test for newly added sounds and update each geosound */
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

    /* draw the kineticJS layer */
    this.draw = function()
    {
        this.layer.draw();
    };

    /* clear the kineticJS layer */
    this.clear = function()
    {
        this.layer.clear();
    };

    /* check for a newly added sound, and add it if it exists */
    this.drawJustAddedSounds = function()
    {
        // after a sound was added, map.js populates the map_points array with the new sounds.
        // if the length of the array is greater than the count that was stored on setup()
        // it means that a new sound was added
        if (this.map_points.length > this.map_points_count)
        {
            // store the new count
            this.map_points_count = this.map_points.length;

            // add the new geosond
            this.add(this.map_points[this.map_points_count-1]);
        }
    };

    /* add a new geosound from a map_point object (from map.js) */
    this.add = function(map_point)
    {
        // the geosound index
        map_point.index = this.collection.length;

        // the geosound coordinates
        map_point.x_3d = pov.reverse_projection(map_point.x, map_point.z, ffinterface.width/2.0, 100.0);
        map_point.y_3d = pov.reverse_projection(map_point.y, map_point.z, ffinterface.height/2.0, 100.0);

        // create the sound from the map_point object
        geosound = new Geosound(map_point);
        
        // add sound to collection array
        this.collection[map_point.id] = geosound;

        // initialize the geosound
        geosound.init();
    };

    /* iterate over geosounds array and set the active variable for each */
    this.setActiveStateForConnectedSounds = function()
    {
         for (var id in this.collection)
         {
             var geosound = this.collection[id];
             
             // don't do any unnecessary stuff,
             // call the function only if the geosound is a part of a connection
             if (geosound.isConnected)
             {
                 geosound.setActiveState();
             }
         }
    };

    /* apply a fill color depending on whether geosonds are active or not */
    this.styleAllInactiveSoundShapes = function(color)
    {
        for (var id in this.collection)
        {
            var geosound = this.collection[id];

            // only apply the style change to sounds which are not active
            (!geosound.active) ? geosound.core().setFill(color) : geosound.core().setFill('black');
        }
    };
    
    /* set isConnected to false to all sounds */    
    this.disconnectAllSounds = function()
    {
        for (var id in this.collection)
        {
            var geosound = this.collection[id];
            geosound.isConnected = false;
        }
    };

    /* check whether a geosound is a part of a connection */
    this.soundIsConnected = function(id)
    {
        // iterate over connections
        for (var i=0; i<connections.collection.length; i++)
        {
            var c = connections.collection[i];
            
            // compare geosound id to the 2 id's stored in the connection object
            if (id == c.sound_1 || id == c.sound_2)
            {
                return true;
            }
        }
        return false;
    };

    /* iterate over geosounds and toggle the player for each one*/
    this.togglePlayerSounds = function() 
    {
        for (var id in this.collection)
        {
            var geosound = this.collection[id];

            // only active sounds have player instances created for them
            if (geosound.active)
            {
                var player = geosound.player;
                (playhead.is_playing) ? player.play() : player.pause();
            }
        }
    };
};
})(jQuery);