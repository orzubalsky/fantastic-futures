;(function($){
Player = function(id, index, file, volume)
{
    this.id = id,
    this.index = index,
    this.file = STATIC_URL + file,
    this.volume = volume;
    this.playerId = 'player_' + index + '_' + id;
    this.$player;
    this.loaded;
    this.interval;
};

Player.prototype.init = function()
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
        swfPath: STATIC_URL + "js/lib",
        solution: "flash, html",
        supplied: "mp3",
        preload: 'auto',
        wmode: "window"
    });
};

Player.prototype.updateVolume = function(volume)
{
    var self = this;
    self.volume = volume;
    self.$player.jPlayer('volume', self.volume);
};

Player.prototype.updatePlayhead = function(position)
{
    var self = this;
    self.$player.jPlayer('playHead', position);
};

Player.prototype.play = function()
{
    var self = this;
    self.$player.jPlayer("play");
};

Player.prototype.stop = function()
{
    var self = this;
    self.$player.jPlayer('stop');
};

Player.prototype.pause = function()
{
    var self = this;
    self.$player.jPlayer('pause');
};

Player.prototype.destroy = function()
{
    var self = this;
    self.$player.jPlayer('destory');
};
})(jQuery);