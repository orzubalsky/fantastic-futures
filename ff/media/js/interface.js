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
    this.play_radio = DO_PLAY_RADIO;

    /* set up the interface and run it */
    this.init = function()
    {
        var self = this;
        
        // get the dimensions of the canvas elements that render the interface
	    self.width  = $('#interface').width();
	    self.height = $('#interface').height();            
        
        // an array of static images that have to be loaded before anything else happens
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

            // after 100ms, rotate the interface randomly
            setTimeout(function() 
            {
                if (self.play_radio)
                {
                    console.log(radio);
                    radio.init();
                }
                else
                {
                    pov.randomize();    
                }
                
                self.running = true;                    
            }, 100);
        });
    };

    /* this function is called once before the update-draw loop starts (open frameworks style) */
    this.setup = function()
    {   
        var self = this;
        
        // create a kineticJS stage that will hold all layers (pov, geosounds, connections, playhead)
        self.stage = new Kinetic.Stage({container: "interface", width: self.width, height: self.height });

        // do all necessary setting up for each module
        playhead.init();
        pov.init();
        geosounds.init();
        connections.init();

        // hide loading gif
        $("#loadingGif").fadeToggle("fast", "linear");
    };

    /* do all position calculations, and position related calculations here */
    this.update = function()
    {
        // clear all kineticJS layers
        this.clear();
        
        // update each module
        pov.update();
        playhead.update();
        geosounds.update();
        connections.update();
    };

    /* draw the kineticJS shapes */
    this.draw = function()
    {
        geosounds.draw();
        connections.draw();
        playhead.draw();
    };

    /* clear the kineticJS layers. this should be called before updating positions, etc */
    this.clear = function()
    {
        geosounds.clear();
        connections.clear();
        playhead.clear();
    };

    /* load images from given sources, and execute a callback function when done */
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