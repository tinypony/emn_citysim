define(['jquery', 
        'backbone', 
        'views/local-sim',
        'views/remote-sim',
        'views/endstop-viz',
        'views/routes-viz',
        'views/route-select',
        'views/routes-overview'], 
        function($, Backbone, LocalSimulation, RemoteSimulation, 
            EndStopView, RouteStatsView, RouteSelectionView, RoutesOverview){
  
  var EMNRouter = Backbone.Router.extend({
    routes: {
      'localsim': 'localSim',
      'remotesim': 'remoteSim',
      'routesviz': 'routesVisualization',
      'routestats': 'routeStats',
      'select': 'routeSelect',
      'overview': 'routesOverview'
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
    
    routesVisualization: function() {
      this.init();
      this.view = new EndStopView({el: $('body > .view-content')});
     // this.view.render();
    },
    
    routeStats: function() {
      this.init();
      this.view = new RouteStatsView({el: $('body > .view-content')});
    },
    
    routeSelect: function() {
      this.init();
      this.view = new RouteSelectionView({el: $('body > .view-content')});
      this.view.render();
    },
    
    routesOverview: function() {
      this.init();
      this.view = new RoutesOverview({el: $('body > .view-content')});
      this.view.render();
    }
    
  });
  
  return new EMNRouter();
});