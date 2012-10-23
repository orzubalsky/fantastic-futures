;(function($){
	var ffinterface = window.ffinterface = new function() 
	{
	    this.running = false;           // represents the high level state of the entire interface
	    this.frameRate;                 // refresh rate
	    this.width;                     // window width
	    this.height;                    // window height
	    this.lastClick       = -1;      // holds the sound shape object that was clicked on last
        this.stage;                     // kineticJS stage 
		this.addButton = 0;             // this is used to check whether the "save constellation" appeared
		this.search_results = { 'Geosounds': [], 'Constellations': [] }; 
		this.justAddedCountdown = 0;
		this.images;

        /* set up the interface and run it */
        this.init = function()
        {
            var self = this;
            
    	    self.width              = $('#interface').width();
    	    self.height             = $('#interface').height();            
            
            var sources = {
                playhead_fill   : STATIC_URL + 'images/stripes_5.png',
                loading_gif     : STATIC_URL + 'images/loading_greystripes.gif'
            };
            
            // first load images, then init kineticJS shapes and everything else
            self.loadImages(sources, function(images) 
            {
                // assign the loaded images to the interface scope
                self.images = images;

                self.setup();            

                // Set framerate to 30 fps
                self.framerate = 1000/30;

                // run update-draw loop
                setInterval(function() { self.update(); self.draw(); }, self.framerate);

                setTimeout(function() 
                {
                    pov.randomize();
                    self.running = true;                    
                }, 400);
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
        }


        this.update = function()
        {      
            var self = this;

            // clear all layers
            self.clear();
            
            // update point of view according to rotation and zoom
            pov.update();
            
            // update playhead position
            playhead.update();
            
            geosounds.update();
            
            // update state of each connection
            connections.update();
        }
        
        this.clear = function()
        {
            var self = this;

            geosounds.clear();
            connections.clear();
            playhead.clear();
        };


        this.draw = function()
        {
            var self = this;
            
            geosounds.draw();
            connections.draw();
            playhead.draw();
        };


        this.loadImages = function(sources, callback) 
        {
            var self = this;

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


        this.map = function(value, istart, istop, ostart, ostop, confine) 
        {
           var result = ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
           if (confine)
           {
               result = (result > ostop) ? ostop : result;
               result = (result < ostart) ? ostart : result;
           }
           return result;
        }
	};
})(jQuery);	