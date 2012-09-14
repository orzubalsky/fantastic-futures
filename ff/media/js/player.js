;(function($){
	site.Player = function(id, index, file, volume)
	{
	    this.id = id,
	    this.index = index,
		this.file = MEDIA_URL + file,
		this.volume = volume;
	    this.playerId = 'player_' + index + '_' + id;
	    this.$player;
	    this.loaded;
	    this.interval;	    
	};

	site.Player.prototype.init = function()
	{
		var self = this;

		$('#container').append('<div id="' + self.playerId + '"></div>');
	    self.$player = $('#' + self.playerId);
		
        self.$player.jPlayer({
    		ready: function () {
    			$(this).jPlayer("setMedia", {
    				mp3: self.file
    			});
    		},
            volume: self.volume,    		
    		swfPath: MEDIA_URL + "js/lib",
    		solution: "flash, html",
    		supplied: "mp3",
            preload: 'auto',    		
    		wmode: "window"
    	});        
        
	};
	
	site.Player.prototype.updateVolume = function(volume)
	{
		var self = this;
		self.volume = volume;
		self.$player.jPlayer('volume', self.volume);
	};	
		
	site.Player.prototype.updatePlayhead = function(position)
	{
		var self = this;
		self.$player.jPlayer('playHead', position);
	};	
	
	site.Player.prototype.play = function()
	{
		var self = this;
        self.$player.jPlayer("playHead", 0).jPlayer("play");		
	};
	
	site.Player.prototype.stop = function()
	{
		var self = this;
	    self.$player.jPlayer('stop');
	};	
	
	site.Player.prototype.pause = function()
	{
		var self = this;
		self.$player.jPlayer('pause');
	};		
	
	site.Player.prototype.destroy = function()
	{
		var self = this;
		self.$player.jPlayer('destory');
	};		
	
})(jQuery);