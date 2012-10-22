;(function($){
	var connections = window.site.connections = new function() 
	{
        this.layer;         // kinteticJS layer to hold all connection lines
        this.collection = [];


        this.init = function()
        {
            var self = this;
            
            self.layer = new Kinetic.Layer();
            
            for (var i=0; i<self.collection.length; i++)
            {                
                site.ffinterface.addConnectionToLayer(self.sphere.connections[i]);
            }          
        
            site.ffinterface.stage.add(self.layer);            
        };


        this.clear = function()
        {
            var self = this;
            self.layer.clear();
        };


        this.update = function()
        {
            var self = this;
                     
            for(var i=0; i<self.layer.getChildren().length; i++)
            {
                var connection = self.collection[i];
                var child = self.layer.getChildren()[i];

                var p1 = site.geosounds.collection[connection.index_1];
                var p2 = site.geosounds.collection[connection.index_2];

                child.setPoints([ {x: p1.x, y: p1.y}, {x: p2.x, y: p2.y} ]);
            }       
        };
        
        
        this.draw = function()
        {
            var self = this;
            self.layer.draw();
        };
        

		this.connectTwoSoundShapes = function(soundShape_1, soundShape_2)
		{
		    var self = this;
		    
            // create connection between the two sounds
            c = self.newConnectionFromTwoSoundShapes(soundShape_1, soundShape_2);

            // start playing both sounds when the connection is made
            var sound_1 = site.geosounds.points_layer.getChildren()[c.index_1];
            var sound_2 = site.geosounds.points_layer.getChildren()[c.index_2];
            sound_1.getAttrs().player.play();
            sound_2.getAttrs().player.play();    

            // now show all of the other possible connections by highlighting the other sounds                    
            site.geosounds.styleAllInactiveSoundShapes('white');		    
		};

        
        this.newConnectionFromTwoSoundShapes = function(soundShape_1, soundShape_2)
        {
            var self = this;

            c = new site.Connection();

            c.sound_1 = soundShape_1.getAttrs().id;
            c.sound_2 = soundShape_2.getAttrs().id;
            c.index_1 = soundShape_1.getAttrs().index;
            c.index_2 = soundShape_2.getAttrs().index;
           
            site.connections.collection.push(c);  
            
            c.init();
            
            return c;
        };
        
        
        this.getActiveConnections = function()
        {
            var self = this;
            
            for (var i=0; i<site.geosounds.sphere.connections.length; i++)
            {
                var c = site.geosounds.sphere.connections[i];
                
                var sound_1 = self.points_layer.getChildren()[c.index_1];
                var sound_2 = self.points_layer.getChildren()[c.index_2];
                
                c.sound_1_volume = self.map(sound_1.getChildren()[0].getAttrs().radius.x, 5, 20, 0.2, 0.9);
                c.sound_2_volume = self.map(sound_2.getChildren()[0].getAttrs().radius.x, 5, 20, 0.2, 0.9);
                
                c.sound_1_volume = Math.floor(c.sound_1_volume*100) / 100;
                c.sound_2_volume = Math.floor(c.sound_2_volume*100) / 100;                
            }
            return site.geosounds.sphere.connections;
        };
        
        
        this.clearConnections = function() 
        {
            var self = this;
            
            site.pov.clear();
            self.collection = [];
            self.layer.removeChildren();
            
            if (site.ffinterface.constellation > 0 && !site.pov.is_animating)
            {
                for (var i=0; i<CONSTELLATIONS.length; i++)
                {
                    if (CONSTELLATIONS[i].pk == site.ffinterface.constellation)
                    {
                        var constellation = CONSTELLATIONS[i].fields;
                        site.ffinterface.drawConstellation(constellation, true, true, function() {});                        
                    }
                }
            }
        };         
	};
})(jQuery);