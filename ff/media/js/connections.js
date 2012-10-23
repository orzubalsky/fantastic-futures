;(function($){
	var connections = window.connections = new function() 
	{
        this.layer;         // kinteticJS layer to hold all connection lines
        this.collection = [];


        this.init = function()
        {
            var self = this;
            
            self.layer = new Kinetic.Layer();
            
            for (var i=0; i<self.collection.length; i++)
            {                
                var connection = new Connection();
                connection.init();
            }          
        
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
                     
            for(var i=0; i<self.collection.length; i++)
            {
                var connection = self.collection[i];
                connection.update();
            }
        };
        
        
        this.draw = function()
        {
            var self = this;
            self.layer.draw();
        };
        

		this.add = function(id_1, id_2, startPlaying)
		{
		    var self = this;
		    
            // create connection between the two sounds
            c = new Connection(id_1, id_2);

            self.collection.push(c);
            c.init();

            if (startPlaying)
            {
                // start playing both sounds when the connection is made
                var sound_1 = geosounds.collection[id_1];
                var sound_2 = geosounds.collection[id_2];
            
                sound_1.player.play();
                sound_2.player.play();
            }
            
            return c;
		};

        
        this.newConnectionFromTwoSoundShapes = function(soundShape_1, soundShape_2)
        {
            var self = this;

            c = new Connection();

            c.sound_1 = soundShape_1.getAttrs().id;
            c.sound_2 = soundShape_2.getAttrs().id;
            c.index_1 = soundShape_1.getAttrs().index;
            c.index_2 = soundShape_2.getAttrs().index;
           
            self.collection.push(c);  

            c.init();
            
            return c;
        };        
	};
})(jQuery);