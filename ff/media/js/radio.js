;(function($){
var radio = window.radio = new function() 
{

    this.init = function()
    {        
        var self = this;

        // setInterval(function()
        // {
        //     self.play_sequence();
        // }, 1000);

        self.play_sequence();
    };

    this.play_sequence = function()
    {        
        constellations.clear();

        // 1. show map
        // pov.resetRotation();

        // 2. hide map
        // map.hide();

        // console.log(geosounds.collection);
        // console.log(geosounds.map_points);

        // 3. create constellation
        // randomize sound indexes
        var max_sounds_in_constellation = (geosounds.map_points_count < 4) ? geosounds.map_points_count: 4;
        // console.log('max_sounds_in_constellation', max_sounds_in_constellation);
        
        var total_sounds_in_constellation = lib.random(max_sounds_in_constellation-1, 2);
        // console.log('total_sounds_in_constellation', total_sounds_in_constellation);

        var sound_indexes = [];

        for (var i=0; i<total_sounds_in_constellation; i++)
        {
            // console.log('i', i);

            var random_index = lib.random(geosounds.map_points_count, 0);
            // console.log('random_index', random_index);

            //while (!random_index in sound_ids)
            //{
                sound_indexes.push(random_index);
                // console.log(sound_indexes);
            //}
        }

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


        // 3.2. create connections
        for (var i=0; i<total_sounds_in_constellation-1;i++)
        {
            var s1 = sound_ids[i];
            // console.log('s1', s1);

            var s2 = sound_ids[i+1];
            // console.log('s2', s2);

            connections.add(s1, s2, false);
        }

        // 3.2. rotate to orientation
        var rotation = pov.random_rotation();

        pov.rotateTo(rotation.x, rotation.y, rotation.z, rotation.zoom, 12, function() 
        {
            // 4. play constellation for 3 minutes
            constellations.loadedConstellationCallback();
        });                
         
    };

};
})(jQuery);