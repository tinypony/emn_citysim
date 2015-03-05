var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var RouteRankModel = require('../dataobject/RouteRank');
var rankingField = 'rank';

function getDate(req) {
  console.log('date:'+req.query.date);
  return req.query.date ? req.query.date : false;
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

function resolveDomain(responseBody) {
  var routes = responseBody.routes;
  _.each(routes, function(route){
    var max = _.max(route.stats, function(stat){ return stat.rank}).rank;
    var min = _.min(route.stats, function(stat){ return stat.rank}).rank;
    
    if(max > responseBody.rankDomain.max) {
      responseBody.rankDomain.max = max;
    } 
    
    if(min < responseBody.rankDomain.min){
        responseBody.rankDomain.min = min;
    }
  });
  return responseBody;
}

exports.routes = function(req, res) {
  var rankModel = new RouteRankModel();
  
  MongoClient.connect("mongodb://localhost:27017/ruter", function(err, db) {
    if (!err) {
      var query = {
          name: {
            $regex: /^N{0,1}\d\d[A-Za-z]{0,1}$/
          }      
      };
      var date = getDate(req);
      
      if(date) {
        query.stats = {
            $elemMatch: {
              date: date,
              length: {
                $lt: 20000
              }
            }
        };
      }
      
      db.collection('routes').find(query).count(function(err, count){
        db.collection('routes').find(query, function(err, routes) {
          var responseBody = {
              rankingField: rankingField,
              rankDomain: {
                min: Number.MAX_VALUE,
                max: Number.MIN_VALUE
              },
              routes: []
          };
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
            
            var refineStats = function(stats) {
              
              stats.rank = rankModel.rank(stats);
              stats.length = Math.round(stats.length);
              var coEmissionGPerKm = 6;
              var nox;
           //  http://www2.vtt.fi/inf/pdf/tiedotteet/2007/T2373.pdf
              //http://www.embarq.org/sites/default/files/Exhaust-Emissions-Transit-Buses-EMBARQ.pdf
              stats.co2 = Math.round((stats.totalLength / 1000) * 6) / 1000; //kilogram per km
              stats.nox = Math.round((stats.totalLength / 1000) * 3) / 1000; //kilogram per km
              return stats;
            }
            
            if(date && !routesArray[route.name].stats.length && route.stats.length) {
              var dayStats = _.find(route.stats, function(stat){
                return stat.date === date;
              });
              
              dayStats = refineStats(dayStats);              
              routesArray[route.name].stats.push(dayStats);
              routesArray[route.name].dayStats = dayStats;
            } else {
              var routeStats = _.map(route.stats, refineStats);              
              routesArray[route.name] = _.union(routesArray[route.name].stats, routeStats);
            }
            
            if( route.waypoints && route.waypoints.length && 
                (!routesArray[route.name].stops || !routesArray[route.name].stops.length) ) {
              routesArray[route.name].stops = route.waypoints;
            }
        
            
            i++;
            if(i === count) {
              db.close();
              
              responseBody.routes = _.map(routesArray, function(val, key){
                val.route = key;
                return val;
              });
              responseBody = resolveDomain(responseBody);
              res.send(responseBody);
            }
          });
        });
      });
    }
  });
}