(function(){
    console.log(Backbone);
    
    window.Constellation = Backbone.RelationalModel.extend({
        url: function(){
            return this.get('resource_uri') || this.collection.url;
        },
                
        relations: [{
            type            : Backbone.HasMany,
            key             : 'connections',
            relatedModel    : 'Connection',
            collectionType  : 'ConnectionCollection',
            reverseRelation : {
                key: 'inConstellation',
                includeInJSON: 'id'
            }
        }]
    });

    window.Constellations = Backbone.Collection.extend({
        model   : Constellation,
        url     : '/api/v1/constellation/',       
        parse   : function(data) 
        {
            return data.objects;
        },
        maybeFetch: function(options)
        {
            // Helper function to fetch only if this collection has not been fetched before.
            if(this._fetched)
            {
                // If this has already been fetched, call the success, if it exists
                options.success && options.success();
                return;
            }

            // when the original success function completes mark this collection as fetched
            var self = this,
                successWrapper = function(success){
                    return function(){
                        self._fetched = true;
                        success && success.apply(this, arguments);
                    };
                };
            options.success = successWrapper(options.success);
            this.fetch();
        },
        getOrFetch: function(id, options){
            // Helper function to use this collection as a cache for models on the server
            var model = this.get(id);

            if(model){
                options.success && options.success(model);
                return;
            }

            model = new Tweet({
                resource_uri: id
            });

            model.fetch(options);
        },                                                   
    });
    
    window.ConstellationView = Backbone.View.extend({
        tagName: 'a',

        render: function()
        {
          $(this.el).html('<a href="">123</a>')
          return this;
        }                                        
    });
})();