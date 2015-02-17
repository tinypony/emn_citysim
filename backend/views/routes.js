var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;

function getDate(req) {
  return "2014-12-17";
}

function getMaxLength(req) {
  return parseInt(req.query.maxLength);
}

function validateRequest(req) {
  if(!req.query.maxLength) {
    return {
      error: 'Maximum length must be defined',
      parameters: ['maxLength'] 
    };
  }
}

exports.routes = function(req, res) {
  var reqVal = validateRequest(req);
  if(reqVal) {
    res.type('application/json');
    res.status(422);
    res.send(reqVal);
  } else {
    
    MongoClient.connect("mongodb://localhost:27017/hsl", function(err, db) {
      if (!err) {
        db.collection('buses').aggregate([{
          $match: { routeLength: { $lt: getMaxLength(req) } }
        }, {
          $sort: {
            routeLength: -1
          }
        }, {
          $group: {
            _id: '$serviceNbr',
            route: {
              $first: '$route'
            },
            routeLength: {
              $first: '$routeLength'
            }
          }
        } ], function(err, buses) {
          res.type('application/json');
          res.send(_.sortBy(buses, 'routeLength'));
          db.close();
        });

      }
    });
  }
}