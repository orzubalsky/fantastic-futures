(function(){

    window.DetailApp = Backbone.View.extend({
        events: {
           'click .home': 'home'
        },

        home: function(e){
           this.trigger('home');
           e.preventDefault();
        },

        render: function(){
           $(this.el).html(ich.detailApp(this.model.toJSON()));
           return this;
        }                                        
    });
    

    window.ListApp = Backbone.View.extend({
        el: "#container",

        rethrow: function(){
            this.trigger.apply(this, arguments);
        },

        render: function(){
            $(this.el).html(ich.listApp({}));
            var list = new ListView({
                collection: this.collection,
                el: this.$('#tweets')
            });
            list.addAll();
            list.bind('all', this.rethrow, this);
            new InputView({
                collection: this.collection,
                el: this.$('#input')
            });
        }        
    });
    
    
    /*
     * 
     * ROUTER 
     *
     */
     window.Router = Backbone.Router.extend({
         routes: {
             '': 'list',
             'constellation/:constellation_slug/': 'constellation_detail'
         },

         navigate_to: function(model){
             var path = (model && model.get('id') + '/') || '';
             this.navigate(path, true);
         },

         constellation_detail: function(){},

         list: function(){}
     });
     
     
     
     $(function()
     {
        window.app = window.app || {};
        
        app.router          = new Router();
        app.constellations  = new Constellations();
        
        app.list = new ListApp(
        {
            el          : $("#container"),
            collection  : app.constellations
        });
        
        app.detail = new DetailApp(
        {
            el          : $("#container")
        });

        app.router.bind('route:list', function()
        {
            app.constellations.maybeFetch({
                success: _.bind(app.list.render, app.list)                
            });
        });
        app.router.bind('route:constellation_detail', function(id)
        {
            app.constellations.getOrFetch(app.constellations.url + id + '/', {
                success: function(model){
                    app.detail.model = model;
                    app.detail.render();                    
                }
            });
        });

        Backbone.history.start({
            pushState: true, 
            silent: app.loaded
        });
    });         
            
})();