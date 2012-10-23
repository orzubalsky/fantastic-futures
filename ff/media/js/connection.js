;(function($){

Connection = function()
{
    this.sound_1 = 0;
    this.sound_2 = 0;
    this.index_1 = 0;
    this.index_2 = 0;
    this.sound_1_volume = 0.0;
    this.sound_2_volume = 0.0;
};

Connection.prototype.init = function()
{
    var self = this;

    // add sound shape to the geosounds layer
    self.setup();    
};

Connection.prototype.setup = function()
{	
    var self = this;
        
    var p1 = geosounds.collection[self.index_1];
    var p2 = geosounds.collection[self.index_2];
    		    		    
    var line = new Kinetic.Line({
        points          : [p1.x, p1.y, p2.x, p2.y],
        stroke          : "#005fff",
        strokeWidth     : 0.25,
        lineCap         : "round",
        lineJoin        : "round"
    });
    connections.layer.add(line);  
};


Connection.prototype.update = function()
{
    var self = this;
    
};
})(jQuery);