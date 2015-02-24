define([ 'jquery', 
         'underscore', 
         'backbone', 
         'mapbox', 
         'mocks',
         'scroller',
         'api-config', 
         'bootstrap',
         'views/routes-overview/endstop-details',
         'hbs!templates/routes-overview',
         'hbs!templates/routes-overview/endstop-popup'], 
         function($, _, Backbone, Mapbox, Mocks, scroller,
             ApiConfig, bootstrap, EndStopDetails, template, endstopPopupTemplate) {

  var RoutesOverview = Backbone.View.extend({
    events: {
      'mouseover .accordion-toggle': 'displayRoute',
      'mouseout .accordion-toggle': 'onMouseout'
    },
    
    initialize : function(optimize) {
      this.drawnRoutes = {};
      var self = this;
      $.get('/api/routes').done(function(data){
        self.data = data;
        self.render();
      });
    },

    getRoutes : function() {
      
      return _.filter(this.data, function(route){
        var stop = _.find(route.stats, function(stat){
          return stat.date === '2015-2-19';
        });
        
        if(!stop) {
          return false;
        } else {
          return stop.frequencyRatio > 100;
        }
      });
    },
    
    
    onMouseout: function(ev) {
      $target = $(ev.currentTarget);
      var routeName = $target.attr('data-route');
      this.highlightRoute(routeName, false);
    },
    
    highlightRoute: function(routeName, isHighlighted) {
      var style;
      if(isHighlighted) {
        style = { color: 'steelblue', opacity: 1 };
      } else {
        style = { color: 'grey', opacity: 0.5 };
      }
      this.drawnRoutes[routeName].setStyle(style);
    },
    
    unhighlightAllRoutes: function() {
      var self = this;
      _.each(_.keys(this.drawnRoutes), function(routeName){
        self.highlightRoute(routeName, false);
      })
    },
    
    displayData: function(routes) {
      var endStops = {};
      var self = this;
      
      var createMarker = function(stop) {
        var routesWithEndStop = _.filter(self.getRoutes(), function(route){
          return _.first(route.stops).id === stop.id || _.last(route.stops).id === stop.id;
        });
        
        var marker = L.marker([stop.posY, stop.posX]);
        marker.bindPopup(endstopPopupTemplate({
          stopname: stop.name,
          routes: routesWithEndStop
        }));
        marker.addTo(self.map);
        endStops[stop.id] = marker;
        
        marker.on('click', function(e) {
          self.map.panTo(e.latlng);
          self.endStopDetails.setData(Mocks.getEndStopData());
          self.endStopDetails.show();
        });
        
        marker.on('mouseover', function(e) {
          _.each(routesWithEndStop, function(routeFound) {
            self.highlightRoute(routeFound.name, true);
          });          
          
          e.target.openPopup();
        });
        
        marker.on('mouseout', function(e) {
          self.unhighlightAllRoutes();
          e.target.closePopup();
        });
      };
      
      var drawRoute = function( route, fitToMap ) {        
        var polyline = L.polyline( _.map(route.stops, function(stop){
          return L.latLng(stop.posY, stop.posX);
        }), {color: 'grey'}).addTo(self.map);

        self.drawnRoutes[route.name] = polyline;
      }
      
      _.each(routes, function(route) {
        var first = _.first(route.stops);
        var last = _.last(route.stops);
        
        drawRoute(route);
        
        if(_.isUndefined(endStops[first.id])) {
          createMarker(first);
        }
        
        if(_.isUndefined(endStops[last.id])) {
          createMarker(last);
        }
      });
    },
    
    displayRoute: function(ev) {
      $target = $(ev.currentTarget);
      var routeName = $target.attr('data-route');
      this.highlightRoute(routeName, true);
    },

    render : function() {
      this.$el.html(template({
        routes : this.getRoutes()
      }));
      
      this.$('#accordion2').collapse();
      this.endStopDetails = new EndStopDetails({el: this.$('.endstop-details')});
      this.endStopDetails.render();
      this.showMap();
      this.displayData(this.getRoutes());
    },

    showMap : function() {
      L.mapbox.accessToken = ApiConfig.tokens.mapbox;
      this.map = L.mapbox.map('map', 'tinypony.l8cdckm5').setView([ 59.914, 10.748 ], 12);
    }

  });

  return RoutesOverview;
});