	(function() {

	var KB =  require('kb.js');
	var Info =  require('info.js');
	var Consultants =  require('consultants.js');

	return {

	appProperties: {
    // This is available globally in your functions via this.appProperties
    // We need to be very careful here though. When setting this, it might be possible previous data or unrelated data is served.
    // This would also be shared among different instances of the app (per user) so if the agent switches tabs the data might be
    // in the object may no longer be relevant. One way to get around that would be to make sure when setting data to include the
    // current ticket_id in the object, so we can check that this.appProperties.ticket_id === this.ticket().id() before we trust the data.
		"org_data": {},
		"kb_info": {},
		"school_info":{},
		"bug_info":{},
		"ticket_info":{},
		ticket_id: 0
  },

	appConsultants: {
	},





	events: {

		// 'app.activated': function() {
		// 	this.activate_app();
		// },
		'app.activated': 'initialize',

		'fetchOrganization.done': 'fetchOrganizationDone',
		'fetchProblemTicketInfo.done': 'fetchProblemTicketInfoDone',

		'ticket.subject.changed' : 'subject_changed',
		'ticket.type.changed' : 'type_changed',
		'ticket.requester.id.changed' : 'requester_changed',
    'ticket.requester.email.changed': 'requester_changed',
		'ticket.custom_field_22930600.changed' : 'kb_id_changed', // kb_id_changed
		'ticket.custom_field_22790214.changed' : 'help_topic_changed', //help_topic_changed
		'ticket.custom_field_22222564.changed' : 'about_changed', // About Field

		'ticket.custom_field_22271994.changed' : 'product_module_changed', // Product Module field
		'ticket.custom_field_21744040.changed' : 'field_changed', // Product field
		'ticket.custom_field_30300358.changed' : 'bug_priority_changed', // bug priority field

		'ticket.assignee.group.id.changed' : 'assignee_changed',

		'click .save_button': 'chat_transcript_save',
		'ticket.save': 'ticketSaveHandler',
		'ticket.submit.done': 'ticketSaveDoneHandler',
		// 'ticket.submit.always': 'ticketSubmitAlwaysHandler',

		'createTicketRequest.always': 'createTicketRequestDone',
		'updateIncidentTicket.always': 'updateIncidentTicketDone',

		// These callbacks are now done via findContacts method
		// 'findPrimaryContact.done': 'findPrimaryContactDone',
		// 'findAlternateContact.done': 'findAlternateContactDone',

		'createPrimaryTicket.done': 'createPrimaryTicketDone',



		'click .contact_primary': 'clickedContactPrimary',
		'click .ticket_to_primary': 'clickedTicketToPrimary',
		'click .carbon_copy': 'clickedCarbonCopy',

		'click .consultant_button': 'clickedConsultantButton',
		'assignConsultant.done': 'assignConsultantDone',


		'click #back': function(event) {
			this.generate_app_view();
		},

		'click #phone_btn': function(event) {
			this.$('#phone_modal').modal({
				backdrop: true,
				keyboard: true
			});
		},


		'click #chat_transcript_btn': function(event) {
			this.$('#chat_transcript_modal').modal({
				backdrop: true,
				keyboard: true
			});
		},


    'click #phone_input': function(event) {
			this.$("#phone_input").select();
		},


    'click #create_bug_btn': function(event) {
			var ticket = this.ticket();
			// var custom_fields = [{"id": 22222564, "value": "product_owner__bug"}];
			var custom_fields = [
				{"id": 22222564, "value": "product_owner__bug"},
				{"id": 32248228, "value": this.currentUser().name()}
			];

			this.ajax('createTicketRequest', ticket, custom_fields);
		},

	},

  requests: require('requests.js'),

	initialize: function(data) {
		var ticket = this.ticket();
		var sla_date_before = ticket.customField("custom_field_31407407");

		this.resetGlobals();
		// this.setupConsultants();

		// TO DO:
		// REWORK HOW EVERYTHING LOADS IN THE BEGINNING.
		// DO A CHECK TO SEE WHAT AJAX CALLS NEED TO BE RUN
		// DO THEM WITH PROMISES SO THEY CAN ALL RUN AT THE RIGHT TIME

		// temporary fix for a Zendesk bug 7/26/16
		this.appProperties.ticket_info.bug_priority_changed = 0;
		this.hideFields();
		// Check if it's a new ticket or not
		var ticket_new;
	  if (ticket.status() === "new") {
			ticket_new = true;
			if (ticket.requester()) {
				this.get_organization_info();
				this.set_initial_assignee();
			}
			else {
				this.switchTo('new', {
					user_id: this.currentUser().id(),
				});
			}
		}
		else {
			ticket_new = false;
			this.get_organization_info();
			if (ticket.type() === "incident") {
				this.get_problem_ticket_info();
			}
		}
  },


	hideFields: function() {
		var group_array;
		// https://developer.zendesk.com/apps/docs/agent/interface
		// disable customer impact field from being changed by analyst
		this.ticketFields('custom_field_28972337').disable();
		// kb status
		this.ticketFields('custom_field_22953480').disable();
		// ticket source
		this.ticketFields('custom_field_27286948').disable();
		// chat dispatched
		this.ticketFields('custom_field_29482057').disable();
		// Sent to PSL Queue
		this.ticketFields('custom_field_32268947').disable();
		// Sent to Programming Queue
		this.ticketFields('custom_field_35330927').disable();
		// Sent to Data Queue
		this.ticketFields('custom_field_35357707').disable();
		// Initial Assignee
		this.ticketFields('custom_field_32248228').disable();
		// Product dropdown is now set automatically
		this.ticketFields('custom_field_21744040').disable();
		// Product Sub Module 1
		this.ticketFields('custom_field_32341678').disable();
		// Product Sub Module 2
		this.ticketFields('custom_field_32363597').disable();

		// Disable Returned to CSA field for all groups except PSLs & NHCCTM
		group_array = ["Product Support Leads", "NHCCTM"];
		if (!this.check_user_groups(group_array)) {
			// user is not a PSL
			// disable the following:
			// Returned to CSA
			this.ticketFields('custom_field_32756848').hide();
		}

		// Disable PD Only fields for all groups except PSLs and PMs
		group_array = ["Product Support Leads", "Product Managers"];
		if (!this.check_user_groups(group_array)) {
			// user is not a PSL or PM
			// disable the following:
			// Bug Review
			this.ticketFields('custom_field_30520367').hide();
			// Bug Priority
			this.ticketFields('custom_field_30300358').hide();
			// PD SLA
			this.ticketFields('custom_field_31407407').hide();
		}
	},


	findContacts: function(org_id) {
    var promise1 = this.ajax('findPrimaryContact', org_id);
    var promise2 = this.ajax('findAlternateContact', org_id);
		var app = this;
    this.when(promise1, promise2).then(
			function(data1, data2){
				app.findContactsDone(data1, data2);
			}
    );
	},

	findContactsDone: function (primary_contact, alternate_contact) {
		// console.log("findContactsDone");
		// console.log(primary_contact);
		// console.log(alternate_contact);
		this.switchTo('contact_primary', {
			primary_array: primary_contact[0].results,
			alternate_array: alternate_contact[0].results
		});
	},



// ------------ Button Click Functions ---------------- //

	clickedContactPrimary: function (event) {
		// console.log("contact_primary clicked");
		if(this.ticket().organization()){
			var organization = this.ticket().organization();
			// this.ajax('findPrimaryContact', organization.id());
			this.findContacts(organization.id());
		}
	},

	clickedTicketToPrimary: function (event) {
		// console.log("clickedTicketToPrimary");
		// Old
		var index = this.$(event.currentTarget).parent().data("index");
		var user_id = this.$(event.currentTarget).data("userId");
		var name = this.$(event.currentTarget).data("name");

		var primary = {};
		primary.index = this.$(event.currentTarget).parent().data("index");
		primary.id = this.$(event.currentTarget).data("userId");
		primary.name = this.$(event.currentTarget).data("name");
		console.log(primary.name);
		this.ajax('createPrimaryTicket', this.ticket(), primary);
		this.ajax('updateTicketWithPrimaryCC', this.ticket().id(), primary.id);
	},

	clickedCarbonCopy: function (event) {
		// console.log("clickedCarbonCopy");
		// $(event.target).attr("note");
		var myInfo = this.$(event.currentTarget).parent().data("index");
		var user_id = this.$(event.currentTarget).data("userId");
		this.ajax('updateTicketWithPrimaryCC', this.ticket().id(), user_id);
	},

  'ticket.save': function() {
    return "The ticket wasn't saved!";
	},


  ticketSaveHandler: function() {
  	var ticket = this.ticket();
  	var type = ticket.type();
  	var about = ticket.customField("custom_field_22222564");

  	// KB Stuff
  	var no_kb_necessary = KB.no_kb_needed_test(this);
  	var has_kb_or_help = false;
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));
		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));
		var internal_kb_rec = KB.internal_kb_recommended(ticket);

		if (kb_article_valid || help_topic_valid) {
			has_kb_or_help = true;
		}

		// this.check_psl_sending_to_support();
		if (this.check_return_to_csa_status()) {
			// Returned to CSA is filled out
		} else {
			// this.growl_returned_to_csa_needed(ticket);
			return "The ticket wasn't saved! 'Returned to CSA' is not filled out.";
		}

		// Hold
		if (ticket.status() == "hold") {
			// Show Hold Status Modal when tickets don't have a hold status and are put on hold

			var hold_status = ticket.customField("custom_field_30584448");

			if (hold_status === "") {
	  			// This should only affect Support people
	  			var group_array = ["Support", "Product Support Leads", "Support Relationship Manager"];
	  			if (this.check_user_groups(group_array)) {
	    			this.$('#hold_modal').modal({
						backdrop: true,
						keyboard: true
					});
	  				return "The ticket wasn't saved! You need a Hold Status before submitting again.";
	  			}

  		}
		}
		else {
			// Remove Hold Status
			if ( type == "problem" && about == "product_owner__bug" || type == "incident") {
				// Don't remove the status if a problem ticket or it's an incident.
			} else {
				ticket.customField("custom_field_30584448", "");
			}
		}

		// Solved
		if (ticket.status() == "solved") {
			if (no_kb_necessary === false && has_kb_or_help === false && internal_kb_rec === false) {
	  			this.growl_kb_needed(ticket);
	  		}
		}
		// Reset the initial assignee
		this.set_initial_assignee();

		this.generate_app_view();
  },

	// ticketSubmitAlwaysHandler: function() {
	// 	var ticket = this.ticket();
	// 	if (ticket.status() == "solved") {
	// 		this.$('#solve_confirmation_modal').modal({
	// 			backdrop: true,
	// 			keyboard: true
	// 		});
	// 	}
	//
	// },

	ticketSaveDoneHandler: function() {
		this.get_problem_ticket_info();
		this.generate_app_view();
	},


