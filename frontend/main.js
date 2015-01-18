require.config({
  paths : {
    jquery : 'lib/jquery-2.1.1',
    'jquery-ui' : 'lib/jquery-ui',
    underscore : 'lib/underscore',
    amcharts : 'lib/amcharts/amcharts',
    'amcharts.funnel' : 'lib/amcharts/funnel',
    'amcharts.gauge' : 'lib/amcharts/gauge',
    'amcharts.pie' : 'lib/amcharts/pie',
    'amcharts.radar' : 'lib/amcharts/radar',
    'amcharts.serial' : 'lib/amcharts/serial',
    'amcharts.xy' : 'lib/amcharts/xy'
  },

  shim : {
    'jquery-ui' : {
      deps : [ 'jquery' ],
      exports : '$'
    },

    'amcharts.funnel' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    },
    'amcharts.gauge' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    },
    'amcharts.pie' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    },
    'amcharts.radar' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    },
    'amcharts.serial' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    },
    'amcharts.xy' : {
      deps : [ 'amcharts' ],
      exports : 'AmCharts',
      init : function() {
        AmCharts.isReady = true;
      }
    }
  }
});

require([ 'jquery', 'jquery-ui', 'underscore', 'charge-simulator',
    'amcharts.serial' ], function($, JUI, _, ChargeSim, amRef) {
  
  var defaultParams = {
    batteryCapacity : 40,
    consumptionPerKm : 1,
    consumptionStd : 0.2,
    chargingTime : 15,
    chargingTimeStd : 3,
    chargingPower : 400,
    totalDistance : 270,
    distanceBetweenCharges : 1
  };
  
  $('#capacity').text(defaultParams.batteryCapacity);
  $('#consumption').val(defaultParams.consumptionPerKm);
  $('#consumptionStd').val(defaultParams.consumptionStd);
  $('#charging-time').val(defaultParams.chargingTime);
  $('#charging-time-std').val(defaultParams.chargingTimeStd);
  $('#charging-power').text(defaultParams.chargingPower);
  $('#charging-interval').text(defaultParams.distanceBetweenCharges);
  $('#total-distance').text(defaultParams.totalDistance);
  
  $("#capacity-slider").slider({
    value : 40,
    min : 0,
    max : 400,
    step : 10,
    slide : function(event, ui) {
      $("#capacity").text(ui.value);
      defaultParams.batteryCapacity = ui.value;
    }
  });
  
  $('#consumption').keyup(function(){
    defaultParams.consumptionPerKm = parseInt($(this).val());
  });
  
  $('#consumptionStd').keyup(function(){
    defaultParams.consumptionStd = parseFloat($(this).val());
  });
  
  $('#charging-time').keyup(function(){
    defaultParams.chargingTime = parseInt($(this).val());
  });
  
  $('#charging-time-std').keyup(function(){
    defaultParams.chargingTimeStd = parseInt($(this).val());
  });
  
  $("#charging-power-slider").slider({
    value : 300,
    min : 0,
    max : 800,
    step : 10,
    slide : function(event, ui) {
      $("#charging-power").text(ui.value);
      defaultParams.chargingPower = ui.value;
    }
  });
  
  $("#charging-interval-slider").slider({
    value : 1,
    min : 0.1,
    max : 20,
    step : 0.1,
    slide : function(event, ui) {
      $("#charging-interval").text(ui.value);
      defaultParams.distanceBetweenCharges = ui.value;
    }
  });
  
  $("#total-distance-slider").slider({
    value : 270,
    min : 0,
    max : 400,
    step : 1,
    slide : function(event, ui) {
      $("#total-distance").text(ui.value);
      defaultParams.totalDistance = ui.value;
    }
  });
  
  var sim = new ChargeSim();
  
  var runSimulation = function() {
    sim.setParameters(defaultParams);
    var results = sim.drive();
    if(results.isSuccess) {
      $('.runbutton .glyphicon').addClass('glyphicon-ok').removeClass('glyphicon-remove');
    } else {
      $('.runbutton .glyphicon').addClass('glyphicon-remove').removeClass('glyphicon-ok');
    }
    var chart = amRef.makeChart("chartdiv", {
      "theme" : "none",
      "type" : "serial",
      "autoMargins" : false,
      "marginLeft" : 70,
      "marginRight" : 8,
      "marginTop" : 10,
      "marginBottom" : 70,
      "pathToImages" : "http://www.amcharts.com/lib/3/images/",
      "dataProvider" : results,
      "valueAxes" : [ {
        "id" : "v1",
        "axisAlpha" : 0,
        "inside" : false,
        'min' : 0,
        'minimum' : 0,
        'max' : 100,
        'maximum' : 110,
        'gridAlpha' : 0.1,
        'title' : 'Battery level (%)'
      } ],
      "graphs" : [ {
        "useNegativeColorIfDown" : false,
        "balloonText" : "[[category]]<br><b>value: [[value]]</b>",
        "bullet" : "round",
        "bulletBorderAlpha" : 1,
        "bulletBorderColor" : "#FFFFFF",
        "hideBulletsCount" : 50,
        "lineThickness" : 2,
        "lineColor" : "#0088cc",
        "valueField" : "capacity"
      } ],
      "chartCursor" : {
        "valueLineEnabled" : true,
        "valueLineBalloonEnabled" : true
      },
      "categoryField" : "traveled",
      "categoryAxis" : {
        "parseDates" : false,
        "axisAlpha" : 0,
        'gridAlpha' : 0,
        'maximum' : defaultParams.totalDistance,
        'max' : defaultParams.totalDistance,
        "minHorizontalGap" : 60,
        'title' : 'Distance traveled (km)'
      }
    });
  };
  
  $('.runbutton button').click(runSimulation);
  runSimulation();


});