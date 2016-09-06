module.exports = {
	// Fixes for JSHint:
	/*global escape: true */


	getHolidays: function() {
		// console.log("fetchOrganization ran");
		return {
			url:  '/api/v2/business_hours/schedules.json',
			type: 'GET'
		};
	},

	fetchOrganization: function(org_id) {
		// console.log("fetchOrganization ran");
		return {
			url:  '/api/v2/organizations/'+org_id+'.json',
			type: 'GET'
		};
	},

	findUsersByTag: function(tag, org_id) {
		if (!org_id) {
			org_id = 23965884;
		}
		// Default org is Blackbaud
		var search_queries = ['type:user','tags:' + tag, 'organization:' + org_id ];
		var search_string = search_queries.join("+");
		search_string = escape(search_string);
		return {
			url:  '/api/v2/search.json?query='+search_string,
			type: 'GET'
		};
	},

	findPrimaryContact: function(org_id) {

		var org = 'organization:' + org_id;
		var search_queries = ['type:user','tags:primary_contact', org ];
		var search_string = search_queries.join("+");
		search_string = escape(search_string);
		return {
			url:  '/api/v2/search.json?query='+search_string,
			type: 'GET'
		};
	},

	findAlternateContact: function(org_id) {
		var org = 'organization:' + org_id;
		var search_queries = ['type:user','tags:alternate_contact', org ];
		var search_string = search_queries.join("+");
		search_string = escape(search_string);
		return {
			url:  '/api/v2/search.json?query='+search_string,
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

		// console.log("createPrimaryTicket");
		// console.log(primary);
		// console.log(unauth_user);
		// console.log(ticket_number);

		// var body = "Hey %@, please see below and copy and paste this into a public comment to the customer. \r\r --- \r\r Hi %@, I just wanted to let you know %@ contacted Support today regarding ticket #%@. Should this person be an authorized contact?";
		// body = body.fmt(current_user, primary, unauth_user, ticket_number);

		var body = "Hi %@, \r I just wanted to let you know %@ contacted Support today regarding ticket #%@. \r\r Even though the user is not currently an authorized contact, we were happy to help them with their request today. \r\r If the user should be authorized to contact Support on a regular basis, please respond to this ticket and include their name, email, and phone number. \r\r Please note: to click the ticket number link above, please access this ticket from within Case Central via the ON products Help Panel. As usual, you can reply to this message via email.";
		body = body.fmt(primary, unauth_user, ticket_number);

		var subject = "Authorization: " + unauth_user + " #" + ticket_number;

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
		      "type": "question",
		      "tags": tags,
		      "assignee_id": (ticket.assignee().user() && ticket.assignee().user().id()) || null,
		      "group_id": (ticket.assignee().group() && ticket.assignee().group().id()) || null,
					// Setting requester to the current agent will make this look like it's them sending it. Adding the primary as the CC and then will swap it out in the next update
					"requester_id": this.currentUser().id(),
					"collaborator_ids": [primary_contact.id], //collaborator_ids SETS all the collaborators which is what we want in this case so there's only one
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
					// "status": "solved", //ticket.status(),
					// "type": "incident",
					// "problem_id": problem_ticket_id,
					// "custom_fields": [
					// 	{"id": 32756848, "value": "returned__other_resources_needed"}
					// ]

				}
			})
		};
	},




	assignConsultant: function(ticket_id, consultant) {
		// console.log("assignConsultant");
		// console.log(consultant);
		var consultants_user_id = 9228315187; //K12 Consultants User
		var consultants_group_id = 30355887;
		var tags = this.ticket().tags();
		tags.push('initial_assignee');
		tags.push('consultants');
		tags.push(consultant.name_tag);

		return {
		  url: '/api/v2/tickets/'+ticket_id+'.json',
		  dataType: 'json',
		  type: 'PUT',
		  contentType: 'application/json',
		  data: JSON.stringify({
		    "ticket": {
					"additional_collaborators": [consultant.user_id],
					"assignee_id": consultants_user_id,
					"group_id": consultants_group_id,
					"tags": tags,
					"custom_fields": [
						{"id": 32248228, "value": consultant.name}
					]

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


	createChatTicketTest: function(ticket) {
		// Create single ticket clone

		// add Bugman tag

		// tags.push('auth_user_verification');
		//
		// var primary = primary_contact.name;
		// var unauth_user = ticket.requester().name();
		// var ticket_number = ticket.id();
		// var current_user = this.helper_grab_current_user_first_name();

		// console.log("createPrimaryTicket");
		// console.log(primary);
		// console.log(unauth_user);
		// console.log(ticket_number);

		// var body = "Hey %@, please see below and copy and paste this into a public comment to the customer. \r\r --- \r\r Hi %@, I just wanted to let you know %@ contacted Support today regarding ticket #%@. Should this person be an authorized contact?";
		// body = body.fmt(current_user, primary, unauth_user, ticket_number);

		// var body = "Hi %@, \r I just wanted to let you know %@ contacted Support today regarding ticket #%@. \r\r Even though the user is not currently an authorized contact, we were happy to help them with their request today. \r\r If the user should be authorized to contact Support on a regular basis, please respond to this ticket and include their name, email, and phone number. \r\r Please note: to click the ticket number link above, please access this ticket from within Case Central via the ON products Help Panel. As usual, you can reply to this message via email.";
		// body = body.fmt(primary, unauth_user, ticket_number);
		var body = "This is my question...";
		var subject = " IGNORE // TESTING // test ticket ";
		var tags = ticket.tags();
		tags.push('initial_assignee');

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
		      "type": "question",

					// Testing
					"status": "open",
					// "assignee_id": 7928076648, //Alyssa for testing
					"group_id": 20747244, //Support
					"requester_id": 9213159448, // John Doe for testing
					// "tags": tags,
					"tags": ["initial_assignee"],
					"custom_fields": [
						{"id": 32248228, "value": "Alyssa Metts"}
					],

		      // "assignee_id": (ticket.assignee().user() && ticket.assignee().user().id()) || null,
		      // "group_id": (ticket.assignee().group() && ticket.assignee().group().id()) || null,
					// Setting requester to the current agent will make this look like it's them sending it. Adding the primary as the CC and then will swap it out in the next update
					// "requester_id": this.currentUser().id(),
					// "collaborator_ids": [primary_contact.id], //collaborator_ids SETS all the collaborators which is what we want in this case so there's only one
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










// ------------- Create Tickets for Testing ----------------- //

createTestTicket_: function(ticket) {
	// Create single ticket clone

	// add Bugman tag

	// tags.push('auth_user_verification');
	//
	// var primary = primary_contact.name;
	// var unauth_user = ticket.requester().name();
	// var ticket_number = ticket.id();
	// var current_user = this.helper_grab_current_user_first_name();

	// console.log("createPrimaryTicket");
	// console.log(primary);
	// console.log(unauth_user);
	// console.log(ticket_number);

	// var body = "Hey %@, please see below and copy and paste this into a public comment to the customer. \r\r --- \r\r Hi %@, I just wanted to let you know %@ contacted Support today regarding ticket #%@. Should this person be an authorized contact?";
	// body = body.fmt(current_user, primary, unauth_user, ticket_number);

	// var body = "Hi %@, \r I just wanted to let you know %@ contacted Support today regarding ticket #%@. \r\r Even though the user is not currently an authorized contact, we were happy to help them with their request today. \r\r If the user should be authorized to contact Support on a regular basis, please respond to this ticket and include their name, email, and phone number. \r\r Please note: to click the ticket number link above, please access this ticket from within Case Central via the ON products Help Panel. As usual, you can reply to this message via email.";
	// body = body.fmt(primary, unauth_user, ticket_number);
	var body = "This is my question...";
	var subject = " IGNORE // TESTING // test ticket ";
	var tags = ticket.tags();
	tags.push('initial_assignee');

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
				"type": "question",

				// Testing
				"status": "open",
				// "assignee_id": 7928076648, //Alyssa for testing
				"group_id": 20747244, //Support
				"requester_id": 9213159448, // John Doe for testing
				// "tags": tags,
				"tags": ["initial_assignee"],
				"custom_fields": [
					{"id": 32248228, "value": "Alyssa Metts"}
				],

				// "assignee_id": (ticket.assignee().user() && ticket.assignee().user().id()) || null,
				// "group_id": (ticket.assignee().group() && ticket.assignee().group().id()) || null,
				// Setting requester to the current agent will make this look like it's them sending it. Adding the primary as the CC and then will swap it out in the next update
				// "requester_id": this.currentUser().id(),
				// "collaborator_ids": [primary_contact.id], //collaborator_ids SETS all the collaborators which is what we want in this case so there's only one
			}
		})
	};
},






};