// ------------ Ticket Field Changes ---------------- //

	assignee_changed: function() {
		// console.log("assignee changed");
		var ticket = this.ticket();
		if (ticket.requester()) {
			this.check_psl_sending_to_support();
		}
	},

	product_module_changed: function () {
		// console.log("product module changed");
  	var ticket = this.ticket();
		var product_module = ticket.customField("custom_field_22271994");
		var product = ticket.customField("custom_field_21744040");
		var set_product, set_sub_1, set_sub_2;
		var split_modules;

		// console.log(product_module);
		if (!product_module) {
			// product_module is null or empty
		} else {
			split_modules = product_module.split("__");
			// console.log(split_modules);

			set_product = split_modules[0];
			set_sub_1 = split_modules[1];
			if (split_modules[2]) {
				set_sub_2 = split_modules[2];
			} else {
				set_sub_2 = "";
			}

			// Set the Product
			ticket.customField("custom_field_21744040", set_product);
			// Set the Sub Module 1
			ticket.customField("custom_field_32341678", set_sub_1);
			// Set the Sub Module 2
			ticket.customField("custom_field_32363597", set_sub_2);
		}
	},

	bug_priority_changed: function () {
		console.log("bug_priority_changed");
		// temporary fix for a Zendesk bug 7/26/16
		this.appProperties.ticket_info.bug_priority_changed += 1;

		var group_array = ["Product Support Leads", "Product Managers"];
		if (this.check_user_groups(group_array)) {
			// console.log('current user is a PSL or PM');
			// Only modify if they are a PSL or PM
			this.set_pd_sla_date();
		} else {
			// console.log("disabling the pd sla field");
			this.ticketFields('custom_field_31407407').hide();
		}
		this.generate_app_view();
	},


  about_changed: function () {
  	this.type_changed();
  	this.generate_app_view();
  },


  type_changed: function () {
  	var ticket = this.ticket();
  	var type = ticket.type();
  	var about = ticket.customField("custom_field_22222564");

  	if (type == "incident") {
  		// Change the hold status
  		ticket.customField("custom_field_30584448", "hold_incident");
  	}
  	else if (type == "problem" && about == "product_owner__bug") {
  		ticket.customField("custom_field_30584448", "hold_bug");
  	}
  	else if (type == "problem" && about != "product_owner__bug") {
  		ticket.customField("custom_field_30584448", "");
  	}
  },




  check_user_groups: function(group_array) {
  	// This function returns true if user is one of the groups
		var current_user_groups = this.currentUser().groups();
		var group_names = [];
		var in_group;

		// Add each group name to an array called group_names
		_.each(current_user_groups, function(element, index, list){
			group_names.push(element.name());
		});

		_.each(group_array, function(element, index, list){
			if (_.contains(group_names, element)) {
				in_group = true;
				return in_group;
			}
		});

		if (in_group) {
			return true;
		}
	},

	helper_grab_current_user_first_name: function () {
		var user = this.currentUser().name();
		var temp_user = user.split(' ');
		var first_name = temp_user[0];
		return first_name;
	},

	growl_check_SLA_date: function(ticket) {
    var msg  = "<b>Hey %@!</b><br/> Don't forget to set the PD SLA Date! <br/><img src=%@ /><br/>Tip: clear out the PD SLA Date before changing the Bug Priority if you want it to automatically set a new date based on the new priority.",
        life = parseInt(this.$('#life').val(), 10);
    life = isNaN(life) ? 10 : life;
		// var user = this.currentUser().name();
		// var temp_user = user.split(' ');
		// user = temp_user[0];
		var user = this.helper_grab_current_user_first_name();
		var img = this.assetURL("e-boom.gif");
    services.notify(msg.fmt(user,img), 'alert', life * 1000);

		// console.log('growl_check_SLA_date');

  },

  growl_kb_needed: function(ticket) {
		// https://developer.zendesk.com/apps/docs/agent/services
		// https://developer.zendesk.com/apps/docs/agent/events#ticket.save-hook
		var msg  = "Hey now! You didn't include a KB article or Help Topic, and this ticket needs one. <a href='#/tickets/%@'>%@</a>";
		var life = parseInt(this.$('#life').val(), 10);
		life = isNaN(life) ? 10 : life;
		var ticket_id = ticket.id();
		services.notify(msg.fmt(ticket_id, ticket_id), 'error', life * 1000); // notice, alert, error
  },

	growl_returned_to_csa_needed: function(ticket) {
		// https://developer.zendesk.com/apps/docs/agent/services
		// https://developer.zendesk.com/apps/docs/agent/events#ticket.save-hook
		var msg  = "Hey! Don't forget to set the 'Returned to CSA' field. <a href='#/tickets/%@'>%@</a>";
		var life = parseInt(this.$('#life').val(), 10);
		life = isNaN(life) ? 10 : life;
		var ticket_id = ticket.id();
		services.notify(msg.fmt(ticket_id, ticket_id), 'error', life * 1000); // notice, alert, error
  },

  growl_hold_status_needed: function(ticket) {
		var msg  = "Hold your horses, you didn't include a Hold Status. <a href='#/tickets/%@'>%@</a>";
		var life = parseInt(this.$('#life').val(), 10);
		life = isNaN(life) ? 6 : life;
		var ticket_id = ticket.id();
		this.$('#hold_modal').modal({
			backdrop: true,
			keyboard: true
		});
		services.notify(msg.fmt(ticket_id, ticket_id), 'alert', life * 1000);
  },


  chat_transcript_save: function() {
		var ticket = this.ticket();
		var comment = this.comment();
		var modal_transcript = this.$('#chat_transcript').val();
		var full_comment;
		full_comment = '\r';
		full_comment += '---' + '\r';
		full_comment += '## Chat Transcript:' + '\r';
		var updated_transcript = this.format_chat_transcript();
		full_comment += updated_transcript;
		comment.appendMarkdown(full_comment);
		this.$('#chat_transcript_modal').modal('hide');
	},


	format_chat_transcript: function() {
  	var ticket = this.ticket();
  	var raw_chat_transcript = this.$('#chat_transcript').val();
		var pattern = new RegExp(/^(([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9] ?(AM|PM)) (\[(.*)\])/igm);
		var replacement = " \r\r\r*$1* **$5:**\r  \t";
		var fixed_chat_transcript = raw_chat_transcript.replace(pattern, replacement);
		return fixed_chat_transcript;
  },


	requester_changed: function() {
    // Requester changed - let's just regenerate everything including our handlebars
		if(this.ticket().requester()){
			this.get_organization_info();
		}
  },


  update_zd_custom_field: function(field_id, value) {
    return this.ticket().customField( helpers.fmt('custom_field_%@', field_id), value );
  },


  kb_id_changed: function () {
		this.generate_app_view();
	},


  help_topic_changed: function () {
		this.generate_app_view();
	},

	set_initial_assignee: function() {
		// console.log("initial assignee group");
		// console.log(this.ticket().assignee().user().name());
		// console.log(this.ticket().assignee().group().name());
		var ticket_info = this.appProperties.ticket_info;
		var starting_assignee = {};
		this.appProperties.ticket_info.starting_assignee = starting_assignee;

		// starting_assignee.name = this.ticket().assignee().user().name();
		if (!this.ticket().assignee().group()) {
		} else {
			starting_assignee.group = this.ticket().assignee().group().name();
		}
		ticket_info.psl_to_support = false;
	},


	check_psl_sending_to_support: function() {
		// console.log("check_psl_sending_to_support");
		if (this.appProperties.ticket_info.starting_assignee) {
			var starting_assignee = this.appProperties.ticket_info.starting_assignee;
			var new_assignee = {};
			new_assignee.group = this.ticket().assignee().group().name();

			// console.log("starting assignee group:");
			// console.log( starting_assignee.group);
			// console.log("new assignee group:");
			// console.log(new_assignee.group);

			// starting_assignee.name;
			if (starting_assignee.group == "Product Support Leads" && new_assignee.group == "Support") {
				// console.log("Changed from PSL to Support");
				this.appProperties.ticket_info.psl_to_support = true;
			}
		} else {
			// console.log("check_psl_sending_to_support // starting_assignee not set");
		}
	},

	check_return_to_csa_status: function() {
		// console.log("check_return_to_csa_status");
		var ticket = this.ticket();
		var returned_to_csa = ticket.customField("custom_field_32756848");

		if (this.appProperties.ticket_info.psl_to_support) {
			if (returned_to_csa === "") {
				// console.log("returned to CSA is NOT filled out");
				return false;
			} else {
				// console.log("returned to CSA is filled out");
				return true;
			}
		}
		else {
			return true;
		}

	},

	update_article_status: function () {
		var ticket = this.ticket();

		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));
		var no_kb_necessary = KB.no_kb_needed_test(this);

		this.appProperties.kb_info.kb_article_valid = kb_article_valid;
		this.appProperties.kb_info.help_topic_valid = help_topic_valid;
		var kb_status_before = ticket.customField("custom_field_22953480");
		var kb_status_after;
		this.appProperties.kb_info.show_kb_popup = false;

		if (help_topic_valid && kb_article_valid) {
			ticket.customField("custom_field_22953480", "kb_and_help_topic_attached");
		}
		else if (!help_topic_valid && kb_article_valid) {
			ticket.customField("custom_field_22953480", "kb_article_attached");
			kb_status_after = ticket.customField("custom_field_22953480");
		}
		else if (help_topic_valid && !kb_article_valid) {
			ticket.customField("custom_field_22953480", "help_topic_attached");
		}
		else {
			if(no_kb_necessary) {
				// TRUE = no KB is necessary
				ticket.customField("custom_field_22953480", "no_kb_necessary");
			}
			else {
				// FALSE  = needs KB
				ticket.customField("custom_field_22953480", "needs_kb_article");
			}

		}

		if (kb_status_before == "needs_kb_article" && kb_status_after != "needs_kb_article") {
			if (kb_article_valid || help_topic_valid)  {
				this.appProperties.kb_info.show_kb_popup = true;
			}
		}
	},


	field_changed: function () {
		this.get_organization_info();
		this.generate_app_view();
	},


	subject_changed: function () {
		this.generate_app_view();
	},


	set_pd_sla_date: function () {
		var ticket = this.ticket();
		var bug_priority = ticket.customField("custom_field_30300358");
		var sla_date = ticket.customField("custom_field_31407407");
		var new_sla_date;
		var today = new Date();

		switch (bug_priority) {
			case "0_critical_down":
				// Set SLA to 1 day from today
				today.setDate(today.getDate() + 1);
				new_sla_date = this.format_date_object(today);
				break;
			case "1_critical":
			// Set SLA to 30 days from today
				today.setDate(today.getDate() + 30);
				new_sla_date = this.format_date_object(today);
				break;
			case "2_high":
			// Set SLA to 90 days from today
				today.setDate(today.getDate() + 90);
				new_sla_date = this.format_date_object(today);
				break;
			case "3_medium":
				// Set SLA to 180 days from today
					today.setDate(today.getDate() + 180);
					new_sla_date = this.format_date_object(today);
					break;
			case "4_low":
			// Set SLA to 365 days from today to follow up later
				today.setDate(today.getDate() + 365);
				new_sla_date = this.format_date_object(today);
				break;
			case "5_cosmetic":
				// Set SLA to 365 days from today to follow up later
				today.setDate(today.getDate() + 365);
				new_sla_date = this.format_date_object(today);
				break;
			default:
				new_sla_date = sla_date;
		}

		// Make sure that the person cleared out the SLA Date field first.
		if (!sla_date) {
			ticket.customField("custom_field_31407407", new_sla_date);
		} else {
			// temporary fix for a Zendesk bug 7/26/16
			if (this.appProperties.ticket_info.bug_priority_changed > 1) {
				this.growl_check_SLA_date();
			}
		}
	},


	format_date_object: function (date_object) {
		if (date_object !== null) {
			// console.log(date_object.getDate());
			// This changes it to MM/DD/YYYY
			var month = date_object.getMonth() + 1;
			var day = date_object.getDate();
			var year = date_object.getFullYear();
			var formatted_date = month + "/" + day + "/" + year;
			return formatted_date;
		}
	},


	fix_inverted_date_formatting: function (date_string) {
		var formatted_date;
		if (!date_string) {
			// date_string is null or empty
			formatted_date = "";
		}
		else {
			//original is YYYY-MM-DD
			var str = date_string.split("-");
			// This gets it to MM/DD/YYYY
			formatted_date = str[1] + "/" + str[2] + "/" + str[0];
		}
		return formatted_date;
	},


	get_problem_ticket_info: function() {
		var ticket = this.ticket();
		if (ticket.customField('problem_id') > 0) {
			var problem_ticket = ticket.customField('problem_id');
			if (problem_ticket != null) {
				this.ajax('fetchProblemTicketInfo', problem_ticket);
			}
		}
		else {
			this.appProperties.bug_info.show = false;
		}
	},


	get_organization_info: function() {
		if(this.ticket().organization()){
			var organization = this.ticket().organization();
		 	// This response will be handled by fetchOrganizationDone if it's a success
		 	// It will then run generate_app_view
		 	this.ajax('fetchOrganization', organization.id());
		}
	},

	findConsultantsxxxx: function() {
		var promise1 = this.ajax('findUsersByTag', "consultant_cc");
		var app = this;
		this.when(promise1).then(
			function(data1){
				app.showConsultants(data1.results);
			}
		);
	},

	createPrimaryTicketDone: function(data) {
		console.log("createPrimaryTicketDone");
		this.$('#primary_contact_done').show();
		var ticket_id = data.ticket.id; //NOT this.ticket().id();
		var primary_contact_id = data.ticket.collaborator_ids[0];
		// console.log(data.ticket);
		var msg  = "Created new primary contact ticket #<a href='#/tickets/%@'>%@</a>.";
		services.notify(msg.fmt(ticket_id, ticket_id), 'notice', 6000);

		// Update the ticket and change the requester to the primary contact
		this.ajax('changeRequesterToPrimary', ticket_id, primary_contact_id);
	},

	fetchOrganizationDone: function(data) {
		var org_data = data.organization;
  	this.appProperties.org_data = org_data;
  	this.appProperties.school_info = Info.fix_org_data(org_data);
		// Check to see if user is part of Consultants group and appConsultants has already been set up
		if (this.check_user_groups(["Consultants"]) && !this.appConsultants[0]) {
			this.setupConsultants();
			// Will run this.generate_app_view() in showConsultants method

		} else {
			this.generate_app_view();
		}

  },


	fetchProblemTicketInfoDone: function(data) {
		var bug_info = {};
		var custom_fields = data.ticket.custom_fields;
		var bug_priority = _.find(custom_fields, function(item) { return item.id == 30300358; });
		var bug_sla_date = _.find(custom_fields, function(item) { return item.id == 31407407; });

		bug_info.priority = bug_priority.value;
		bug_info.sla_date = this.fix_inverted_date_formatting(bug_sla_date.value);

  	this.appProperties.bug_info = bug_info;
  	this.generate_app_view();
  },


	createTicketRequestDone: function(data){
			var incident_ticket_id = this.ticket().id();
			var problem_ticket_id = data.ticket.id;
			var msg  = "Created new ticket #<a href='#/tickets/%@'>%@</a>.";
			this.ajax('updateIncidentTicket', incident_ticket_id, problem_ticket_id);
			services.notify(msg.fmt(problem_ticket_id, problem_ticket_id), 'notice', 5000);
			this.ajax('updateProblemTicket', incident_ticket_id, problem_ticket_id);
  },


	updateIncidentTicketDone: function(data){
		// var ticket_id = data.ticket.id;
		// var msg  = "Updated and linked incident ticket #<a href='#/tickets/%@'>%@</a>.";
		// services.notify(msg.fmt(ticket_id, ticket_id), 'notice', 5000);
	},


	make_chat_link: function() {
		var ticket = this.ticket();
		var subject = ticket.subject();
		var chat_base_URL = "https://k12supportform.myschoolapp.com/chat/";
		var user_id = this.currentUser().id();
		var requester = ticket.requester();
		var product = ticket.customField("custom_field_21744040");
		var chat_url = chat_base_URL;
		chat_url += "?requester=" + requester.email();
		chat_url += "&requester_name=" + requester.name();
		chat_url += "&assignee=" + user_id;
		chat_url += "&assignee_name=" + this.currentUser().name();

		if (subject != null) {
			chat_url += "&subject=" + ticket.subject();
		}
		if (product != null) {
			chat_url += "&product=" + product;
		}

		return chat_url;
	},


	check_if_in_group: function(group_array) {
		if (this.check_user_groups(group_array)) {
			return true;
		} else {
			return false;
		}
	},

	get_preferred_contact: function() {
		var ticket = this.ticket();
		var preferred_contact_method = ticket.customField("custom_field_29175937");
		if (preferred_contact_method == "email_preferred") {
			return "Email Me";
		} else if (preferred_contact_method == "phone_preferred") {
			return "Call Me";
		} else {
			return false;
		}

	},

	generate_app_view: function() {
		var ticket = this.ticket();
		var ticket_new = false;
		var app = this;
		var kb_info = this.appProperties.kb_info;
		var ticket_source = ticket.customField("custom_field_27286948");
		var is_chat_ticket = false;

		if (ticket.isNew()) {
			ticket_new = true;
		}


		if (ticket_source == "chat" && this.check_user_groups(["Support"])) {
			is_chat_ticket = true;
		}

		// Set the KB article status field
		this.update_article_status();

		// Make sure org data has been loaded before going forward
		if (typeof this.appProperties.org_data.id != 'undefined') {
			var authorized_contact = ticket.requester().customField("authorized_contact");
			if (this.appProperties.ticket_id === this.ticket().id()){
				// console.log("The ticket ID's match");
			} else {
				// console.log("Yikes. The ticket ID's don't match");
			}

			// Show the App layout
			this.switchTo('app', {
				loaded: true,
				ticket_new: ticket_new,
				kb_links: KB.make_kb_links(ticket),
				no_kb_necessary: KB.no_kb_needed_test(this),
				internal_kb_rec: KB.internal_kb_recommended(ticket),
				help_topic_valid: kb_info.help_topic_valid,
				kb_article_valid: kb_info.kb_article_valid,
				show_kb_popup: kb_info.show_kb_popup,
				is_chat_ticket: is_chat_ticket,
				user_is_psl: this.check_if_in_group(["Product Support Leads"]),
				bug_info: this.get_bug_info(),
				kb_article_number: ticket.customField("custom_field_22930600"),
				help_topic: ticket.customField("custom_field_22790214"),
				kb_quotes: this.kb_quotes(),
				organization: this.appProperties.school_info,
				school_urls: this.appProperties.school_info.organization_fields,
				preferred_contact_method: this.get_preferred_contact(),
				authorized_contact: authorized_contact,
				user_notes: ticket.requester().notes(),
				chat_url: this.make_chat_link(),
				user_id: this.currentUser().id(),
				requester: ticket.requester(),
				product: ticket.customField("custom_field_21744040"),
				product_module: ticket.customField("custom_field_22271994"),
				root_cause: ticket.customField("custom_field_22222564"),
				consultant_buttons: this.consultantButtons()
			});
		} else {
			// Don't update the view yet!
			if (ticket.requester()) {
				this.switchTo('loading', {
					user_id: this.currentUser().id()
				});
			}
			else {
				// For new tickets
				this.switchTo('new', {
					user_id: this.currentUser().id(),
				});
			}
		}

	},


  resetGlobals: function(){
		// console.log("resetGlobals");
    var ticket_id = this.ticket().id();
    this.appProperties = {
			"org_data": {},
			"kb_info": {},
			"school_info":{},
			"bug_info":{},
			"ticket_info":{},
			ticket_id: ticket_id
    };
  },


	get_bug_info: function() {
		var ticket = this.ticket();
		var type = ticket.type();
		var bug_priority = ticket.customField("custom_field_30300358");
		var sla_date_field = ticket.customField("custom_field_31407407");
		var sla_date_obj;
		var sla_date_as_str;

		if (!sla_date_field) {
			// Do nothing, it is blank/null
		} else {
			sla_date_obj = new Date(sla_date_field.to_s());
			sla_date_obj.setDate(sla_date_obj.getDate() + 1);
			sla_date_as_str = this.format_date_object(sla_date_obj);
		}


		// for (item in sla_date) {
			// console.log("property:" + item);
		// }
		// console.log(sla_date.to_s());
		// console.log(sla_date.strftime("%d-%m-%y"));

		var bug_info = {};
		bug_info.show = false;

		if (type === "problem" && bug_priority !== "") {
			bug_info.show = true;
			bug_info.priority = bug_priority;
			if (sla_date_field !== null) {
				bug_info.sla_date = sla_date_as_str;
			}
		}
		else if (type === "incident" && ticket.customField('problem_id') > 0) {
			// console.log(this.appProperties.ticket_id);
			bug_info = this.appProperties.bug_info;
			if (bug_info.priority) {
				bug_info.show = true;
			}
			else {
				bug_info.show = false;
			}
		}

		return bug_info;
	},


