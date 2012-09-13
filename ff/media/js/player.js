;(function($){
	site.Player = function(id, index, file, volume)
	{
	    this.id = id,
	    this.index = index,
		this.file = MEDIA_URL + file,
		this.volume = volume;
	    this.playerId = 'player' + index + '_' + id;
	    this.$player = $('#' + this.playerId);
	    this.loaded;
	    this.interval;	    
	};

	site.Player.prototype.init = function()
	{
		var self = this;
		
		$('#players').append('<li id="' + self.playerId + '"></li>');
		
       	$('#'+self.playerId).jPlayer( {
            ready: function () {
              $(this).jPlayer("setMedia", {
                mp3: self.file
              }).jPlayer('play').jPlayer('stop');
            },
            swfPath: MEDIA_URL + 'js/lib',
            volume: self.volume,
            preload: 'auto',
            backgroundColor: 'transparent',
            supplied: 'mp3',
        });
	};
	
	site.Player.prototype.updateVolume = function(volume)
	{
		var self = this;
		self.volume = volume;
		$('#'+self.playerId).jPlayer('volume', self.volume);
	};	
		
	site.Player.prototype.updatePlayhead = function(position)
	{
		var self = this;
		$('#'+self.playerId).jPlayer('playHead', position);
	};	
	
	site.Player.prototype.play = function()
	{
		var self = this;
		$('#'+self.playerId).jPlayer('play');
	};
	
	site.Player.prototype.stop = function()
	{
		var self = this;
		$('#'+self.playerId).jPlayer('stop');
	};	
	
	site.Player.prototype.pause = function()
	{
		var self = this;
		$('#'+self.playerId).jPlayer('stop');
	};		
	
	site.Player.prototype.destroy = function()
	{
		var self = this;
		$('#'+self.playerId).jPlayer('destory');
	};		
	
})(jQuery);