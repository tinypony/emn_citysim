define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone', 
         'hbs!templates/remotesim/stoplist' ], 
    function($, JUI, _, amRef, Backbone, StopListTemplate) {

  var StopList = Backbone.View.extend({
    
    events: {
      'click .stop' : 'showStopStats' 
    },
    
    initialize: function(opts) {
      _.bindAll(this, ['showStopStats']);
      this.stops = opts.stops;
      
    },
    
    getStop: function(id) {
      return _.find(this.stops, function(stop) {
        return stop.id ===  id;
      });
    },
    
    showStopStats: function(ev) {
      var $tar = $(ev.currentTarget);
      $tar.addClass('active').siblings().removeClass('active')
      var stopId = $tar.attr('data-id');
      var timeseries = this.getStop(stopId).timeseries;
      timeseries = _.sortBy(timeseries, 'time');
      
      var chart = amRef.makeChart('stopchart', {
        'theme' : 'none',
        'type' : 'serial',
        'autoMargins' : false,
        'marginLeft' : 100,
        'marginRight' : 8,
        'marginTop' : 10,
        'marginBottom' : 70,
        'pathToImages' : 'http://www.amcharts.com/lib/3/images/',
        'dataProvider' : timeseries,
        'valueAxes' : [ {
          'id' : 'v1',
          'axisAlpha' : 0,
          'inside' : false,
          'min' : 0,
          'minimum' : 0,
          'max' : 2000,
          'maximum' : 2000,
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
    
    render: function() {
      this.$el.html(StopListTemplate({stops: this.stops}));
    }
  });
  
  return StopList;
});