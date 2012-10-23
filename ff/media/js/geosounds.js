;(function($){
	var geosounds = window.geosounds = new function() 
	{
        this.map_points = [];           // array of points from map.js
        this.map_points_count;          // keeps track of map sound count. this is used to determine whether a new sound was added
	    this.lastClick = -1;            // holds the sound shape object that was clicked on last        
        this.layer;                     // kinteticJS layer to hold all sound shapes
        this.collection = {};


        this.init = function()
        {
            var self = this;
            
            self.layer = new Kinetic.Layer();
                        
            for(var i=0; i<self.map_points.length; i++)
            {
                self.add(self.map_points[i]);
            }
            self.map_points_count = self.map_points.length;
                
            ffinterface.stage.add(self.layer);
        };


        this.clear = function()
        {
            var self = this;
            self.layer.clear();            
        };


        this.update = function()
        {
            var self = this;
            
            // check whether a new point was added on the openlayers map
            self.drawJustAddedSounds();
            
            // update geosounds
            for (var id in self.collection)
            {
                var geosound = self.collection[id];
                geosound.update();
            }
        };


        this.draw = function()
        {
            var self = this;
            self.layer.draw();
        };


        this.drawJustAddedSounds = function()
        {
            var self = this;
            
            if (self.map_points.length > self.map_points_count)
            {
                self.map_points_count = self.map_points.length;
                self.add(self.map_points[self.map_points_count-1]);                
            }
        };        
        
     
        this.add = function(map_point)
        {
            var self = this;

            // the new sound index
            map_point.index = self.collection.length;
                        
            // the new sound coordinates
            map_point.x = pov.reverse_projection(map_point.x, map_point.z, ffinterface.width/2.0, 100.0);
            map_point.y = pov.reverse_projection(map_point.y, map_point.z, ffinterface.height/2.0, 100.0);

            // create the sound
            geosound = new Geosound(map_point);
            
            // add sound to collection array
            self.collection[map_point.id] = geosound;

            geosound.init();             
        };


        this.setActiveStateForAllSounds = function()
        {
             var self = this;

             for (var id in self.collection)
             {
                 var geosound = self.collection[id];
                 geosound.setActiveState();       
             }
        };
        
        this.styleConnectableSounds = function(id)
        {
            var self = this;
            
            // if there are no connections, this is the first sound ever clicked, and anything is possible!            
            if (connections.collection.length == 0 && !self.soundIsConnected(id))
            {
                self.styleAllInactiveSoundShapes('white');                            
            }
                        
            // if there are connections and this sound is connected, you can connect to other inactive sounds
            if (connections.collection.length > 0 && self.soundIsConnected(id))
            {
                self.styleAllInactiveSoundShapes('white');
            }
            
            // if there are connections and this is an unconnected sound, you can connect to existing connected sounds
            if (connections.collection.length > 0 && !self.soundIsConnected(id))
            {                
                self.styleAllOtherActiveSoundShapes(id, 'white');
            }
        };

        this.styleAllOtherActiveSoundShapes = function(clickedSoundId, color)
        {
            var self = this;

            for (var id in self.collection)
            {
                var geosound = self.collection[id];
                
                // only apply the style change to sounds which are active and aren't this specific sound
                if (geosound.active && id != clickedSoundId)
                {                    
                    geosound.core().setFill(color);                                
                } 
                else
                {
                    geosound.core().setFill('black');
                }
            }		    
		};
		
		this.styleAllInactiveSoundShapes = function(color)
		{
		    var self = this;
		    
            for (var id in self.collection)
            {
                var geosound = self.collection[id];

                // only apply the style change to sounds which are not active
                if (!geosound.active)
                {                    
                    geosound.core().setFill(color);                                
                } 
                else
                {
                   geosound.core().setFill('black');
                }
            }
        };


        this.soundIsConnected = function(id)
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
        

        this.deg_to_rad = function(degrees)
        {
            return degrees * Math.PI / 180.0;
        };        
        
        this.map = function(value, istart, istop, ostart, ostop, confine) 
        {
            var result = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
            if (confine)
            {
               result = (result > ostop) ? ostop : result;
               result = (result < ostart) ? ostart : result;
            }
            return result;
        };      
	};
})(jQuery);