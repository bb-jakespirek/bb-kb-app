	(function() {

	var KB =  require('kb.js');
	var Info =  require('info.js');

	return {

	appProperties: {
      // This is available globally in your functions via this.appProperties.org_data
      // We need to be very careful here though. When setting this, it might be possible previous data or unrelated data is served.
      // This would also be shared among different instances of the app (per user) so if the agent switches tabs the data might be
      // in the object may no longer be relevant. One way to get around that would be to make sure when setting data to include the
      // current ticket_id in the object, so we can check that this.appProperties.ticket_id === this.ticket().id() before we trust the data.
		"org_data": {},
		"kb_info": {},
		"school_info":{},
		"bug_info":{},
		ticket_id: 0
    },

  //   requests: {
  //   	fetchOrganization: function() {
		// 	console.log("fetchOrganization ran");
		// 	return {
		// 		url:  '/api/v2/organizations/28110694.json', //hard coded for now
		// 		type: 'GET'
		// 	};
		// }
  //   },

	events: {

		// 'app.activated': function() {
		// 	this.activate_app();
		// },
		'app.activated': 'initialize',

		// 'fetchBookmarks.done': 'fetchBookmarksDone',
		'fetchOrganization.done': 'fetchOrganizationDone',
		'fetchProblemTicketInfo.done': 'fetchProblemTicketInfoDone',


		'ticket.subject.changed' : 'subject_changed',
		'ticket.type.changed' : 'type_changed',

		'ticket.requester.id.changed' : 'requester_changed',
	    'ticket.requester.email.changed': 'requester_changed',

		'ticket.custom_field_22930600.changed' : 'kb_id_changed', // kb_id_changed
		'ticket.custom_field_22790214.changed' : 'help_topic_changed', //help_topic_changed
		'ticket.custom_field_22222564.changed' : 'about_changed', // About Field

		'ticket.custom_field_21744040.changed' : 'field_changed', // Product field

		'ticket.custom_field_30300358.changed' : 'bug_priority_changed', // bug priority field

		// 'ticket.problem_id.changed' : 'link_problem_changed', // link_problem field



		'click .save_button': 'chat_transcript_save',


		'ticket.save': 'ticketSaveHandler',
		'ticket.submit.done': 'ticketSaveDoneHandler',


		'createTicketRequest.always': 'createTicketRequestDone',
		'updateIncidentTicket.always': 'updateIncidentTicketDone',


		'click #chat_button': function(event) {

			//this.disableSave();

		},
		'click #phone_btn': function(event) {
			//event.preventDefault();
			// console.log("phone clicked");
			// alert(organization.ae_info.ae_phone);
			// alert("phone number","Test");
			this.$('#phone_modal').modal({
				backdrop: true,
				keyboard: true
			});

		},

		'click #chat_transcript_btn': function(event) {
			// var ticket = this.ticket();
	    	// var chat_transcript = ticket.customField("custom_field_30844127");
			//event.preventDefault();
			// console.log("phone clicked");
			// alert(organization.ae_info.ae_phone);
			// alert("phone number","Test");
			// this.$('#chat_transcript').val(chat_transcript);


			this.$('#chat_transcript_modal').modal({
				backdrop: true,
				keyboard: true
			});
			// this.$("#phone_input").select();

			   //    this.switchTo('modal', {
      //   header: this.I18n.t('modal_header'),
      //   body: this.I18n.t('modal_body')
      // });
			//this.$('div.more').toggle();
		},

    'click #phone_input': function(event) {

			this.$("#phone_input").select();

		},

    'click #create_bug_btn': function(event) {

			// this.$("#phone_input").select();
			console.log("create a new bug");
			var ticket = this.ticket();

			var custom_fields = [{"id": 22222564, "value": "product_owner__bug"}];
			this.ajax('createTicketRequest', ticket, custom_fields);
			// this.ajax('createTicketRequest', ticket);
			// services.notify('Created copy of this ticket', 'notice', 1500);
		},

		// 'click .submit': function(event) {
		// 	event.preventDefault();
		// 	this.$(event.target).hide();
		// },

		'click #pop_test_toggle': function(event) {
			this.$('#kb_success_popover').popover('show');
			var app = this;
			// setTimeout(function() { app.$('#pop_test').popover('hide'); }, 10000);
		},

		// 'click #test_btn': function(event) {
		// 	this.test_jquery();
		// },


	},

  requests: require('requests.js'),



	initialize: function(data) { // function called when we load
	console.log("initialize");
	var ticket = this.ticket();
	var sla_date_before = ticket.customField("custom_field_31407407");
console.log("sla_date_before",sla_date_before);
	// if (data.firstLoad) {
	// //   // this.switchTo('main');
	//   console.log("data.firstLoad");

	// //   // this.generate_app_view();
	// }
	this.resetGlobals();

	// https://developer.zendesk.com/apps/docs/agent/interface

	// disable customer impact field from being changed by analyst
	var customer_impact_field = this.ticketFields('custom_field_28972337');
	customer_impact_field.disable();
	// kb status
	this.ticketFields('custom_field_22953480').disable();

	// ticket source
	this.ticketFields('custom_field_27286948').disable();

	// chat dispatched
	this.ticketFields('custom_field_29482057').disable();

	// Disable PD Only fields for all groups except PSLs and PMs

	var group_array = ["Product Support Leads", "Product Managers"];
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

	var ticket = this.ticket();

	// check to see if KB is attached.
	// this.update_article_status();

	// See if globals data is stale
	// if (this.appProperties.ticket_id == this.ticket().id()) {
	//       console.log('ticket ID matches');
	// } else {
	//   console.log('ticket ID does not match!');
	// }

	// Check the ticket ID to see if things match
	// this.appProperties.ticket_id === this.ticket().id()

	// Check if it's a new ticket or not

	var ticket_new;

  if (ticket.status() === "new") {
      	// ticket.isNew()
		ticket_new = true;

		if (ticket.requester()) {
			this.get_organization_info();
		}
		else {
			this.switchTo('new', {
				// ticket_new: ticket_new,
				user_id: this.currentUser().id(),
				// organization: org_info,
				// requester: requester
			});
		}

	}
	else {
		ticket_new = false;
		this.get_organization_info();
		if (ticket.type() === "incident") {
			this.get_problem_ticket_info();

		}
		// var organization = this.ticket().organization();
		// // console.log(typeof organization);
		// this.appProperties.org_data = organization;
		// console.log("init----");
		// console.log(organization);
		// console.log("end init----");

		// this.generate_app_view();
	}


  },





  'ticket.save': function() {
    // do something
    return "The ticket wasn't saved!";
	},

  ticketSaveHandler: function() {
  	var ticket = this.ticket();
  	var type = ticket.type();
  	var about = ticket.customField("custom_field_22222564");


  	// KB Stuff
  	var no_kb_necessary = KB.no_kb_needed_test(ticket);
  	var has_kb_or_help = false;
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));
		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));
		var internal_kb_rec = KB.internal_kb_recommended(ticket);

		if (kb_article_valid || help_topic_valid) {
			has_kb_or_help = true;
		}

	// this.$('#test_popover').popover({
	//     placement : 'right',
	//     html : true,
	//     delay: {
	//        show: "0",
	//        hide: "10"
	//     }
	// });
	// 			// this.$('#test_popover').popover('show');

	// this.$('#test_popover').on('show.bs.popover', function() {
	// 	// console.log("shown");
	//     setTimeout(function() {
	//         this.$('#test_popover').popover('hide');
	//     }, 1000);
	// });
	    				// this.$('#test_popover').popover('hide');
			// console.log(hold_status);


	// Hold
	if (ticket.status() == "hold") {
		// Hold Stuff
		var hold_status = ticket.customField("custom_field_30584448");

		if (hold_status === "") {
  			// this.growl_hold_status_needed(ticket);

  			// This should only affect Support people
				console.log("hold status check groups");
  			var group_array = ["Support", "Product Support Leads", "Support Relationship Manager"];
  			if (this.check_user_groups(group_array)) {



    			this.$('#hold_modal').modal({
					backdrop: true,
					keyboard: true
				});
  				return "The ticket wasn't saved! You need a Hold Status before submitting again.";
  			}

  		}
	} else {
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

		this.generate_app_view();
  },

	ticketSaveDoneHandler: function() {
		// console.log("save done");
		this.get_problem_ticket_info();
		this.generate_app_view();
	},


