var utils = require('../utils/utils');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var EndStopArray = require('../dataobject/EndStopArray');
var minChargingTime = 10;

function getLut(trips) {
  var busLookUp = {};
//Place all buses into a map, use departure as a key
  _.each(trips, function(bus) {
    var departure = _.first(bus.stops).time;

    if (!busLookUp[departure]) {
      busLookUp[departure] = [];
    }

    busLookUp[departure].push(bus);
  });
  return busLookUp;
}

function getMinWaitingTime(tripLength) {
  if(tripLength < 3000) {
    return 0;
  } else {
    return 10;
  }
}
/**
 * REST end point for getting waiting times at the end stops
 */
exports.waiting = function(req, res) {
  var date = '2015-2-10';
  MongoClient.connect("mongodb://localhost:27017/ruter", function(err, db) {
    if(!err) {
      var query = {
          name: {
            $regex: /^N{0,1}\d\d[A-Za-z]{0,1}$/
          },
          
          stats: {
            $elemMatch: {
              date: date,
              length: {
                $lt: 18000
              }
            }
          }
      };      
      
     db.collection('routes').find(query).toArray(function(err, routes){
       var routeNames = _.pluck(routes, 'name');
       
       db.collection('trips').find({
         dates : '2015-2-10',
         route : {$in: routeNames}
       }).toArray(function(err, trips) {
         
         var ends = new EndStopArray(trips);
         var busLookUp = getLut(trips);
         var moreTime = true;
         var time = moment('00:00', 'HH:mm');

         var sendResponseAndCloseDB = function() {
           res.type('application/json');
           res.send({
             endStops: _.filter(ends.itemize(), function(val) {
               return val.buses.length;
             })
           });

           db.close();
         };

         // Step through the day
         while (moreTime) {
           var minuteStr = time.format('HHmm');

           // buses leaving at this moment
           var busesNow = busLookUp[minuteStr];

           _.each(busesNow, function(busNow) {
             busNow.runtimeId = ends.getRuntimeId(busNow, getMinWaitingTime(busNow.tripLength));
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
     });
    }
  });
}