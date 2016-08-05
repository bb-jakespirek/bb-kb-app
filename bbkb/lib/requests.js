module.exports = {
	// fetchBookmarks: function() {
	// 	return {
	// 	  url:  '/api/v2/bookmarks.json',
	// 	  type: 'GET'
	// 	};
	// },
	fetchOrganization: function(org_id) {
		// console.log("fetchOrganization ran");
		return {
			url:  '/api/v2/organizations/'+org_id+'.json',
			type: 'GET'
		};
	},

	findPrimaryContact: function(org_id) {
		// console.log("fetchOrganization ran");
		// /api/v2/search.json?query={search_string}
		// var search_string = "query=type:ticket status:closed&sort_by=status&sort_order=desc"
		// organization:"Blackbaud" type:user tags:primary_contact
		// var search_string = 'query=organization:"Blackbaud"&type:user&tags:test_tag_123&sort_order=desc'
		// var search_string = 'type:user&tags:test_tag_123&sort_order=desc';
		// var search_queries = ['type:user','tags:test_tag_123','organization:"Blackbaud"'];
		var search_queries = ['type:user','tags:primary_contact','organization:"Blackbaud"'];
		var search_string = search_queries.join("+");
		// type%3Auser+tags%3Atest_tag_123
		search_string = escape(search_string);
		return {
			// url:  '/api/v2/search.json?query={'+search_string+'}',
			url:  '/api/v2/search.json?query='+search_string,
			// url:  '/api/v2/search.json?query=type%3Auser+tags%3Atest_tag_123',
			type: 'GET'
		};
	},

	fetchProblemTicketInfo: function(problem_id) {
		// console.log("fetchOrganization ran");
		return {
			url:  '/api/v2/tickets/'+problem_id+'.json',
			type: 'GET'
		};
	},

	createTicketRequest: function(ticket, custom_fields) {
		// Create single ticket clone

		// add Bugman tag
		var tags = ticket.tags();
		tags.push('bugman');

		return {
		  url: '/api/v2/tickets.json',
		  dataType: 'json',
		  type: 'POST',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
		      "subject": ticket.subject(),
		      "comment": {
		        // "body":  ticket.description(),
		        "body": "Bug ticket created",
		        "public": false
		      },
		      "status": ticket.status(),
		      "priority": ticket.priority(),
		      // "type": ticket.type(),
		      "type": "problem",
		      // "tags": ticket.tags(),
		      "tags": tags,
		      "assignee_id": (ticket.assignee().user() && ticket.assignee().user().id()) || null,
		      "group_id": (ticket.assignee().group() && ticket.assignee().group().id()) || null,
		      // "requester_id": ticket.requester().id(),
		      // "requester_id": this.currentUser().id(),
					// Bugman as requester
					"requester_id": 1657860238,

		      // "collaborator_ids": _.map(ticket.collaborators(), function(cc) { return cc.email(); }),
		      "custom_fields": custom_fields
		    }
		  })
		};
	},

	updateIncidentTicket: function(incident_ticket_id, problem_ticket_id) {
		// Create single ticket clone
		return {
		  url: '/api/v2/tickets/'+incident_ticket_id+'.json',
		  dataType: 'json',
		  type: 'PUT',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
					"type": "incident",
					"problem_id": problem_ticket_id,
					"custom_fields": [
						{"id": 32756848, "value": "returned__other_resources_needed"}
					]

		    }
		  })
		};
	},

	updateProblemTicket: function(incident_ticket_id, problem_ticket_id) {
		// Uncheck the Sent to PSL queue checkbox (32268947) on the bugman ticket
		return {
		  url: '/api/v2/tickets/'+problem_ticket_id+'.json',
		  dataType: 'json',
		  type: 'PUT',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
					"custom_fields": [
						{"id": 32268947, "value": false}
					]

		    }
		  })
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
