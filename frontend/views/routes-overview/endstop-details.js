define([ 'jquery', 
         'underscore', 
         'backbone', 
         'amcharts.serial',
         'hbs!templates/routes-overview/endstop-details' ], 
         function($, _, Backbone, amRef, template) {
  var EndStop = Backbone.View.extend({
    
    initialize: function(options){
      
    },
    
    setData: function(data){
      this.data = data;
    },
    
    show: function() {
      this.$el.show();
      
      var chart = amRef.makeChart('power-chart', {
        'theme' : 'none',
        'type' : 'serial',
        'autoMargins' : false,
        'marginLeft' : 100,
        'marginRight' : 8,
        'marginTop' : 10,
        'marginBottom' : 70,
        'pathToImages' : 'http://www.amcharts.com/lib/3/images/',
        'dataProvider' : this.data,
        'valueAxes' : [ {
          'id' : 'v1',
          'axisAlpha' : 0,
          'inside' : false,
          'min' : 0,
          'minimum' : 0,
          'max' : 600,
          'maximum' : 600,
          'gridAlpha' : 0.1,
          'title' : 'Power use (kW)'
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
          'valueField' : 'power'
        } ],
        'chartCursor' : {
          'valueLineEnabled' : true,
          'valueLineBalloonEnabled' : true
        },
        'categoryField' : 'time',
        'categoryAxis' : {
          'parseDates' : false,
          'axisAlpha' : 0,
          'gridAlpha' : 0,
          'title' : 'Time'
        }
      });
    },
    
    hide: function() {
      this.$el.hide();
    },
    
    render: function() {
      this.$el.html(template());
    }
    
  });
  
  return EndStop;
});