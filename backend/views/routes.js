var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var RouteRankModel = require('../dataobject/RouteRank');
var rankingField = 'rank';

function getDate(req) {
  console.log('date:'+req.query.date);
  return req.query.date ? req.query.date : false;
}

function getMaxLength(req) {
  return req.query.maxLength ? parseInt(req.query.maxLength) : 20000;
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
                $lt: getMaxLength(req)
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
              var noxEmissionGPerKm = 3;
              var co2EmissionGPerKm = 1330;
           //  http://www2.vtt.fi/inf/pdf/tiedotteet/2007/T2373.pdf
              //http://www.embarq.org/sites/default/files/Exhaust-Emissions-Transit-Buses-EMBARQ.pdf
              //https://www.google.fi/url?sa=t&rct=j&q=&esrc=s&source=web&cd=5&cad=rja&uact=8&ved=0CDsQFjAE&url=http%3A%2F%2Fwww.researchgate.net%2Fprofile%2FChristopher_Koroneos%2Fpublication%2F262193381_Comparative_environmental_assessment_of_Athens_urban_busesDiesel_CNG_and_biofuel_powered%2Flinks%2F0deec53b17a7cf2680000000.pdf&ei=pUn4VJGnI8b_ywPEoIKQDg&usg=AFQjCNEMzSKvhrJE6KkapaImHX9JZso6cA&sig2=Qg3BQ3SCqIiNdkurSfAwnw&bvm=bv.87519884,d.bGQ
              var kms = stats.totalLength / 1000;
              stats.co = Math.round( kms * coEmissionGPerKm) / 1000; //kilogram per km
              stats.nox = Math.round( kms * noxEmissionGPerKm) / 1000; //kilogram per km
              stats.co2 = Math.round( kms * co2EmissionGPerKm) / 1000;
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