// Ticket Field Changes --------------------

	bug_priority_changed: function () {
		console.log("bug priority changed check groups");
		var group_array = ["Product Support Leads", "Product Managers"];
		if (this.check_user_groups(group_array)) {
			console.log('current user is a PSL or PM');
			// Only modify if they are a PSL or PM
			this.set_pd_sla_date();
		} else {
			console.log("disabling the pd sla field");
			this.ticketFields('custom_field_31407407').hide();
		}
		this.generate_app_view();
	},

	// link_problem_changed: function () {
	// 	console.log("link_problem_changed");
	// 	this.get_problem_ticket_info();
	// 	this.generate_app_view();
	// },

  about_changed: function () {
  	this.type_changed();
  	this.generate_app_view();
  },

  type_changed: function () {
  	var ticket = this.ticket();
  	var type = ticket.type();
  	var about = ticket.customField("custom_field_22222564");

  	// console.log(ticket.type());
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
		console.log("check user groups");
  	// This function returns true if user is one of the groups
	var current_user_groups = this.currentUser().groups();
	var group_names = [];
	var in_group;


	// Add each group name to an array called group_names
	_.each(current_user_groups, function(element, index, list){
		// console.log(element.name());
		group_names.push(element.name());
	});
	// console.log('Current groups',group_names);

	_.each(group_array, function(element, index, list){
		if (_.contains(group_names, element)) {
			// console.log("returning true",element);
			in_group = true;
			return in_group;
		}
	});
	if (in_group) {
		return true;
	}
},

  growl_kb_needed: function(ticket) {
	// https://developer.zendesk.com/apps/docs/agent/services
	// https://developer.zendesk.com/apps/docs/agent/events#ticket.save-hook
	var msg  = "Hey now! You didn't include a KB article or Help Topic, and this ticket needs one. <a href='#/tickets/%@'>%@</a>";
	var life = parseInt(this.$('#life').val(), 10);
	life = isNaN(life) ? 10 : life;
	var ticket_id = ticket.id();
	// services.notify(msg.fmt(life), 'notice', life * 1000);
	// notice, alert, error
	services.notify(msg.fmt(ticket_id, ticket_id), 'error', life * 1000);
  },

  growl_hold_status_needed: function(ticket) {
	// https://developer.zendesk.com/apps/docs/agent/services
	// https://developer.zendesk.com/apps/docs/agent/events#ticket.save-hook
	var msg  = "Hold your horses, you didn't include a Hold Status. <a href='#/tickets/%@'>%@</a>";
	var life = parseInt(this.$('#life').val(), 10);
	life = isNaN(life) ? 6 : life;
	var ticket_id = ticket.id();
	// services.notify(msg.fmt(life), 'notice', life * 1000);
	// notice, alert, error
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
	// this.$('.modal-body textarea').text();
	// console.log(this.$('#chat_transcript').val());

	// ticket.customField('custom_field_30844127', modal_transcript);

	// var name = ticket.requester().name().split(" ");
	// name = name[0];

	// var greeting = "Hi " + name + ", thanks for chatting today. Here is the transcript of our chat. You can reply by email with any further comments related to this ticket.";

	// comment.appendMarkdown(greeting);
	// comment.appendMarkdown('---');
	// comment.appendMarkdown('## Chat Transcript:');

	var full_comment;
	// full_comment = '\r' + greeting + '\r\r';
	full_comment = '\r';
	full_comment += '---' + '\r';
	full_comment += '## Chat Transcript:' + '\r';

	var updated_transcript = this.format_chat_transcript();
	// ticket.customField("custom_field_30844127");

	full_comment += updated_transcript;

	comment.appendMarkdown(full_comment);

	this.$('#chat_transcript_modal').modal('hide');


},



