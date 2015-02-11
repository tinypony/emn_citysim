var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var moment = require('moment');

MongoClient.connect('mongodb://127.0.0.1:27017/ruter', function(err, db) {
  if (err) {
    console.log('error');
    throw err;
  }

  console.log("connected to the mongoDB !");

  var routes = db.collection('routes');
  var trips = db.collection('trips');
  var count = 0;
  var date = '2015-2-19';
  
  routes.find({}).each(function(err, route){
    if(route) {
      trips.aggregate([
        {
          $match: {route: route.name, dates: date}
        },
        {
          $group: {
            _id: '$route',
            averageLength: {$avg: '$routeLength'},
            totalLength: {$sum: '$routeLength'}
        }
      }], function(err, result){
        if(result.length) {
          var group = result[0];
          console.log(group);
          routes.update(route, {$set : {length: group.averageLength, totalLength: group.totalLength}}, {w:1}, function(){});
        }
      });
    }
  });
});