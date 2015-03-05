define([ 'jquery', 
         'underscore', 
         'backbone', 
         'mapbox',
         'api-config',
         'chroma',
         'hbs!templates/routes-overview/endstop-popup'], 
         function($, _, Backbone, Mapbox, ApiConfig, chroma, endstopPopupTemplate) {
  var MapView = Backbone.View.extend({
    initialize: function() {

    },
    
    getRouteStyle: function(rank, isHighlighted) {
      if(isHighlighted) {
        return {color: 'steelblue', opacity: 1};
      } else {
        return {color: this.scale(rank), opacity: 0.5};
      }
    },
    
    highlightRoute: function(route, isHighlighted) {
      var polyline, style, routeName;
      if(_.isString(route)) {
        polyline = this.drawnRoutes[route];
        routeName = route;
      } else {
        polyline = route;
        routeName = route.userData.route.name;
      }
      
      var routeObj = _.find(this.routes, function(r){
        return r.name === routeName;
      });
      
      style = this.getRouteStyle(routeObj.dayStats.rank, isHighlighted);
      polyline.setStyle(style);
      polyline.bringToFront(); 
    },
    
    unhighlightAllRoutes: function() {
      var self = this;
      _.each(_.keys(this.drawnRoutes), function(routeName){
        self.highlightRoute(routeName, false);
      })
    },
    
    resetMap: function(){
      var self = this;
      _.each(this.endStops, function(stopMarker){
        self.map.removeLayer(stopMarker);
      });
      
      _.each(this.drawnRoutes, function(routeLayer){
        self.map.removeLayer(routeLayer);
      });
      

      this.endStops = {};
      this.drawnRoutes = {};
    },
    
    displayData: function(routes, rankDomain) {
      this.resetMap();
      this.routes = routes;
      
      var self = this;
      
      this.scale = chroma.scale(['darkorange', 'green'])
      .domain([rankDomain.min, rankDomain.max], 3);
      
      var createMarker = function(stop) {
        var routesWithEndStop = _.filter(routes, function(route){
          return _.first(route.stops).id === stop.id || _.last(route.stops).id === stop.id;
        });
        
        var marker = L.marker([stop.posY, stop.posX]);
        marker.bindPopup(endstopPopupTemplate({
          stopname: stop.name,
          routes: routesWithEndStop
        }));
        
        marker.addTo(self.map);
        self.endStops[stop.id] = marker;
        
        marker.on('click', function(e) {
          self.map.panTo(e.latlng);
          self.trigger('show:endstop', stop.id);
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
        var coordinates = _.map(route.stops, function(stop){
          return L.latLng(stop.posY, stop.posX);
        });
        
        var polyline = L.polyline( coordinates, self.getRouteStyle(route.dayStats.rank, false))
        .addTo(self.map);
        
        polyline.userData = {
            route: route
        };
        
        polyline.on('mouseover', function(e){
          self.highlightRoute(e.target, true);
        });
        
        polyline.on('mouseout', function(e){
          self.highlightRoute(e.target, false);
        });
        
        self.drawnRoutes[route.name] = polyline;
      }
      
      _.each(routes, function(route) {
        var first = _.first(route.stops);
        var last = _.last(route.stops);
        
        drawRoute(route);
        
        if(_.isUndefined(self.endStops[first.id])) {
          createMarker(first);
        }
        
        if(_.isUndefined(self.endStops[last.id])) {
          createMarker(last);
        }
      });
    },
    
    render: function() {
      L.mapbox.accessToken = ApiConfig.tokens.mapbox;
      this.map = L.mapbox.map('map', 'tinypony.l8cdckm5').setView([ 59.914, 10.748 ], 12);
    }
  });
  
  return MapView;
});
