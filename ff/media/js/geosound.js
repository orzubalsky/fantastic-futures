;(function($){

Geosound = function(map_point)
{
    this.id         = map_point.id;
    this.index      = map_point.index;    
    this.x          = map_point.x
    this.y          = map_point.y;
    this.z          = map_point.z;
    this.coords     = {x: 0, y: 0};
    this.name       = map_point.created_by;
    this.location   = map_point.location;
    this.story      = map_point.story;
    this.isNew      = map_point.is_recent;
    this.justAdded  = map_point.just_added;
    this.filename   = map_point.filename;
    this.player     = '';
    this.volume     = map_point.volume;
    this.active     = false;    
    this.timeout    = '';
    this.interval   = '';
    this.shape      = '';
    this.minVolume  = 0.2;
    this.maxVolume  = 0.9;
    this.minRadius  = 5;
    this.maxRadius  = 20;
    this.isConnected = false;
};

Geosound.prototype.init = function()
{
    var self = this;

    // calculate coordinates in 2D space
    var coordinates = self.projectTo2D();
        
    // add sound shape to the geosounds layer
    self.setup();    
    
    // call update once to populate 2D coordinates
    self.update();
};


Geosound.prototype.setup = function()
{	
    var self = this;
        
    // radius value for halo is calculated according to the sound's default volume
    var radius = self.radiusFromVolume();
        
    // Kinetic group to store coordinates and meta data about the sound
    self.shape = new Kinetic.Group({
        x           : self.coords.x,
        y           : self.coords.y,
        alpha       : 0.4,
        draggable   : true,
        dragBounds: { top: 0, right: 0, bottom: 0, left: 0 },
    });	

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
        .stop().fadeIn(400);

        if (self.story == ""){
            $('.story').css('display','none');
        }

        // if the sound isn't active, highlight it
        if (!self.active)
        {
            self.shape.setAlpha(1);
        }
    });            
    self.shape.on("mouseout", function() 
    {
        // clear volume halo animation timing variables
        clearTimeout(self.timeout);
        clearInterval(self.interval);

        // reset cursor 
        $('#container').css({'cursor':'default'});

        // hide the sound text div
        $('.soundText').fadeOut(400);

        // reset the sound style
        if (!self.active)
        {
            self.shape.setAlpha(0.4);
        }
    });
    self.shape.on("mouseup", function() 
    {
        // clear volume halo animation timing variables                
        clearTimeout(self.timeout);
        clearInterval(self.interval);             
    });
    self.shape.on("mousedown", function() 
    {
         // if the sound is connected to connections it's always "active"
         // if it's not connected, the active state is toggled with every mouse click         
         self.active = (self.isConnected) ? true : !self.active;
         
         if (self.active) 
         {
              // create a player instance for this sound
              if (self.player == '')
              {
                  var volume = self.volumeFromRadius(radius);
                  self.player = new Player(self.id, self.index, self.filename, volume);
                  self.player.init();
              }

              // change the "core" color
              self.core().setFill('#005fff');
             
             // wait 500ms and then start animating the halo/volume
             self.volumeInteraction(500);
                                 
             
             /* SOUND CONNECTION LOGIC */
             
             // if this is the first sound clicked in order to make a connection
             if (geosounds.lastClick == -1) 
             {
                  geosounds.styleConnectableSounds(self);
             }
             else
             {
                 // this is the second sound clicked on, several scenarios are possible:
                 
                 // 1. this is the first connection made
                 if (connections.collection.length == 0)
                 {
                     // make the connection between this sound and the one last clicked
                     c = connections.add(geosounds.lastClick, self.id);
                     self.isConnected = true;
                     
                     // expand the playhead so the radius is as big as the sound that's closest to the center
                     playhead.adjustRadiusForConnection(c);
                 }
                 else 
                 {                            
                     // 2. this is a connection made in succession, right after another was just made
                     if (self.isConnected == false && geosounds.soundIsConnected(geosounds.lastClick) == true)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);
                         self.isConnected = true;                         
                     }
                     
                     // 3. this a connection made after resetting he lastClick variable, 
                     //    clicking on a sound that isn't conneted, 
                     //    and connecting it to a sound which is connected
                     if (self.isConnected == true && geosounds.soundIsConnected(geosounds.lastClick) == false)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);
                         self.isConnected = true;                         
                     }  
                     
                     // 4. this a connection made after resetting he lastClick variable, 
                     //    clicking on a sound that *is* conneted, 
                     //    and connecting it to a sound which isn't connected
                     if (self.isConnected == true && geosounds.soundIsConnected(geosounds.lastClick) == true)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);
                         self.isConnected = true;                         
                     }  
                 }
                 
                 // show add constellation link upon making the first connection 
                 if (ffinterface.addButton == 0)
                 {
                     $('#addConstellationText').fadeToggle("fast", "linear");
                     ffinterface.addButton = 1;
                 }                        
             }

             // store the id of the sound which was clicked in the interface lastClick variable
             geosounds.lastClick = self.id;
         }
         else 
         {
             // reset core color to original
             self.core().setFill('#000');
             
             // remove audio player instance
             self.player.destroy();
         }
     });		    


    // volume halo ellipse
    var halo = new Kinetic.Circle({
        radius        : radius,
        fill          : "#ccc",
        stroke        : "white",
        strokeWidth   : 0,
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
        self.halo().setFill('#005fff');
        setTimeout(function() { self.halo().setFill('#666'); }, 5000);
    }
};


