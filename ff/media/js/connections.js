;(function($){
var connections = window.connections = new function() 
{
    this.layer;             // kinteticJS layer to hold all connection lines
    this.collection = [];   // an array of all of the Connection objects 


    this.init = function()
    {        
        this.layer = new Kinetic.Layer();
        
        for (var i=0; i<this.collection.length; i++)
        {                
            var connection = new Connection();
            connection.init();
        }          
    
        ffinterface.stage.add(this.layer);            
    };

    this.update = function()
    {                 
        for(var i=0; i<this.collection.length; i++)
        {
            var connection = this.collection[i];
            connection.update();
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

    this.add = function(id_1, id_2, startPlaying)
    {
        // create connection between the two sounds
        c = new Connection(id_1, id_2);

        this.collection.push(c);
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
};
})(jQuery);