// ------------ Consultant Functions ---------------- //

	setupConsultants: function () {
		if (this.check_user_groups(["Consultants"])) {
			// user is a Consultant
			this.appConsultants = [];
			this.findConsultants();
		}
	},

	findConsultants: function() {
		var promise1 = this.ajax('findUsersByTag', "consultant_cc");
		var app = this;
		this.when(promise1).then(
			function(data1){
				app.showConsultants(data1.results);
			}
		);
	},

	showConsultants: function(consultants_array) {
		var app = this;
		_.each(consultants_array, function(element, index, list){
			// Object {id: 8417809287, url: "https://whipplehill.zendesk.com/api/v2/users/8417809287.json", name: "Matt.Drown@blackbaud.com", email: "matt.drown@blackbaud.com", created_at: "2016-07-22T17:23:42Z"…}
			app.formatConsultant(element);
		});
		this.generate_app_view();
	},

	formatConsultant: function(r) {
		// console.log("formatConsultant");
		var t = {};
		t.id = r.id;
		t.name = r.name;
		t.email = r.email;
		t.name_tag = "ps_" + r.name.replace(" ", "_").toLowerCase();
		// var indexes = [ {'id': 1, 'name': 'jake' }, {'id':4, 'name': 'jenny'},  {'id': 9, 'name': 'nick'}, {'id': 1, 'name': 'jake' }, {'id':4, 'name': 'jenny'} ];
		if (_.findWhere(this.appConsultants, t)) {
			console.log("already exists");
		}	else {
			this.appConsultants.push(t);
		}
	},


	consultantButtons: function() {
		// console.log("consultantButtons");
		if (!this.appConsultants) {
			return false;
		} else {
			this.appConsultants = _.sortBy( this.appConsultants, 'name');
			return this.appConsultants;
		}
	},

	clickedConsultantButton: function (event) {
		// console.log("clickedConsultantButton");
		var ticket = this.ticket();
		ticket.customField("custom_field_22953480", "no_kb_necessary");

		var consultant = {};
		consultant.index = this.$(event.currentTarget).data("index");
		consultant.name = this.$(event.currentTarget).data("name");
		consultant.name_tag = this.$(event.currentTarget).data("nameTag");
		consultant.user_id = this.$(event.currentTarget).data("userId");

		this.ajax('assignConsultant', this.ticket().id(), consultant);
	},

	assignConsultantDone: function (data) {
		// console.log("assignConsultantDone");
		// console.log(data);
	},


