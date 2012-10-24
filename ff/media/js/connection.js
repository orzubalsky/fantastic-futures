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
    this.setup();    
};

Connection.prototype.setup = function()
{
    var s1 = geosounds.collection[this.sound_1];
    var s2 = geosounds.collection[this.sound_2];
    
    // change variable to reflect the sounds are connected
    s1.isConnected = true;
    s2.isConnected = true;    
    		    		    
    this.shape = new Kinetic.Line({
        points          : [s1.coords.x, s1.coords.y, s2.coords.x, s2.coords.y],
        stroke          : "#005fff",
        strokeWidth     : 0.25,
        lineCap         : "round",
        lineJoin        : "round"
    });
    connections.layer.add(this.shape);  
};

Connection.prototype.update = function()
{
    var s1 = geosounds.collection[this.sound_1];
    var s2 = geosounds.collection[this.sound_2];

    this.shape.setPoints([ {x: s1.coords.x, y: s1.coords.y}, {x: s2.coords.x, y: s2.coords.y} ]);
};
})(jQuery);