var RouteRankModel = function() {
  
}

RouteRankModel.prototype.rank = function(routeStats) {
  return routeStats.frequencyRatio; 
}

module.exports = RouteRankModel;