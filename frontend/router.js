define(['jquery', 
        'backbone', 
        'views/local-sim',
        'views/remote-sim',
        'views/countdown'], 
        function($, Backbone, LocalSimulation, RemoteSimulation, Countdown){
  
  var EMNRouter = Backbone.Router.extend({
    routes: {
      'localsim': 'localSim',
      'remotesim': 'remoteSim',
      'suds': 'suds'
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

    suds: function() {
      this.init();
      this.view = new Countdown({el: $('body > .view-content')});
      this.view.render();
    }
  });
  
  return new EMNRouter();
});