exports.utils = {
	getDate : function(req) {
		return "2014-12-17";
	},

	getMaxLength : function(req) {
		return req.body.maxLength ? req.body.maxLength : 15000;
	}
}