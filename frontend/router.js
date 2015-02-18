define(['jquery', 
        'backbone', 
        'views/local-sim',
        'views/remote-sim',
        'views/endstop-viz',
        'views/route-select'], 
        function($, Backbone, LocalSimulation, RemoteSimulation, EndStopView, RouteSelectionView){
  
  var EMNRouter = Backbone.Router.extend({
    routes: {
      'localsim': 'localSim',
      'remotesim': 'remoteSim',
      'routes': 'routes',
      'routeselect': 'routeSelect'
    },
    
    init: function() {
      if(this.view) {
        this.view.remove();
      }
      
      $('body').append('<div class="view-content"></div>');
    },

    localSim: function() {
      this.init();
      this.view = new LocalSimulation({el: $('body > .view-content')});
      this.view.render();
    },
    
    remoteSim: function() {
      this.init();
      this.view = new RemoteSimulation({el: $('body > .view-content')});
      this.view.render();
    },
    
    routes: function() {
      this.init();
      this.view = new EndStopView({el: $('body > .view-content')});
     // this.view.render();
    },
    
    routes: function() {
      this.init();
      this.view = new RouteSelectionView({el: $('body > .view-content')});
      this.view.render();
    }
  });
  
  return new EMNRouter();
});