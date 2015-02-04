define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone', 
         'hbs!templates/remotesim/routeviz' ], 
    function($, JUI, _, amRef, Backbone, RouteVizTemplate) {

  var RouteVizualization = Backbone.View.extend({


    initialize : function(options) {
      
    },

    loadRoutes : function() {
      var self = this;
      
      $.get('/api/routes').done(function(data) {
        
        var chart = amRef.makeChart('route-diagram', {
          'theme' : 'none',
          'type' : 'serial',
          'autoMargins' : false,
          'marginLeft' : 100,
          'marginRight' : 8,
          'marginTop' : 10,
          'marginBottom' : 70,
          'pathToImages' : 'http://www.amcharts.com/lib/3/images/',
          'dataProvider' : data,
          
          'valueAxes' : [ {
            'id' : 'v1',
            'axisAlpha' : 0,
            'inside' : false,
            'min' : 0,
            'minimum' : 0,
            'max' : 70000,
            'maximum' : 70000,
            'gridAlpha' : 0.1,
            'title' : 'Route length (meters)'
          } ],
          'graphs' : [ {
            'useNegativeColorIfDown' : false,
            'balloonText' : '[[category]]<br><b>value: [[value]]</b>',
            'bullet' : 'round',
            'bulletBorderAlpha' : 1,
            'bulletBorderColor' : '#FFFFFF',
            'hideBulletsCount' : 50,
            'lineThickness' : 1,
            'lineColor' : '#0088cc',
            'type' : 'column',
            'valueField' : 'routeLength'
          } ],
          'chartCursor' : {
            'valueLineEnabled' : false,
            'valueLineBalloonEnabled' : false,
            'cursorAlpha': 1
          },
          'categoryField' : 'route',
          'categoryAxis' : {
            'parseDates' : false,
            'axisAlpha' : 0,
            'gridAlpha' : 0,
            'title' : 'Routes',
            'labelsEnabled' : false
          }
        });
      });
    },

    render : function() {
      var self = this;
      this.$el.html(RouteVizTemplate());
      this.loadRoutes();      
    }
  });

  return RouteVizualization;
});