Geosound.prototype.update = function()
{
    var self = this;
    
    self.projectTo2D();
    self.updateShapeCoordinates();
    self.updateStyle();
};

Geosound.prototype.projectTo2D = function()
{
    var self = this;
    
    var point = {x: self.x, y: self.y, z: self.z};
    
    var coordinates = pov.rotatePoint(point);
        
    self.coords.x = Math.floor(coordinates.x);
    self.coords.y = Math.floor(coordinates.y);
}

Geosound.prototype.updateShapeCoordinates = function()
{
    var self = this;

    self.shape.setX(self.coords.x);
    self.shape.setY(self.coords.y);
};

Geosound.prototype.updateStyle = function()
{
     var self = this;

     var soundIsWithinPlayhead = playhead.pointIsWithin(self.coords.x, self.coords.y);
     var playheadTouchesSound  = playhead.pointIsOn(self.coords.x, self.coords.y);
     
     if (geosounds.lastClick != -1)
     {
         // a sound was clicked, so we want to show what sounds could be connected to it
         geosounds.styleConnectableSounds(geosounds.lastClick);         
     }
     else
     { 
         // when sound shape is inside playhead
         if (soundIsWithinPlayhead)
         {
             // play sound from the beginning when playhead hits sound shape
             if (playheadTouchesSound)
             {                    
                 if (self.active == true)
                 {
                     self.player.stop();  
                     self.player.play();
                     self.core().setFill("#005fff");	//style sound that is playing
                 }
             }

             if (self.active == true && !self.player.$player.data("jPlayer").status.paused)
             {                    
         	    self.core().setFill("#005fff");	//style sound that is playing
             }
             else 
             {
         	    self.core().setFill("#000");	//style sound that isn't playing
             }
         }
         else 
         {
             if (self.active == true && pov.is_animating)
             {
                 self.player.stop();                      
                 self.core().setFill("#000");	//style sound that isn't playing                        
             }                    	                    
         }
     }
};


Geosound.prototype.styleSearchedSoundShape = function(soundShape)
{
    var self = this;
    var searched_sounds = ffinterface.search_results.Geosounds;
    
    if (searched_sounds.length > 0)
    {
        for (var j=0; j<searched_sounds.length; j++)
        {
            var searched_sound = searched_sounds[j];
            var range = 1;

            if (self.id == searched_sound.id)
            {
                var searchScore = Math.floor(self.map(searched_sound.score, 0.3, 0.7, 0, 255));                            
                self.halo().setFill('rgb('+(searchScore)+','+(searchScore)+','+(0)+')');
                self.halo().setFill('rgb(255,255,0)');
                break;
            }
            else 
            {
                if (self.isNew)
                {
                    self.halo().setFill("#333");    
                }
                else 
                {
                    self.halo().setFill("#ccc");        //turns halo grey after the page loads                        
                }	
            }
        }
    }
    else
    {
        if (!self.justAdded)
        {                    
            if (self.isNew)
            {
                self.halo().setFill("#333");                                
            }
            else 
            {
                self.halo().setFill("#ccc");       //turns halo grey after the page loads                          
            }      
        }
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
    var self = this;
    return self.shape.getChildren()[0];
};

Geosound.prototype.core = function()
{
    var self = this;
    return self.shape.getChildren()[1];
};

Geosound.prototype.volumeFromRadius = function(radius)
{
    var self = this;
    return self.map(radius, self.minRadius, self.maxRadius, self.minVolume, self.maxVolume);
};

Geosound.prototype.radiusFromVolume = function()
{
    var self = this;
    return self.map(self.volume, self.minVolume, self.maxVolume, self.minRadius, self.maxRadius, true);    
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