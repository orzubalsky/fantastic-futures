;(function($){
var playhead = window.playhead = new function() 
{
    this.layer;                      // kinteticJS layer to animate the circular playhead
    this.shape;                      // kineticJS shape -- the playhead circle
	this.is_playing         = false; // this is used to check whether the player is playing or paused


    /* call this function once to do all necessary setting up */
    this.init = function()
    {
        // create a kineticJS layer to hold the playhead shape
        this.layer = new Kinetic.Layer();
        
        // create the playhead shape in the center of the interface
        this.shape = new Kinetic.Circle({
            x                 : ffinterface.width / 2,
            y                 : ffinterface.height / 2,
            opacity           : 0.8,
            radius            : 0,
            //fillPatternImage  : ffinterface.images.playhead_fill, //stripes
            //fillPatternOffset : [0, 0],
            stroke            : "#efefef",
            strokeWidth       : .25,
        });

        // add playhead shape to layer
        this.layer.add(this.shape);
        
        // add layer to the one interface stage
        ffinterface.stage.add(this.layer);

        // enable playing/pausing the playhead
        this.playerToggleControl();
    };

    /* clear the kineticJS layer */
    this.clear = function()
    {        
        this.layer.clear();
    };

    /* update the size of the playhead */
    this.update = function()
    {
        // the playhead radius is stored in the kineticJS shape as an object {x: a, y: b}
        var radius = this.shape.getRadius();

        // only update size if the interface is playing
        if (this.is_playing)
        {
            // reset the radius when it reaches the end of the screen
            radius = (radius.x < ffinterface.width / 2) ? Math.floor(radius.x) + 1 : 0;
            
            // update the size of the kineticJS shape
            this.shape.setRadius(radius);
        }
    };

    /* draw the kineticJS layer */
    this.draw = function()
    {
        this.layer.draw();
    };

    /* given a connection, set the playhead radius to the closest geosound */
    this.adjustRadiusForConnection = function(c)
    {
        // get sound objects from geosounds collection object
        var sound_1 = geosounds.collection[c.sound_1];
        var sound_2 = geosounds.collection[c.sound_2];

        // calculate the distance of each sound from the center
        var sound_1_distance_from_center = this.dist(sound_1.coords.x, sound_1.coords.y, ffinterface.width/2, ffinterface.height/2);                            
        var sound_2_distance_from_center = this.dist(sound_2.coords.x, sound_2.coords.y, ffinterface.width/2, ffinterface.height/2);                            

        // pick the smaller value
        var closest_distance = (sound_1_distance_from_center < sound_2_distance_from_center) ? sound_1_distance_from_center : sound_2_distance_from_center;

        // set the playhead shape's radius to the smaller value
        // subtracted 2 just so that first sound will change colors.
        this.shape.setRadius(closest_distance-2);
        
        // set the playhead to playing mode
        this.is_playing = true;
    };

    /* determine whether a point is within the playhead's shape's area */
    this.pointIsWithin = function(x,y)
    {
        var distance_from_center = this.dist(x, y, ffinterface.width/2, ffinterface.height/2);

        return (distance_from_center <= this.shape.getRadius().x) ? true : false;
    };

    /* determine whether a point is on the playhead's circumference */
    this.pointIsOn = function(x,y)
    {
        var distance_from_center = this.dist(x, y, ffinterface.width/2, ffinterface.height/2);

        return (distance_from_center == this.shape.getRadius().x) ? true : false;
    };

    /* key controls for the player */
    this.playerToggleControl = function()
    {
        var self = this;

        // catch any keypress
        $(window).keypress(function(e) 
        {
            // if the clickLayer element is visible, it means that a form is visible
            var formActive = ($('#clickLayer').css('display') == 'block') ? true : false;

            // only apply key control if there is at least one connection and if no forms are visible
            if (connections.collection.length > 0 && !formActive)
            {
                // different browsers treat key presses differently. we want to catch them all
	            var key = e.which || e.keyCode || e.keyChar;

                // if any of these are pressed: return, backspace, escape, space
                if (key == 8 || key == 13 || key == 27 || key == 32)
                {
                    // play / pause playhead
                    self.is_playing = !self.is_playing;

                    // play / pause each of the geosounds' players
                    geosounds.togglePlayerSounds();
                }
            }
        });
    };

    /* return the distance between two points */
    this.dist = function(x1,y1,x2,y2)
    {
        return Math.floor(Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) ));
    };
};
})(jQuery);