// ------------ KB Functions ---------------- //

	kb_quotes: function() {
		var kb_quotes = {};
		kb_quotes.kb_success = this.random_kb_success_quote();
		return kb_quotes;
	},


	random_kb_success_quote: function () {
		var quote_array = [];
		var quote = {};

		quote_array.push({
			text:"You're swell!",
			pic:this.assetURL("e-badpokerface.png")});

		quote_array.push({
			text:"Awww, thanks for adding that!",
			pic:this.assetURL("e-awthanks.png")});

		quote_array.push({
			text:"You make Jen smile every time you add a KB article.",
			pic:this.assetURL("e-content.png")});

		quote_array.push({
			text:"I don't always add a KB, but when I do, I'm about 10x cooler.",
			pic:this.assetURL("e-dosequis.png")});

		quote_array.push({
			text:"You just made Steve proud.",
			pic:this.assetURL("e-jobs.png")});

		quote_array.push({
			text:"A mi me gusta cuando añadas un KB.",
			pic:this.assetURL("e-megusta.png")});

		quote_array.push({
			text:"You're like a KB ninja!",
			pic:this.assetURL("e-ninja.png")});

		quote_array.push({
			text:"#boom (drop the mic)",
			pic:this.assetURL("e-boom.gif")});

		quote_array.push({
			text:"I get a little emotional when someone adds a KB.",
			pic:this.assetURL("e-yey.png")});

		quote_array.push({
			text:"Only cool people add a KB. #suave",
			pic:this.assetURL("e-caruso.png")});

		quote_array.push({
			text:"Way to go!",
			pic:this.assetURL("e-thumbs_up.png")});

		quote_array.push({
			text:"This article is Wookie approved.",
			pic:this.assetURL("e-chewy.png")});

		quote_array.push({
			text:"You have just wowed our customers!",
			pic:this.assetURL("e-boom.gif")});

		quote_array.push({
			text:"Cheers!",
			pic:this.assetURL("e-beer.png")});

		quote_array.push({
			text:"You have all the best words.",
			pic:this.assetURL("e-trump.png")});

		var random_number = Math.floor(Math.random() * quote_array.length);

		return quote_array[random_number];
	},

// ------------ END KB Functions ---------------- //


	};
}());