format_chat_transcript: function() {
  	var ticket = this.ticket();
  	var raw_chat_transcript = this.$('#chat_transcript').val();


  	// console.log("chat transcript fixed");
  	// console.log(this.$('#chat_transcript').val());

	// subject = raw_subject.replace(/(.+\s?\\)/, '');

	// // Remove any other backslashes
	// subject = subject.replace('\\', '');

	// // Remove Five9 Call and CHAT:
	// subject = subject.replace('Five9 Call', '');
	// subject = subject.replace('CHAT:', '');

	// console.log("check the kb id");
	// var pattern = new RegExp("---");
	// var already_formatted = pattern.test(raw_chat_transcript);
	// console.log("it's been formatted");

	// if (!already_formatted) {
		var pattern = new RegExp(/^(([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9] ?(AM|PM)) (\[(.*)\])/igm);
		// var replacement = " --- \r\r\r*$1* **$5:**\r  \t";
		var replacement = " \r\r\r*$1* **$5:**\r  \t";
		var fixed_chat_transcript = raw_chat_transcript.replace(pattern, replacement);
		// ticket.customField('custom_field_30844127', fixed_chat_transcript);
		// console.log(fixed_chat_transcript);
		return fixed_chat_transcript;
	// }


  },




	requester_changed: function() {
      // Requester changed - let's just regenerate everything including our handlebars
		if(this.ticket().requester()){
			this.get_organization_info();
		}
  },


  update_zd_custom_field: function(field_id, value) {
  	// ticket.customField("custom_field_22953480", "special_code");
	    return this.ticket().customField( helpers.fmt('custom_field_%@', field_id), value );
  },

  kb_id_changed: function () {
	// this.update_article_status();

	// var ticket = this.ticket();

	// // subject = ticket.subject();
	// // this.update_app();


	// // this.appProperties
	// // var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));

	// // if (kb_article_valid) {
	// // 	this.change_zd_custom_field(22930600,"special_code");
	// // }
	this.generate_app_view();
	// console.log("kb id changed");
	},

  help_topic_changed: function () {
		// this.update_article_status();
		this.generate_app_view();
		// var ticket = this.ticket();

		// subject = ticket.subject();
		// this.update_app();


		// this.appProperties
		// var help_topic_valid = this.appProperties.kb_info.help_topic_valid;

		// help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));

		// if (help_topic_valid) {
		// 	// this.change_zd_custom_field(22790214,"special_code");
		// 	this.appProperties.kb_info.help_topic_valid
		// }

		// this.generate_app_view();
		// console.log("help topic changed");
	},

	// test_jquery: function () {
	// 	var $test = this.$('#pop_test_toggle');
	// 	$test.hide();
	// 	// console.log($test.is(':visible'));
	// 	this.$('#pop_test').popover('show');
	// },


	update_article_status: function () {
		var ticket = this.ticket();

		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));
		var no_kb_necessary = KB.no_kb_needed_test(ticket);

		this.appProperties.kb_info.kb_article_valid = kb_article_valid;
		this.appProperties.kb_info.help_topic_valid = help_topic_valid;
		// this.appProperties.kb_info.show_kb_popup = false;
		var kb_status_before = ticket.customField("custom_field_22953480");
		var kb_status_after;
		this.appProperties.kb_info.show_kb_popup = false;
		// console.log(kb_status_before + " kb before");

		// subject = ticket.subject();
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
		// console.log("update article status");


		if (kb_status_before == "needs_kb_article" && kb_status_after != "needs_kb_article") {
			// console.log("it used to be needs_kb_article");
			if (kb_article_valid || help_topic_valid)  {
				// console.log("now it's valid, show popup");
				this.appProperties.kb_info.show_kb_popup = true;
			// this.test_jquery();
				// var $test = this.$('#pop_test_toggle');
				// $test.hide();
				// console.log($test.is(':visible'));
				// $test.hide();
				// this.$('#pop_test_toggle').hide();
				// this.$('#pop_test').popover('show');
				// var app = this;
				// setTimeout(function() { app.$('#pop_test').popover('hide'); }, 10000);
			}

		}


		// this.update_app();
		// console.log("article status updated");
		// this.generate_app_view();
	},


	field_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.get_organization_info();
		this.generate_app_view();
		// console.log("something we want changed ");
	},

	subject_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.generate_app_view();
		// console.log("subject changed / setup search");
	},




	set_pd_sla_date: function () {
		console.log("set pd sla date");
		// console.log("set pd sla date");
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

		// console.log(new_sla_date);
		// Make sure that the person cleared out the SLA Date field first.
		if (sla_date == null) {
			ticket.customField("custom_field_31407407", new_sla_date);
		}
	},

	format_date_object: function (date_object) {
		if (date_object !== null) {
			// This changes it to MM/DD/YYYY
			var formatted_date = date_object.getMonth() + 1 + "/" + date_object.getDate() + "/" + date_object.getFullYear();
			return formatted_date;
		}
	},


	fix_inverted_date_formatting: function (date_string) {
		var formatted_date;
		if (date_string !== "") {
			//original is YYYY-MM-DD
			var str = date_string.split("-");
			// This gets it to MM/DD/YYYY
			formatted_date = str[1] + "/" + str[2] + "/" + str[0];

		}
		else {
			formatted_date = "";
		}
		return formatted_date;
	},




	// check_data: function() {
 //        // Check if it's a new ticket or not
 //        if (ticket.status() == "new") {
 //        	// ticket.isNew()
	// 		ticket_new = true;
	// 	}
	// 	else {
	// 		ticket_new = false;
	// 	}

	// },

	get_problem_ticket_info: function() {
		var ticket = this.ticket();
		if (ticket.customField('problem_id') > 0) {
			// console.log("running get problem ticket info");
			var problem_ticket = ticket.customField('problem_id');
			if (problem_ticket != null) {
				this.ajax('fetchProblemTicketInfo', problem_ticket);
			}

		} else {
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


	fetchOrganizationDone: function(data) {
		var org_data = data.organization;
  	this.appProperties.org_data = org_data;
  	this.appProperties.school_info = Info.fix_org_data(org_data);
  	this.generate_app_view();
  },


	fetchProblemTicketInfoDone: function(data) {
		// console.log("finished grabbing problem info ");
		// console.log(data.ticket);
		var bug_info = {};
		var custom_fields = data.ticket.custom_fields;
		// console.log(custom_fields);

		var bug_priority = _.find(custom_fields, function(item) { return item.id == 30300358; });
		var bug_sla_date = _.find(custom_fields, function(item) { return item.id == 31407407; });

		bug_info.priority = bug_priority.value;
		bug_info.sla_date = this.fix_inverted_date_formatting(bug_sla_date.value);

  	this.appProperties.bug_info = bug_info;
  	// this.appProperties.school_info = Info.fix_org_data(org_data);
  	this.generate_app_view();
  },


	createTicketRequestDone: function(data){
			var incident_ticket_id = this.ticket().id();
			var problem_ticket_id = data.ticket.id;
			console.log('Created Ticket ID: ' + data.ticket.id);
			var msg  = "Created new ticket #<a href='#/tickets/%@'>%@</a>.";
			this.ajax('updateIncidentTicket', incident_ticket_id, problem_ticket_id);
			services.notify(msg.fmt(problem_ticket_id, problem_ticket_id), 'notice', 5000);

  },

	updateIncidentTicketDone: function(data){
		// var ticket_id = data.ticket.id;
		// var msg  = "Updated and linked incident ticket #<a href='#/tickets/%@'>%@</a>.";
		// services.notify(msg.fmt(ticket_id, ticket_id), 'notice', 5000);
	},




	make_chat_link: function() {
		var ticket = this.ticket();
		var subject = ticket.subject();
		// var chat_base_URL = "http://localhost:8888/k12-support-forms/chat/";
		var chat_base_URL = "https://k12supportform.myschoolapp.com/chat/";

		var user_id = this.currentUser().id();
		var requester = ticket.requester();

		var product = ticket.customField("custom_field_21744040");


		// console.log(requester);
		// console.log(requester.email());
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
		console.log("check if in group");
		if (this.check_user_groups(group_array)) {
			return true;
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

		var authorized_contact = ticket.requester().customField("authorized_contact");

		if (ticket.isNew()) {
			ticket_new = true;
		}

		if (ticket_source == "chat") {
			is_chat_ticket = true;
		}

		// Set the KB article status field
		this.update_article_status();

		if (typeof this.appProperties.org_data.id != 'undefined') {
			if (this.appProperties.ticket_id === this.ticket().id()){
				// console.log("The ticket ID's match");
			} else {
				// console.log("Yikes. The ticket ID's don't match");
			}
			// console.log("this.appProperties.org_data.id");
			// console.log(this.appProperties.org_data.id);
			// this.$('#pop_test').popover('show');
			this.switchTo('app', {
			// this.switchTo('test', {
				ticket_new: ticket_new,
				kb_links: KB.make_kb_links(ticket),
				no_kb_necessary: KB.no_kb_needed_test(ticket),
				internal_kb_rec: KB.internal_kb_recommended(ticket),
				// help_topic_valid: KB.check_help_topic(ticket),
				help_topic_valid: kb_info.help_topic_valid,
				kb_article_valid: kb_info.kb_article_valid,
				show_kb_popup: kb_info.show_kb_popup,
				is_chat_ticket: is_chat_ticket,
				user_is_psl: this.check_if_in_group(["Product Support Leads"]),
				// kb_article_valid: KB.check_kb_id(ticket.customField("custom_field_22930600")),
				bug_info: this.get_bug_info(),
				kb_article_number: ticket.customField("custom_field_22930600"),
				help_topic: ticket.customField("custom_field_22790214"),
				kb_quotes: this.kb_quotes(),
				// chat_base_URL: "https://k12supportform.myschoolapp.com/chat/",
				// chat_base_URL: "http://localhost:8888/k12-support-forms/chat/",

				organization: this.appProperties.school_info,
				// organization: Info.fix_org_data(this.appProperties.org_data),
				school_urls: this.appProperties.school_info.organization_fields,

				authorized_contact: authorized_contact,
				user_notes: ticket.requester().notes(),

				chat_url: this.make_chat_link(),
				user_id: this.currentUser().id(),
				requester: ticket.requester(),
				// Don't necessarily need this:
				// hold_status_options: this.ticketFields('custom_field_30584448').options()
			});
		} else {
			// console.log("don't update the view yet!");
			if (ticket.requester()) {
				this.switchTo('loading', {
					user_id: this.currentUser().id()
				});
			} else {
				this.switchTo('new', {
					// ticket_new: ticket_new,
					user_id: this.currentUser().id(),
					// organization: org_info,
					// requester: requester
				});
			}

		}



	},

  resetGlobals: function(){
      var ticket_id = this.ticket().id();
      this.appProperties = {
		"org_data": {},
		"kb_info": {},
		"school_info":{},
		"bug_info":{},
		ticket_id: ticket_id
      };
  },



	get_bug_info: function() {
		var ticket = this.ticket();
		var type = ticket.type();
		var bug_priority = ticket.customField("custom_field_30300358");
		var sla_date = ticket.customField("custom_field_31407407");
console.log("get_bug_info", sla_date);
		var bug_info = {};
		bug_info.show = false;

		if (type === "problem" && bug_priority !== "") {
			bug_info.show = true;
			bug_info.priority = bug_priority;
			if (sla_date !== "") {
				bug_info.sla_date = this.format_date_object(sla_date);
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


		// console.log(quote_array);
		var random_number = Math.floor(Math.random() * quote_array.length);

		return quote_array[random_number];
		// return quote_array[14];

// var person = {firstName:"John", lastName:"Doe", age:46};
// var person2 = new person;

		// quote_array[0] = ["txt"];
		// var quote = {};
		// quote.txt = "You're swell!";
		// quote.pic = this.assetURL("emoticons/badpokerface.png");
		// quote_array.push(quote);

		// var quote = {};
		// quote.txt = "You did great!";
		// quote.pic = this.assetURL("emoticons/boom.gif");
		// quote_array.push(quote);

		// var quote = {};
		// quote.txt = "What if you did another one?";
		// quote.pic = this.assetURL("emoticons/philosoraptor.png");
		// quote_array.push(quote);



	},


// ------------ END KB Functions ---------------- //



















	};
	//

	}());
