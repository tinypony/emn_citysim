var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var moment = require('moment');

MongoClient.connect('mongodb://127.0.0.1:27017/ruter', function(err, db) {
  if (err) {
    console.log('error');
    throw err;
  }

  var routes = db.collection('routes');
  var trips = db.collection('trips');
  var i = 0;

  routes.find({}).count(function(err, count) {
    var end = _.after(count, function(){
      db.close();
    });
    
    routes.find({}).each(function(err, route) {
      if (route) {
          
        trips.findOne({
          route: route.name
        }, function(err, result) {
          
          if (!err) {
            var waypoints = _.map(result.stops, function(stop){
              return {
                id: stop.id,
                posX: stop.posX,
                posY: stop.posY,
                name: stop.name
              };
            });            
            
            routes.update(route, {
              $set : {
               waypoints : waypoints
              }
            }, {
              w : 1
            }, function() {});
          }
          i++;
          console.log('done '+i+'/'+count);
          end();
        });
      }
    });
  });
});