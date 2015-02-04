var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

function getDate(req) {
  return "2014-12-17";
}

exports.routes = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/hsl", function(err, db) {
    var sendRoutes = function(routes) {
      res.type('application/json');
      res.send(_.sortBy(routes, 'routeLength'));

      db.close();
    };
    
    if (!err) {
      db.collection('buses').aggregate([
                                        {
                                          $sort: {routeLength: -1}
                                        },
                                        {
                                          $group: {
                                            _id: '$serviceNbr',
                                            route: {
                                              $first: '$route'
                                            },
                                            routeLength: {
                                              $first: '$routeLength'
                                            }
                                          }
                                        }
                                       ], function(err, buses){
        sendRoutes(buses);
      });
      
    }
  });
}