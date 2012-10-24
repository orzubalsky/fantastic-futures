;(function($){
var ffinterface = window.ffinterface = new function() 
{
    this.running = false;           // represents the high level state of the entire interface
    this.frameRate;                 // refresh rate
    this.width;                     // window width
    this.height;                    // window height
    this.stage;                     // kineticJS stage 
	this.search_results = { 'Geosounds': [], 'Constellations': [] }; 
	this.images;
	this.frame = 0;

    /* set up the interface and run it */
    this.init = function()
    {
        var self = this;
        
	    self.width  = $('#interface').width();
	    self.height = $('#interface').height();            
        
        var sources = {
            playhead_fill : STATIC_URL + 'images/stripes_5.png',
            loading_gif   : STATIC_URL + 'images/loading_greystripes.gif'
        };
        
        // first load images, then init kineticJS shapes and everything else
        self.loadImages(sources, function(images) 
        {
            // assign the loaded images to the interface scope
            self.images = images;

            // initialize all components
            self.setup();            

            // Set framerate to 30 fps
            self.framerate = 1000/30;

            // run update-draw loop
            setInterval(function() { self.update(); self.draw(); }, self.framerate);

            setTimeout(function() 
            {
                pov.randomize();
                self.running = true;                    
            }, 100);
        });
    };

    this.setup = function()
    {   
        var self = this;
        
        self.stage = new Kinetic.Stage({container: "interface", width: self.width, height: self.height });

        playhead.init();            
        pov.init();
        geosounds.init();
        connections.init();
                                
        $("#loadingGif").fadeToggle("fast", "linear");
    };

    this.update = function()
    {              
        this.frame += 1;

        // clear all layers
        this.clear();
        
        pov.update();
        playhead.update();
        geosounds.update();
        connections.update();
    };

    this.draw = function()
    {        
        geosounds.draw();
        connections.draw();
        playhead.draw();
    };

    this.clear = function()
    {
        geosounds.clear();
        connections.clear();
        playhead.clear();
    };

    this.loadImages = function(sources, callback) 
    {
        var images = {};
        var loadedImages  = 0;
        var numImages     = 0;

        // get num of sources
        for(var src in sources) 
        {
            numImages++;
        }

        for(var src in sources) 
        {   
            images[src] = new Image();
            images[src].onload = function() 
            {
                if (++loadedImages >= numImages) 
                {
                    callback(images);
                }
            };
            images[src].src = sources[src];
        }
    };
};
})(jQuery);	