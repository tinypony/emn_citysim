var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

function getDate(req) {
  return "2014-12-17";
}

function getMaxLength(req) {
  return parseInt(req.query.maxLength);
}

function validateRequest(req) {
  if (!req.query.maxLength) {
    return {
      error : 'Maximum length must be defined',
      parameters : [ 'maxLength' ]
    };
  }
}

exports.routes = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/ruter", function(err, db) {
    if (!err) {
      var query = {
          name: {
            $regex: /^N{0,1}\d\d[A-Za-z]{0,1}$/
          }
      };
      
      db.collection('routes').find(query).count(function(err, count){
        db.collection('routes').find(query, function(err, routes) {
          var routesArray = {};
          var i=0;
          
          routes.each(function(err, route) {
            if(err || !route) {
              return;
            }
            
            if(!routesArray[route.name]) {
              routesArray[route.name] = {
                  name: route.name,
                  stats: [],
                  stops: []
              };
            }
            
            routesArray[route.name].stats = _.union(routesArray[route.name].stats, route.stats);
            if(route.waypoints && route.waypoints.length && !routesArray[route.name].stops.length) {
              routesArray[route.name].stops = route.waypoints;
            }
            
            i++;
            if(i === count) {
              db.close();
              var itemized = _.map(routesArray, function(val, key){
                val.route = key;
                return val;
              });
              res.send(itemized);
            }
          });
        });
      });
    }
  });
}