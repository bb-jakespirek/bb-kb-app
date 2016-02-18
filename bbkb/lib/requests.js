module.exports = {
	fetchBookmarks: function() {
		return {
		  url:  '/api/v2/bookmarks.json',
		  type: 'GET'
		};
	},
	fetchOrganization: function(org_id) {
		console.log("fetchOrganization ran");
		return {
			url:  '/api/v2/organizations/'+org_id+'.json', 
			type: 'GET'
		};
	},	
	// fetchOrganizationFields: function(id) {
	// 	console.log("fetchOrganizationFields ran");
	// 	return {
	// 		url:  '/api/v2/organization_fields/'+id+'.json', 
	// 		type: 'GET'
	// 	};
	// }

};
