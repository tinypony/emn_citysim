define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'charge-simulator',
         'amcharts.serial', 
         'backbone',
         'hbs!templates/localsim'], 
         function($, JUI, _, ChargeSim, amRef, Backbone, LocalSimulationTemplate) {
  
  var LocalSimulation = Backbone.View.extend({
    
    defaultParams: {
        batteryCapacity : 40,
        consumptionPerKm : 1,
        chargingTime : 15,
        chargingTimeStd : 3,
        chargingPower : 400,
        totalDistance : 270,
        distanceBetweenCharges : 1
    },
    
    initialize: function(options) {
      _.bindAll(this, ['runSimulation']);
      this.sim = new ChargeSim();
    },
    
    runSimulation: function() {
      this.sim.setParameters(this.defaultParams);
      var results = this.sim.drive();
      
      if(results.isSuccess) {
        this.$('.runbutton .glyphicon').addClass('glyphicon-ok').removeClass('glyphicon-remove');
      } else {
        this.$('.runbutton .glyphicon').addClass('glyphicon-remove').removeClass('glyphicon-ok');
      }
      
      var chart = amRef.makeChart('chartdiv', {
        'theme' : 'none',
        'type' : 'serial',
        'autoMargins' : false,
        'marginLeft' : 70,
        'marginRight' : 8,
        'marginTop' : 10,
        'marginBottom' : 70,
        'pathToImages' : 'http://www.amcharts.com/lib/3/images/',
        'dataProvider' : results,
        'valueAxes' : [ {
          'id' : 'v1',
          'axisAlpha' : 0,
          'inside' : false,
          'min' : 0,
          'minimum' : 0,
          'max' : 100,
          'maximum' : 110,
          'gridAlpha' : 0.1,
          'title' : 'Battery level (%)'
        } ],
        'graphs' : [ {
          'useNegativeColorIfDown' : false,
          'balloonText' : '[[category]]<br><b>value: [[value]]</b>',
          'bullet' : 'round',
          'bulletBorderAlpha' : 1,
          'bulletBorderColor' : '#FFFFFF',
          'hideBulletsCount' : 50,
          'lineThickness' : 2,
          'lineColor' : '#0088cc',
          'valueField' : 'capacity'
        } ],
        'chartCursor' : {
          'valueLineEnabled' : true,
          'valueLineBalloonEnabled' : true
        },
        'categoryField' : 'traveled',
        'categoryAxis' : {
          'parseDates' : false,
          'axisAlpha' : 0,
          'gridAlpha' : 0,
          'maximum' : this.defaultParams.totalDistance,
          'max' : this.defaultParams.totalDistance,
          'minHorizontalGap' : 60,
          'title' : 'Distance traveled (km)'
        }
      });
    },
    
    render: function() {
        var self = this;
        this.$el.html(LocalSimulationTemplate());
        this.$('#capacity').text(this.defaultParams.batteryCapacity);
        this.$('#consumption').text(this.defaultParams.consumptionPerKm);
        this.$('#charging-time').val(this.defaultParams.chargingTime);
        this.$('#charging-time-std').val(this.defaultParams.chargingTimeStd);
        this.$('#charging-power').text(this.defaultParams.chargingPower);
        this.$('#charging-interval').text(this.defaultParams.distanceBetweenCharges);
        this.$('#total-distance').text(this.defaultParams.totalDistance);
        
        this.$('#capacity-slider').slider({
          value : 40,
          min : 0,
          max : 400,
          step : 10,
          slide : function(event, ui) {
            $('#capacity').text(ui.value);
            self.defaultParams.batteryCapacity = ui.value;
          }
        });
        
        this.$('#consumption-slider').slider({
          value : 1,
          min : 0,
          max : 3.1,
          step : 0.1,
          slide : function(event, ui) {
            self.$('#consumption').text(ui.value);
            self.defaultParams.consumptionPerKm = ui.value;
          }
        });
        
        this.$('#charging-time').keyup(function(){
          self.defaultParams.chargingTime = parseInt($(this).val());
        });
        
        this.$('#charging-time-std').keyup(function(){
          self.defaultParams.chargingTimeStd = parseInt($(this).val());
        });
        
        this.$('#charging-power-slider').slider({
          value : 300,
          min : 0,
          max : 800,
          step : 10,
          slide : function(event, ui) {
            self.$('#charging-power').text(ui.value);
            self.defaultParams.chargingPower = ui.value;
          }
        });
        
        this.$('#charging-interval-slider').slider({
          value : 1,
          min : 0.1,
          max : 20,
          step : 0.1,
          slide : function(event, ui) {
            self.$('#charging-interval').text(ui.value);
            self.defaultParams.distanceBetweenCharges = ui.value;
          }
        });
        
        this.$('#total-distance-slider').slider({
          value : 270,
          min : 0,
          max : 400,
          step : 1,
          slide : function(event, ui) {
            self.$('#total-distance').text(ui.value);
            self.defaultParams.totalDistance = ui.value;
          }
        });
        
        this.$('.runbutton button').click(this.runSimulation);
        this.runSimulation();
    }
  });
  
  return LocalSimulation;
});