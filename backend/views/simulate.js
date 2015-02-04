var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

function getDate(req) {
  return "2014-12-17";
}

function getTotalEnergy(buses, req) {
  return kilometersTotal(buses) * getEnergyConsumptionPerKm(req);
}

function kilometersTotal(buses) {
  return _.reduce(buses, function(total, bus) {
    return total + bus.routeLength / 1000;
  }, 0);
}

function getEnergyConsumptionPerKm(req) {
  return req.query.consumptionPerKm ? parseFloat(req.query.consumptionPerKm, 10) : 1;
}

function getEfficiency(req) {
  return req.query.efficiency ? parseFloat(req.query.efficiency, 10) : 1;
}

function getElectrificationPercentage(req) {
  return 0.5;
}

function getMaxLength(req) {
  return req.query.maxLength ? req.query.maxLength : 15000; 
}

/**
 * Returns stripped route number e.g. 102T will return 102.
 * This is based on assumption that routes ending with a letter are just modifications
 * of the base routes and buses can switch between them at the end stops.
 * 
 * @param {Object} bus - a single bus service 
 * @returns
 */
function getRoute(bus) {
  var fullRoute = bus.route;
  return fullRoute.replace(/\D+/g, '');
}

/**
 * 
 * @param {Number} power - power draw in kW
 * @param {Number} time - charging time
 * @returns {Number} - energy consumed in kWh
 */
function getEnergyDrawn(power, time) {
  return power * (time/60); 
}

/**
 * Returns a map of all end stops for all routes
 * 
 * @param buses -
 *          all bus services on the specified day
 * @returns {Object} - map of all end stops
 */
function extractEndStops(buses) {
  var retval = {};

  _.each(buses, function(bus) {
    var firstStop = _.first(bus.stops);
    var lastStop = _.last(bus.stops);

    if (!retval[firstStop.id]) {
      retval[firstStop.id] = {};
    }

    if (!retval[lastStop.id]) {
      retval[lastStop.id] = {};
    }
  });

  return retval;
}

/**
 * Tells if a bus of certain route is already waiting at its end stop
 * 
 * @param {Object}
 *          endStops - map of all end stops, used to keep track of waiting buses
 * @param {Object}
 *          bus - object representing a single bus trip
 * @returns {String} - string representation of the time a bus of the same route
 *          arrived at that end stop or undefined if no buses arrived yet
 */
function waitingSince(endStops, bus) {
  var firstStop = _.first(bus.stops);
  var stopMap = endStops[firstStop.id];
  var route = getRoute(bus);
  var busQueue = stopMap[route];

  if (busQueue && busQueue.length) {
    var firstDepartureInQueue = _.min(busQueue, function(time) {
      return parseInt(time, 10);
    });
    
    var busDeparture = moment(firstStop.time, 'HHmm');

    // Check if buses at the end stop are not from the future :)
    if (busDeparture.diff(moment(firstDepartureInQueue, 'HHmm'), 'minutes') < 1) {
      return undefined;
    } else {
      stopMap[route] = _.without(busQueue, firstDepartureInQueue);
      return firstDepartureInQueue;
    }
  } else {
    return undefined;
  }
}

/**
 * Mark bus as processed and let it wait at the last stop
 * 
 * @param {Object}
 *          endStops - map of all end stops, used to keep track of waiting buses
 * @param {Object}
 *          bus - object representing a single bus trip
 */
function travelRoute(endStops, bus) {
  var lastStop = _.last(bus.stops);
  var stopMap = endStops[lastStop.id];

  var route = getRoute(bus);
  
  if (!stopMap[route]) {
    stopMap[route] = [];
  }
  
  stopMap[route].push(lastStop.time);
}

/**
 * Return time difference in minutes between now and then
 * 
 * @param {String}
 *          now - current moment in HHmm format
 * @param {String}
 *          then - moment in past in HHmm format
 * @returns {Number} amount of minutes between two moments
 */
function getTimeDifference(now, then) {
  var nowMoment = moment(now, 'HHmm');
  var thenMoment = moment(then, 'HHmm');

  return nowMoment.diff(thenMoment, 'minutes');
}
/**
 * Returns power used by the charger to provide energy for the next bus trip
 * 
 * @param {Object}
 *          params - contains all necessary parameters needed to calculate power
 * @param {Number}
 *          [params.consumption] - tells the average energy consumption per km
 * @param {Number}
 *          params.length - specifies the length of the route in kilometers
 * @param {Number}
 *          params.chargingTime - specifies charging time available for the bus
 *          in minutes
 * @param {Number}
 *          [params.efficiency] - specifies charger's efficiency
 * 
 * @returns {Number} - power in kW needed to charge the bus for the next trip in
 *          available period of time
 */
