;(function($){

Geosound = function(map_point)
{
    this.id         = map_point.id;                         // used in geosounds collection object and in connection objects
    this.index      = map_point.index;                      // this is probably no longer necessary
    this.x          = map_point.x_3d                        // x coordinatey in 3D space
    this.y          = map_point.y_3d;                       // y coordinatey in 3D space
    this.z          = map_point.z;                          // z coordinatey in 3D space
    this.coords     = {x: map_point.x, y: map_point.y};     // 2D coordinates object
    this.name       = map_point.created_by;                 // geosound author
    this.location   = map_point.location;                   // text location
    this.story      = map_point.story;                      // description
    this.isNew      = map_point.is_recent;                  // is the geosound 7 days old or less
    this.justAdded  = map_point.just_added;                 // was the geosound added in the last minute
    this.filename   = map_point.filename;                   // mp3 filename
    this.player     = '';                                   // Player instance for the sound
    this.volume     = map_point.volume;                     // volume can be in the range 0.0 - 1.0
    this.active     = false;                                // a connected or clicked on sound is considered active
    this.timeout    = '';                                   // for object specific timing -- volume animation & justAdded flag
    this.interval   = '';                                   // for object specific timing -- volume animation
    this.shape      = '';                                   // kineticJS shape
    this.isConnected = false;
    this.isPlaying   = false;
    this.isSearched  = false;
    this.minVolume  = 0.2;
    this.maxVolume  = 0.9;
    this.minRadius  = 5;
    this.maxRadius  = 20;
};

/* call this function after creating a new geosound */
Geosound.prototype.init = function()
{
    // calculate coordinates in 2D space
    this.projectTo2D();

    // add sound shape to the geosounds layer
    this.setup();
};

/* create the kineticJS shape and setup all of the interactions */
Geosound.prototype.setup = function()
{	
    var self = this;

    // radius value for halo is calculated according to the sound's default volume
    var radius = self.radiusFromVolume();

    // Kinetic group to store coordinates
    self.shape = new Kinetic.Group({
        x       : self.coords.x,
        y       : self.coords.y,
        alpha   : 0.4,
    });	

    // MOUSE OVER
    self.shape.on("mouseover", function() 
    {
        // change cursor 
        $('#container').css({'cursor':'pointer'});

        // populate the sound text div with this sound's data, position it, and display it
        $('.soundText').html(self.name+'<br/>'+self.location+'<br/><div class="story">'+self.story+'</div>') 
        .css({ 
            'top'   : (self.coords.y-110) + 'px',
            'left'  : (self.coords.x-27) + 'px'
        })
        .stop().fadeIn(100);

        // don't display the story element if there is no description for the geosound
        if (self.story == ""){
            $('.story').css('display','none');
        }

        // if the sound isn't active, highlight it
        if (!self.active)
        {
            self.shape.setAlpha(1);
        }
    });

    // MOUSE OUT
    self.shape.on("mouseout", function() 
    {
        // clear volume halo animation timing variables
        clearTimeout(self.timeout);
        clearInterval(self.interval);

        // reset cursor 
        $('#container').css({'cursor':'default'});

        // hide the sound text div
        $('.soundText').fadeOut(100);

        // reset the sound style
        if (!self.active)
        {
            self.shape.setAlpha(0.4);
        }
    });

    // MOUSE UP
    self.shape.on("mouseup", function() 
    {
        // clear volume halo animation timing variables                
        clearTimeout(self.timeout);
        clearInterval(self.interval);
    });

    // MOUSE DOWN
    self.shape.on("mousedown", function()
    {
        // determine whether geosound is active or not
        self.setActiveState();

        if (self.active)
        {
            // change the "core" color
            self.core().setFill('#005fff');

            // wait 500ms and then start animating the halo/volume
            self.volumeInteraction(500);


            /* SOUND CONNECTION LOGIC */

            // if a click on a sound was registered
            if (geosounds.lastClick != -1) 
            {
                // this is the second sound clicked on, several scenarios are possible:

                // 1. this is the first connection made
                if (connections.collection.length == 0)
                {
                    // make the connection between this sound and the one last clicked
                    c = connections.add(geosounds.lastClick, self.id, true);

                    // expand the playhead so the radius is as big as the sound that's closest to the center
                    playhead.adjustRadiusForConnection(c);
                }
                else
                {
                    // 2. this is a connection made in succession, right after another was just made
                    // 3. this a connection made after resetting he lastClick variable,
                    //    clicking on a sound that isn't conneted,
                    //    and connecting it to a sound which is connected
                    // 4. this a connection made after resetting he lastClick variable,
                    //    clicking on a sound that *is* conneted,
                    //    and connecting it to a sound which isn't connected
                    if ((self.isConnected == false && geosounds.soundIsConnected(geosounds.lastClick) == true)
                    ||
                    (self.isConnected == true && geosounds.soundIsConnected(geosounds.lastClick) == false)
                    ||
                    (self.isConnected == true && geosounds.soundIsConnected(geosounds.lastClick) == true))
                    {
                        // make the connection between this sound and the one last clicked
                        c = connections.add(geosounds.lastClick, self.id, true);
                    }
                }

                // show add constellation link upon making the first connection
                if (constellations.addButton == false)
                {
                    $('#addConstellationText').fadeToggle("fast", "linear");
                    constellations.addButton = true;
                }
            }

             // store the id of the sound which was clicked in the interface lastClick variable
             geosounds.lastClick = self.id;
         }
         else 
         {
             // remove audio player instance
             self.player.destroy();
         }
     });

     // volume halo ellipse
     var halo = new Kinetic.Circle({
        radius        : radius,
        fill          : "#ccc",
        stroke        : "white",
        strokeWidth   : 0.25,
     });

    // core ellipse for interaction
    var core = new Kinetic.Circle({
        radius        : 2,
        fill          : "black",
        stroke        : "transparent",
        strokeWidth   : 0,
    }); 

    self.shape.add(halo);
    self.shape.add(core);
    geosounds.layer.add(self.shape);	

    // if this sound was just added, color it in blue for 5 seconds
    if (self.justAdded)
    {
        setTimeout(function() { self.justAdded = false }, 5000);
    }
};

Geosound.prototype.update = function()
{    
    this.projectTo2D();
    this.updateShapeCoordinates();
    this.updateStyle();
    this.checkIfSearched();
    this.applyStyles();
};

Geosound.prototype.applyStyles = function()
{    
    this.core().setFill('black');
    this.halo().setFill('#ccc'); 
        
    if (!this.isPlaying) { this.core().setFill("#000"); }

    if (this.isNew) { this.halo().setFill("#333"); }
    
    if (this.isSearched)
    {
       // var searchScore = Math.floor(self.map(searched_sound.score, 0.3, 0.7, 0, 255));                            
       // self.halo().setFill('rgb('+(searchScore)+','+(searchScore)+','+(0)+')');
       this.halo().setFill('rgb(255,255,0)');
    }
    
    // if this sound was just added, color it in blue for 5 seconds
    if (this.justAdded) { this.halo().setFill('#005fff'); }    
        
    if (geosounds.lastClick != -1)
    {
        if (this.id == geosounds.lastClick)
        {
            this.core().setFill('black');
        }
        else
        {
            if (geosounds.soundIsConnected(geosounds.lastClick))
            {
                if (this.isConnected && this.active)
                {
                    this.core().setFill('black');
                }
                if (this.isConnected && !this.active)
                {
                    this.core().setFill('black');
                }
                if (!this.isConnected && this.active)
                {
                    this.core().setFill('black');
                }                
                if (!this.isConnected && !this.active)
                {
                    this.core().setFill('white');
                }
            }
            else
            {
                if (this.isConnected && this.active && connections.collection.length > 0)
                {
                    this.core().setFill('white');
                }
                if (this.isConnected && this.active && connections.collection.length == 0)
                {
                    this.core().setFill('black');
                }
                if (this.isConnected && !this.active)
                {
                    this.core().setFill('black');
                }
                if (!this.isConnected && this.active)
                {
                    this.core().setFill('black');
                }                
                if (!this.isConnected && !this.active && connections.collection.length == 0)
                {
                    this.core().setFill('white');
                }
                if (!this.isConnected && !this.active && connections.collection.length > 0)
                {
                    this.core().setFill('black');
                }
            }
        }
    }

    if (this.isPlaying) { this.core().setFill("#005fff"); }
 
};

Geosound.prototype.projectTo2D = function()
{    
    var point = {x: this.x, y: this.y, z: this.z};
    
    var coordinates = pov.rotatePoint(point);
        
    this.coords.x = coordinates.x;
    this.coords.y = coordinates.y;
}

Geosound.prototype.updateShapeCoordinates = function()
{
    if (this.shape.getX() != this.coords.x)
    {
        this.shape.setX(this.coords.x);
    }
    if (this.shape.getY() != this.coords.y)
    {
        this.shape.setY(this.coords.y);
    }
};

Geosound.prototype.setActiveState = function()
{    
    // radius value for halo is calculated according to the sound's default volume
    var radius = this.radiusFromVolume();
        
    // if the sound is connected to connections it's always "active"
    // if it's not connected, the active state is toggled with every mouse click         
    this.active = (this.isConnected) ? true : !this.active;
    
    if (this.active) 
    {
         // create a player instance for this sound
         if (this.player == '')
         {
             var volume = this.volumeFromRadius(radius);
             this.player = new Player(this.id, this.index, this.filename, volume);
             this.player.init();
         }
     }
};

Geosound.prototype.updateStyle = function()
{
     var soundIsWithinPlayhead = playhead.pointIsWithin(this.coords.x, this.coords.y);
     var playheadTouchesSound  = playhead.pointIsOn(this.coords.x, this.coords.y);
     
     // when sound shape is inside playhead
     if (soundIsWithinPlayhead)
     {
         // play sound from the beginning when playhead hits sound shape
         if (playheadTouchesSound)
         {                    
             if (this.active == true)
             {
                 this.player.stop();  
                 this.player.play();
                 this.isPlaying = true;
             }
         }
         this.isPlaying = (this.active == true && !this.player.$player.data("jPlayer").status.paused) ? true : false; 
     }
};

Geosound.prototype.checkIfSearched = function()
{
    var searched_sounds = ffinterface.search_results.Geosounds;
    
    if (searched_sounds.length > 0)
    {
        for (var i=0; i<searched_sounds.length; i++)
        {
            var searched_sound = searched_sounds[i];
            this.isSearched = (this.id == searched_sound.id) ? true : false;
        }
    }
    else 
    {
        this.isSearched = false;
    }
};

Geosound.prototype.volumeInteraction = function(timeoutMs)
{
    var self = this;
    
    self.timeout = setTimeout(function() 
    {
        // since halo is an ellipse, it has x & y values for its radius
        var radius = self.halo().getRadius().x;
        
        // animate the radius in a loop
        self.interval = setInterval(function() 
        {
            // radius
            radius = (radius <= self.maxRadius) ? radius + 0.2 : self.minRadius;
            self.halo().setRadius(radius);
            
            // use the value of radius to determine the sound volume
            var volume = self.volumeFromRadius(radius);
            self.player.updateVolume(volume);
            
        }, ffinterface.frameRate);
    }, timeoutMs);
};

Geosound.prototype.halo = function()
{
    return this.shape.getChildren()[0];
};

Geosound.prototype.core = function()
{
    return this.shape.getChildren()[1];
};

Geosound.prototype.setVolume = function(volume)
{    
    this.volume = volume;
    var radius = this.radiusFromVolume()
    this.halo().setRadius(radius);
};

Geosound.prototype.volumeFromRadius = function(radius)
{
    return this.map(radius, this.minRadius, this.maxRadius, this.minVolume, this.maxVolume);
};

Geosound.prototype.radiusFromVolume = function()
{
    return this.map(this.volume, this.minVolume, this.maxVolume, this.minRadius, this.maxRadius, true);    
};

Geosound.prototype.map = function(value, istart, istop, ostart, ostop, confine) 
{
   var result = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
   if (confine)
   {
       result = (result > ostop) ? ostop : result;
       result = (result < ostart) ? ostart : result;
   }
   return result;
};
})(jQuery);