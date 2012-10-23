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
            'top'   : (this.getY()-110) + 'px',
            'left'  : (this.getX()-27) + 'px'
        })
        .stop().fadeIn("400");

        if (self.story==""){
            $('.story').css('display','none');
        }

        // if the sound isn't active, highlight it
        if (!self.active)
        {
            this.setAlpha(1);
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
        $('.soundText').fadeOut("400");

        // reset the sound style
        if (!self.active)
        {
            this.setAlpha(0.4);
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
         if (self.isConnected(self.shape))
         {
             self.active = true;
         }
         else 
         {
             // if it's not connected, the active state is toggled with every mouse click
             self.active = !self.active;                    
         }
         
         if (self.active) 
         {
              // create a player instance for this sound
              if (self.player == '')
              {
                  var volume = self.map(radius, 5, 20, 0.2, 0.9);            	         
                  var player = new Player(self.id, self.index, self.filename, volume);
                  self.player =  player;
                  self.player.init();
              }

              // change the "core" color
              this.getChildren()[1].setFill('#005fff');

              // store the sound instance in a variable (js timeout function creates a new scope for "this")
              var shape = this;
             
             // wait 500ms and then start animating the halo/volume
             self.timeout = setTimeout(function() 
             {
                 // the halo shape is the first child of the sound group
                 var halo = shape.getChildren()[0];
                 
                 // since halo is an ellipse, it has x & y values for its radius
                 var radius = halo.getRadius().x;
                 
                 // animate the radius in a loop
                 self.interval = setInterval(function() 
                 {
                     // radius
                     radius = (radius <= 20) ? radius + 0.2 : 5;
                     halo.setRadius(radius);
                     
                     // use the value of radius to determine the sound volume
                     var volume = self.volumeFromRadius(radius);
                     self.player.updateVolume(volume);
                     
                 }, ffinterface.frameRate);
             }, 500);
                                 
             
             /* SOUND CONNECTION LOGIC */
             
             // if this is the first sound clicked in order to make a connection
             if (geosounds.lastClick == -1) 
             {
                 // if there are connections, you can only connect the sound to them
                 if (connections.collection.length > 0)
                 {
                     //ffinterface(this, 'white');                            
                 }
                 else 
                 {
                     // if there aren't, this is the first sound ever clicked, and anything is possible!
                     //ffinterface('white');
                 }                        
             }
             else
             {
                 // this is the second sound clicked on, several scenarios are possible:
                 
                 // 1. this is the first connection made
                 if (connections.collection.length == 0)
                 {
                     // make the connection between this sound and the one last clicked
                     c = connections.add(geosounds.lastClick, self.id);
                     
                     // expand the playhead so the radius is as big as the sound that's closest to the center
                     playhead.adjustRadiusForConnection(c);
                 }
                 else 
                 {                            
                     // 2. this is a connection made in succession, right after another was just made
                     if (self.isConnected(self.id) == false && self.isConnected(geosounds.lastClick) == true)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);                                
                     }
                     
                     // 3. this a connection made after resetting he lastClick variable, 
                     //    clicking on a sound that isn't conneted, 
                     //    and connecting it to a sound which is connected
                     if (self.isConnected(self.id) == true && self.isConnected(geosounds.lastClick) == false)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);                                
                     }  
                     
                     // 4. this a connection made after resetting he lastClick variable, 
                     //    clicking on a sound that *is* conneted, 
                     //    and connecting it to a sound which isn't connected
                     if (self.isConnected(self.id) == true && self.isConnected(geosounds.lastClick) == true)
                     {
                         // make the connection between this sound and the one last clicked
                         c = connections.add(geosounds.lastClick, self.id);                                
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
             self.shape.getChildren()[1].setFill('#000');
             
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
        halo.setFill('#005fff');
        setTimeout(function() { halo.setFill('#666'); }, 5000);
    }
};


Geosound.prototype.update = function()
{
    var self = this;
    
    self.projectTo2D();
    self.updateShapeCoordinates();
    
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

Geosound.prototype.aaupdate = function(soundShape, radius)
{
     var self = this;

     var player = self.player;
     var distance_from_center = ffinterface.dist(self.shape.getX(), self.shape.getY(), ffinterface.width/2, ffinterface.height/2);

     // when sound shape is inside playhead
     if (distance_from_center <= radius)
     {
         // play sound from the beginning when playhead hits sound shape
         if (distance_from_center == radius)
         {                    
             if (self.active == true)
             {
                 player.stop();  
                 player.play();
                 self.shape.getChildren()[1].setFill("#005fff");	//style sound that is playing
             }
         }

         if (self.active == true && !player.$player.data("jPlayer").status.paused)
         {                    
     	    self.shape.getChildren()[1].setFill("#005fff");	//style sound that is playing
         }
         else 
         {
     	    self.shape.getChildren()[1].setFill("#000");	//style sound that isn't playing				        
         }
     } 
     else 
     {
         if (self.active == true && pov.is_animating)
         {
             player.stop();                      
             self.shape.getChildren()[1].setFill("#000");	//style sound that isn't playing                        
         }                    	                    
     }            
};   
 

Geosound.prototype.isConnected = function(id)
{
    var self = this;
    
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
                self.shape.getChildren()[0].setFill('rgb('+(searchScore)+','+(searchScore)+','+(0)+')');
                self.shape.getChildren()[0].setFill('rgb(255,255,0)');
                break;
            }
            else 
            {
                if (self.isNew)
                {
                    self.shape.getChildren()[0].setFill("#333");    
                }
                else 
                {
                    self.shape.getChildren()[0].setFill("#ccc");        //turns halo grey after the page loads                        
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
                self.shape.getChildren()[0].setFill("#333");                                
            }
            else 
            {
                self.shape.getChildren()[0].setFill("#ccc");       //turns halo grey after the page loads                          
            }      
        }
    }
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