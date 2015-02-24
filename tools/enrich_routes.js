var MongoClient = require('mongodb').MongoClient;
var _ = require('underscore');
var moment = require('moment');

var dateArg = process.argv[2];
console.log(dateArg);
MongoClient.connect('mongodb://127.0.0.1:27017/ruter', function(err, db) {
  if (err) {
    console.log('error');
    throw err;
  }

  var routes = db.collection('routes');
  var trips = db.collection('trips');
  var i = 0;
  var date = dateArg;

  routes.find({}).count(function(err, count) {
    var end = _.after(count, function(){
      db.close();
    });
    
    routes.find({}).each(function(err, route) {
      if (route) {
          
        trips.aggregate([ {
          $match : {
            serviceNbr : route.id,
            dates : date
          }
        }, {
          $group : {
            _id : '$route',
            averageLength : {
              $avg : '$tripLength'
            },
            totalLength : {
              $sum : '$tripLength'
            }
          }
        } ], function(err, result) {
          
          if (!err && result.length) {
            var group = result[0];

            var statEntry = {
              date: date,
              length : group.averageLength,
              totalLength : group.totalLength,
              frequencyRatio : Math.round(group.totalLength / group.averageLength)
            };
            
            routes.update(route, {
              $push : {
                stats: statEntry
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