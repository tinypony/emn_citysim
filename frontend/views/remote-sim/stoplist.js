define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone',
         'hbs!templates/remotesim/stoplist',
         'hbs!templates/remotesim/stop-route-list',
         'hbs!templates/remotesim/stops-combined'], 
         function($, JUI, _, amRef, Backbone,   StopListTemplate, RouteListTemplate, StopsCombined) {

  /**
   * Lists all the end stops
   * and shows per stop info on energy consumption
   */
  var StopList = Backbone.View
      .extend({

        events: {
          'click .stop': 'onStopClick'
        },

        initialize: function(opts) {
          _.bindAll(this, [ 'onStopClick' ]);
          this.singleStop = true;
          this.stops = opts.stops;
          this.includedStops = [];
        },

        getStop: function(id) {
          return _.find(this.stops, function(stop) {
            return stop.id === id;
          });
        },

        onStopClick: function(ev) {
          var $tar = $(ev.currentTarget);
          var $initialTarget = $(ev.target);
          
          $tar.addClass('active').siblings().removeClass('active')
          var stopId = $tar.attr('data-id');
          
          if($initialTarget.hasClass('include-stop')) {
            this.includeStop(stopId, $initialTarget.is(':checked'));
          } else {
            this.showSingleStop(stopId);
          }
        },
        
        showSingleStop: function(stopId) {
          var busstop = this.getStop(stopId)
          var timeseries = _.values(busstop.timeseries);
          timeseries = _.sortBy(timeseries, 'time');
          this.showPower(timeseries, 'stop-powerchart', 1100);
          this.showRoutes(busstop);
        },
        
        includeStop: function(stopId, included) {
          if(included) {
            this.includedStops.push(stopId);
          }
          else {
            this.includedStops = _.without(this.includedStops, stopId);
          }
          
          this.showCombined();
        },
        
        _combineTimeseries: function(stops) {
          var combinedTs = {};
         
          _.each(stops, function(stop){
           
            _.each(stop.timeseries, function(val, key) {
              
              if(!combinedTs[key]) {
                combinedTs[key] = {
                    time: key,
                    power: val.power
                }
              } else {
                combinedTs[key].power += val.power;
              }
            });
          });
          
          combinedTs = _.values(combinedTs);
          combinedTs = _.sortBy(combinedTs, 'time');
          return combinedTs;
        },
        
        showCombined: function() {
          var self = this;

          this.$('.combined').empty();
          if(this.includedStops.length >= 2) {
            var routes = {};
            var addedstops = _.filter(this.stops, function(stop){
              return _.contains(self.includedStops, stop.id);
            });
            
            _.each(addedstops, function(stop) {
              _.each(stop.leavingRoutes, function(route){
                if(!routes[route]) {
                  routes[route] = 1;
                } else {
                  routes[route] += 1;
                }
              });
            });
            
            var elroutes = [];
            var nonelroutes = [];
            
            _.each(routes, function(val, key) {
              if(val == 2) {
                elroutes.push(key);
              } else {
                nonelroutes.push(key);
              }
            });
            
            this.$('.combined').html(StopsCombined({
              elroutes: elroutes,
              routes: nonelroutes
            }));
            
            var ts = this._combineTimeseries(addedstops);
            console.log(ts);
            this.showPower(ts, 'combinedchart', 1500);
          }
        },

        showPower: function(timeseries, chartid, max) {
          amRef.makeChart(chartid, {
            'theme': 'none',
            'type': 'serial',
            'autoMargins': false,
            'marginLeft': 100,
            'marginRight': 8,
            'marginTop': 10,
            'marginBottom': 70,
            'pathToImages': 'http://www.amcharts.com/lib/3/images/',
            'dataProvider': timeseries,
            'valueAxes': [ {
              'id': 'v1',
              'axisAlpha': 0,
              'inside': false,
              'min': 0,
              'minimum': 0,
              'max': max,
              'maximum': max,
              'gridAlpha': 0.1,
              'title': 'Power use (kW)'
            } ],
            'graphs': [ {
              'useNegativeColorIfDown': false,
              'balloonText': '[[category]]<br><b>value: [[value]]</b>',
              'bullet': 'round',
              'bulletBorderAlpha': 1,
              'bulletBorderColor': '#FFFFFF',
              'hideBulletsCount': 50,
              'lineThickness': 1,
              'lineColor': '#0088cc',
              'valueField': 'power'
            } ],
            'chartCursor': {
              'valueLineEnabled': true,
              'valueLineBalloonEnabled': true
            },
            'categoryField': 'time',
            'categoryAxis': {
              'parseDates': false,
              'axisAlpha': 0,
              'gridAlpha': 0,
              'title': 'Time'
            }
          });
        },

        showRoutes: function(stop) {

          this.$('.stop-stats').html(RouteListTemplate({
            inroutes: stop.comingRoutes,
            outroutes: stop.leavingRoutes
          }));

        },

        render: function() {
          this.$el.html(StopListTemplate({
            stops: this.stops
          }));
        }
      });

  return StopList;
});