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
		// var search_queries = ['type:user','tags:primary_contact','organization:"Blackbaud"'];
		var org = 'organization:' + org_id;
		var search_queries = ['type:user','tags:primary_contact', org ];
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

	createPrimaryTicket: function(ticket, primary_contact) {
		// Create single ticket clone

		// add Bugman tag
		var tags = ticket.tags();
		tags.push('no_creation_notification');
		tags.push('auth_user_verification');

		var primary = primary_contact.name;
		var unauth_user = ticket.requester().name();
		var ticket_number = ticket.id();
		var current_user = this.helper_grab_current_user_first_name();

		console.log("createPrimaryTicket");
		console.log(primary);
		console.log(unauth_user);
		console.log(ticket_number);

		// var body = "Hey %@, please see below and copy and paste this into a public comment to the customer. \r\r --- \r\r Hi %@, I just wanted to let you know %@ contacted Support today regarding ticket #%@. Should this person be an authorized contact?";
		// body = body.fmt(current_user, primary, unauth_user, ticket_number);

		var body = "Hi %@, I wanted to let you know %@ contacted Support today regarding ticket #%@. Should this person be an authorized contact? \r\r Please note: to click the ticket number link above, please access this ticket from within Case Central via the ON products Help Panel.";
		body = body.fmt(primary, unauth_user, ticket_number);

		var subject = "Authorized User Verification: regarding ticket #" + ticket_number;

		return {
		  url: '/api/v2/tickets.json',
		  dataType: 'json',
		  type: 'POST',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
		      "subject": subject, //ticket.subject(),
		      "comment": {
		        // "body":  ticket.description(),
		        "body": body,
		        "public": true
		      },
		      "status": "pending", //ticket.status(),
		      // "priority": ticket.priority(),
		      // "type": ticket.type(),
		      "type": "question",
		      // "tags": ticket.tags(),
		      "tags": tags,
		      "assignee_id": (ticket.assignee().user() && ticket.assignee().user().id()) || null,
		      "group_id": (ticket.assignee().group() && ticket.assignee().group().id()) || null,
		      // "requester_id": ticket.requester().id(),

					// Testing with Jamie
					// "requester_id": 456903040,

					// Setting requester to the current agent will make this look like it's them sending it. Adding the primary as the CC and then will swap it out in the next update
					"requester_id": this.currentUser().id(),
					"collaborator_ids": [primary_contact.id], //collaborator_ids SETS all the collaborators which is what we want in this case so there's only one
					// "custom_fields": [
					// 	{"id": 32756848, "value": "returned__other_resources_needed"}
					// ]

					// "requester_id": primary_contact.id,


		      // "collaborator_ids": _.map(ticket.collaborators(), function(cc) { return cc.email(); }),
		      // "custom_fields": custom_fields
		    }
		  })
		};
	},

	changeRequesterToPrimary: function(ticket_id, primary_contact_id) {
		// change the requester to the primary, after initial ticket is created
		return {
			url: '/api/v2/tickets/'+ticket_id+'.json',
			dataType: 'json',
			type: 'PUT',
			contentType: 'application/json',
			data: JSON.stringify({
				"ticket": {
					// "additional_collaborators": [collaborator_id], //collaborator_ids SETS all the collaborators so would potentially overwrite existing ones
					"requester_id": primary_contact_id,
					"collaborator_ids": [],
					// "type": "incident",
					// "problem_id": problem_ticket_id,
					// "custom_fields": [
					// 	{"id": 32756848, "value": "returned__other_resources_needed"}
					// ]

				}
			})
		};
	},

	updateTicketWithPrimaryCC: function(ticket_id, collaborator_id) {

		return {
		  url: '/api/v2/tickets/'+ticket_id+'.json',
		  dataType: 'json',
		  type: 'PUT',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
					"additional_collaborators": [collaborator_id], //collaborator_ids SETS all the collaborators so would potentially overwrite existing ones
					// "type": "incident",
					// "problem_id": problem_ticket_id,
					// "custom_fields": [
					// 	{"id": 32756848, "value": "returned__other_resources_needed"}
					// ]

		    }
		  })
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
