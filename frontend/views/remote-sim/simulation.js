define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone', 
         'hbs!templates/remotesim/remotesim' ], 
    function($, JUI, _, amRef, Backbone, RemoteSimTemplate) {

  var RemoteSimulation = Backbone.View.extend({


    initialize : function(options) {
      _.bindAll(this, [ 'runSimulation' ]);
      this.simulationParams = {
          consumptionPerKm : 1,
          efficiency : 0.99,
          maxLength : 15000 
      }
    },

    runSimulation : function() {
      var self = this;
      
      var preSimulate = function() {
        self.$('.runbutton button').addClass('disabled');
        self.$('.statistics').hide();
        self.$('#chartdiv').empty();
      };
      
      var postSimulate = function() {
        self.$('.runbutton button').removeClass('disabled');
        self.$('.statistics').show();
      };
      
      preSimulate();
      
      $.get('/api/simulate', self.simulationParams).done(function(data) {

        postSimulate();
        var timeseries = _.map(data.timeseries, function(value, key) {
          return {
            power: value,
            time: key.substring(0, 2) + ':' + key.substring(2, 4)
          };
        });
        $('.energy-total').text(data.totalEnergy);
        timeseries = _.sortBy(timeseries, 'time');
        
        var chart = amRef.makeChart('chartdiv', {
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
            'max' : data.max * 1.1,
            'maximum' : data.max,
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
      });
    },

    render : function() {
      var self = this;
      this.$el.html(RemoteSimTemplate());
      this.$('#efficiency').text(this.simulationParams.efficiency);
      this.$('#consumption').text(this.simulationParams.consumptionPerKm);
      this.$('#routelen').val(this.simulationParams.maxLength);

      this.$('#efficiency-slider').slider({
        value : 1,
        min : 0.5,
        max : 1.0,
        step : 0.01,
        slide : function(event, ui) {
          $('#efficiency').text(ui.value);
          self.simulationParams.efficiency = ui.value;
        }
      });

      this.$('#consumption-slider').slider({
        value : 1,
        min : 0,
        max : 3.1,
        step : 0.1,
        slide : function(event, ui) {
          self.$('#consumption').text(ui.value);
          self.simulationParams.consumptionPerKm = ui.value;
        }
      });
      
      this.$('#routelen').change(function(){
        self.simulationParams.maxLength = $(this).val();
      });

      this.$('.runbutton button').click(this.runSimulation);
      this.runSimulation();
    }
  });

  return RemoteSimulation;
});