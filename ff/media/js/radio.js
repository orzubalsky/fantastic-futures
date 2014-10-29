;(function($){
var radio = window.radio = new function() 
{

    this.init = function()
    {        
        var self = this;
 
        self.play_sequence();
    };

    this.play_sequence = function()
    {        
        var self = this;

        playhead.is_playing = false;
        playhead.clear();
        playhead.shape.setRadius(0);


        // 1. wait 2 seconds before starting
        setTimeout(function()
        {
            // 2. show map
            pov.resetRotation(function()
            {
                constellations.clear();

                setTimeout(function()
                {
                    // 3. hide map
                    map.hide();

                    setTimeout(function()
                    {   
                        // 4, play constellation
                        self.random_constellation();
                        self.rotate_and_play_constellation();

                        setTimeout(function()
                        {
                            self.play_sequence();
                        }, 1 * 60 * 1000);

                    }, 500);
                }, 4000);                
            });
        }, 2000);
    };

    this.random_constellation = function()
    {
        // 3. create constellation
        // randomize sound indexes
        console.log('geosounds.map_points_count', geosounds.map_points_count);

        var max_sounds_in_constellation = (geosounds.map_points_count < 4) ? geosounds.map_points_count: 4;
        console.log('max_sounds_in_constellation', max_sounds_in_constellation);
        
        var total_sounds_in_constellation = lib.random(max_sounds_in_constellation-1, 2);
        console.log('total_sounds_in_constellation', total_sounds_in_constellation);

        var sound_indexes = [];

        while(sound_indexes.length < total_sounds_in_constellation)
        {
            var random_index = lib.random(geosounds.map_points_count, 0);
            var found=false;
          
            for(var i=0;i<sound_indexes.length;i++)
            {
                if(sound_indexes[i]==random_index)
                {
                    found=true;
                    break;
                }
            }
            if(!found)
            {
                sound_indexes[sound_indexes.length] = random_index;
            }
        }
        console.log(sound_indexes);

        // create an array with sound ids
        sound_ids = [];
        for (var i=0; i<sound_indexes.length; i++)
        {
            var index = sound_indexes[i];
            // console.log('index', index);

            var sound_id = geosounds.map_points[index].id;
            // console.log('sound_id', sound_id);

            sound_ids.push(sound_id);
            // console.log(sound_ids);
        }


        // create connections
        for (var i=0; i<total_sounds_in_constellation-1;i++)
        {
            var s1 = sound_ids[i];
            console.log('s1', s1);

            var s2 = sound_ids[i+1];
            console.log('s2', s2);

            connections.add(s1, s2, false);
        }
    };

    this.rotate_and_play_constellation = function()
    {
        // rotate to orientation
        var rotation = pov.random_rotation();

        pov.rotateTo(rotation.x, rotation.y, rotation.z, rotation.zoom, 12, function() 
        {
            // play constellation for 3 minutes
            constellations.loadedConstellationCallback();
        });           
    };

};
})(jQuery);