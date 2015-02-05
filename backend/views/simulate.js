var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var EndStopArray = require('../dataobject/EndStopArray').EndStopArray;



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
  return fullRoute.replace(/T|B|K|V/g, '');
}

/**
 * 
 * @param {Number} power - power draw in kW
 * @param {Number} time - charging time in minutes
 * @returns {Number} - energy consumed in kWh
 */
function getEnergyDrawn(power, time) {
  return power * (time/60); 
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
    params.timeseries[timeStr] += power;
    
    params.endStops.chargeBus(params.bus, power, timeStr);
  }
  
  return getEnergyDrawn(power, difference);
}

exports.getTimeDifference = getTimeDifference;
exports.powerNeeded = powerNeeded;
exports.getRoute = getRoute;
exports.getEnergyDrawn = getEnergyDrawn;


/**
 * REST end point for running the simulation of city-wide bus traffic 
 */
exports.list = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/hsl", function(err, db) {
    if (!err) {
      
      db.collection('buses').find({
        dates : getDate(req),
        routeLength : { $lt : parseInt(getMaxLength(req), 10) }
      }).toArray(function(err, buses) {

        var timeseries = {};
        var busesTotal = buses.length;
       // var endStops = extractEndStops(buses);
        var ends = new EndStopArray(buses);
        var busLookUp = {};
        var moreTime = true;
        var time = moment('00:00', 'HH:mm');
        var prechargeEnergy = 0;
        var chargeEnergy = 0;
        
        //Place all buses into a map, use departure as a key
        _.each(buses, function(bus) {
          var departure = _.first(bus.stops).time;
          
          if( !busLookUp[departure] ) {
            busLookUp[departure] = [];
          }
          
          busLookUp[departure].push(bus);
        });
        
        var sendResponseAndCloseDB = function() {
          res.type('application/json');
//          
//          var controlsum = 0;
//          _.each(timeseries, function(val, key){
//            controlsum += (val * 1/60);
//          });
          
          res.send({
            chargeEnergy : Math.round(chargeEnergy) + " kWh",
            prechargeEnergy : Math.round(prechargeEnergy) + " kWh",
            max: _.max(_.values(timeseries), function(power){
              return power;
            }),
            timeseries : timeseries,
            endStops: ends.getProcessed()
          });

          db.close();
        };

        //Step through the day
        while (moreTime) {
          var minuteStr = time.format('HHmm');

          if (!timeseries[minuteStr]) {
            timeseries[minuteStr] = 0;
          }

          // buses leaving at this moment
          var busesNow = busLookUp[minuteStr];

          _.each(busesNow, function(busNow) {
            var waitingStart = ends.waitingSince(busNow);

            if (waitingStart) {
              chargeEnergy += handleWaitingBus({
                endStops : ends,
                bus : busNow,
                timeseries : timeseries,
                then : waitingStart,
                now : minuteStr
              }, req);
            } else {
              prechargeEnergy += getEnergyConsumptionPerKm(req) * busNow.routeLength/1000;
            }
            
            ends.leave(busNow);
            ends.wait(busNow);
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