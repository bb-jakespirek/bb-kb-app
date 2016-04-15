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


	createTicketRequest: function(ticket, custom_fields) {
		// Create single ticket clone
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
		      "tags": ticket.tags(),
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
