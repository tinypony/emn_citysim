module.exports = {
	getDate : function(req) {
		return "2015-2-19";
	},

	getMaxLength : function(req) {
		return req.body.maxLength ? req.body.maxLength : 15000;
	}
}