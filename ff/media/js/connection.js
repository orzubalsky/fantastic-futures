;(function($){

Connection = function(id_1, id_2)
{
    this.sound_1 = id_1;
    this.sound_2 = id_2;
    this.sound_1_volume = 0.0;
    this.sound_2_volume = 0.0;
    this.shape;
};

Connection.prototype.init = function()
{
    var self = this;

    self.setup();    
};

Connection.prototype.setup = function()
{
    var self = this;

    var s1 = geosounds.collection[self.sound_1];
    var s2 = geosounds.collection[self.sound_2];
    		    		    
    self.shape = new Kinetic.Line({
        points          : [s1.coords.x, s1.coords.y, s2.coords.x, s2.coords.y],
        stroke          : "#005fff",
        strokeWidth     : 0.25,
        lineCap         : "round",
        lineJoin        : "round"
    });
    connections.layer.add(self.shape);  
};


Connection.prototype.update = function()
{
    var self = this;

    var s1 = geosounds.collection[self.sound_1];
    var s2 = geosounds.collection[self.sound_2];

    self.shape.setPoints([ {x: s1.coords.x, y: s1.coords.y}, {x: s2.coords.x, y: s2.coords.y} ]);
};
})(jQuery);