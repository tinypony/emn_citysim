define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone', 
         'views/remote-sim/routes-viz',
         'views/remote-sim/simulation',
         'hbs!templates/remotesimcontainer' ], 
    function($, JUI, _, amRef, Backbone, RouteViz, Simulate, RemoteSimTemplate) {

  var RemoteSimulation = Backbone.View.extend({

    initialize : function(options) {

    },

    render : function() {
      this.$el.html(RemoteSimTemplate());
     // this.routeViz = new RouteViz({el: this.$('.routes-viz')});
     // this.routeViz.render();
      this.sim = new Simulate({el: this.$('.remote-sim')});
      this.sim.render();
    }
  });

  return RemoteSimulation;
});