function powerNeeded(params) {

  var intakePower = (params.consumption * params.length) / (params.chargingTime / 60);
  var powerDraw = intakePower / params.efficiency;
  return powerDraw;
}

/**
 * Calculates ad saves charging power needed for the next bus trip
 * 
 * @param {Object}
 *          params
 * @param {Object}
 *          params.endStops - a map of all end stops for keeping track of
 *          waiting buses
 * @param {Object}
 *          params.bus - bus that needs to be charged before the next trip
 * @param {Object}
 *          params.timeseries - object containing the power of all chargers
 *          combined during the day
 * @param {String}
 *          params.waitingStarted - the time when the bus arrived at the end
 *          stop and started charging
 * @param {String}
 *          params.now - current moment
 * @param {Object}
 *          req - rest request object
 * @returns {Number} energy drawn from the grid
 */
function handleWaitingBus(params, req) {
  var difference = getTimeDifference(params.now, params.then);

  var power = powerNeeded({
    consumption : getEnergyConsumptionPerKm(req),
    length : params.bus.routeLength / 1000, // convert from meters to km
    chargingTime : difference,
    efficiency : getEfficiency(req)
  });

  var thenMoment = moment(params.then, 'HHmm');

  for (var i = 0; i < difference; i++) {
    thenMoment.add(i, 'minutes');
    var timeStr = thenMoment.format('HHmm');
    params.timeseries[timeStr] = params.timeseries[timeStr] + power;
  }
  
  return getEnergyDrawn(power, difference);
}

exports.getTimeDifference = getTimeDifference;
exports.waitingSince = waitingSince;
exports.powerNeeded = powerNeeded;
exports.getRoute = getRoute;
exports.getEnergyDrawn = getEnergyDrawn;
/**
 * REST end point for running the simulation of city-wide bus traffic 
 */
exports.list = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/hsl", function(err, db) {
    if (!err) {
      var busesToday = db.collection('buses').find({
        dates : getDate(req),
        routeLength : { $lt : parseInt(getMaxLength(req), 10) }
      });

      
      busesToday.toArray(function(err, buses) {
        console.log(buses.length);
        var timeseries = {};
        var busesTotal = buses.length;
        var endStops = extractEndStops(buses);
        var busLookUp = {};
        var moreTime = true;
        var time = moment('00:00', 'HH:mm');
        var totalEnergyDrawn = 0;
        
        _.each(buses, function(bus) {
          var departure = _.first(bus.stops).time;
          
          if( !busLookUp[departure] ) {
            busLookUp[departure] = [];
          }
          
          busLookUp[departure].push(bus);
        });
        
        var sendResponseAndCloseDB = function() {
          res.type('application/json');
          res.send({
            totalEnergy : totalEnergyDrawn + " kWh",
            max: _.max(_.values(timeseries), function(power){
              return power;
            }),
            timeseries : timeseries
          });

          db.close();
        };

        var finalCallback = _.after(busesTotal, sendResponseAndCloseDB);

        while (moreTime) {
          var minuteStr = time.format('HHmm');

          if (!timeseries[minuteStr]) {
            timeseries[minuteStr] = 0;
          }

          // buses leaving at this moment
          var busesNow = busLookUp[minuteStr];

          _.each(busesNow, function(busNow) {
            var waitingStart = waitingSince(endStops, busNow);

            if (waitingStart) {
              totalEnergyDrawn += handleWaitingBus({
                endStops : endStops,
                bus : busNow,
                timeseries : timeseries,
                then : waitingStart,
                now : minuteStr
              }, req);
            } else {
              totalEnergyDrawn += getEnergyConsumptionPerKm(req) * busNow.routeLength/1000;
            }

            travelRoute(endStops, busNow);
            finalCallback();
          });

          time.add(1, 'minutes');
          if (time.format('HHmm') === '0000') {
            moreTime = false;
          }
        }

        sendResponseAndCloseDB();
      });
    }
  });
};