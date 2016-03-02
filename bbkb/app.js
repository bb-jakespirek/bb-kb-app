
	(function() {


// TO-DO:



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


		'ticket.subject.changed' : 'subject_changed',
		'ticket.requester.id.changed' : 'requester_changed',
	    'ticket.requester.email.changed': 'requester_changed',

		'ticket.custom_field_22930600.changed' : 'kb_id_changed', // kb_id_changed
		'ticket.custom_field_22790214.changed' : 'help_topic_changed', //help_topic_changed
		'ticket.custom_field_22222564.changed' : 'field_changed', // kb_id_changed (About Field)

		'ticket.custom_field_21744040.changed' : 'field_changed', // Product field

		'click .save_button': 'chat_transcript_save',


		'ticket.save': 'ticketSaveHandler',

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
			// this.$("#phone_input").select();

			   //    this.switchTo('modal', {
      //   header: this.I18n.t('modal_header'),
      //   body: this.I18n.t('modal_body')
      // });
			//this.$('div.more').toggle(); 
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

	    
	},

    requests: require('requests.js'),

    ticketSaveHandler: function() {
    	var ticket = this.ticket();
    	var no_kb_necessary = KB.kb_needed_test(ticket);
    	var has_kb_or_help = false;
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));
		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));

		if (kb_article_valid || help_topic_valid) {
			has_kb_or_help = true;
		}
		// console.log(no_kb_necessary);
		// console.log(kb_article_valid);
		// console.log(ticket.status());

    	if (no_kb_necessary !== true && has_kb_or_help === false) {
    		// !ticket.isNew() && ticket.status() != "open" && ticket.status() != "pending"
    		if (ticket.status() == "solved") {
    			this.growl_kb_needed(ticket);
    		}
    		
    	} else {
    		
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
		services.notify(msg.fmt(ticket_id, ticket_id), 'alert', life * 1000);
    },

    initialize: function(data) { // function called when we load
		// console.log("initialize");

		// if (data.firstLoad) {
		//   // this.switchTo('main');
		//   console.log("data.firstLoad");
		//   // this.generate_app_view();
		// }
		this.resetGlobals();


		// this.growl_kb_needed();

		// Info.test_func(this); 
		// pass the app as an argument to info.js
		// info.js looks like this:
		// test_func: function (app) {
		// 	console.log(app.ticket().id());
		// },		


		// https://developer.zendesk.com/apps/docs/agent/interface
		// var field = this.ticketFields('tags')
		// field.hide();

		// var myCustomField = this.ticketFields('custom_field_30584448');
		// var option = _.find(myCustomField.options(), function(opt) {
  //         return opt.value();
  //       });
  // myCustomField.options		
  		// myCustomField.required = true;
  		// myCustomField.required();

		// myCustomField.isRequired();
		// console.log("required? " + myCustomField.isRequired());
		// console.log(myCustomField);


		// disable customer impact field from being changed by analyst
		var customer_impact_field = this.ticketFields('custom_field_28972337');
		customer_impact_field.disable();
		// kb status
		this.ticketFields('custom_field_22953480').disable();
		
		// ticket source
		this.ticketFields('custom_field_27286948').disable();

		// chat dispatched
		this.ticketFields('custom_field_29482057').disable();
		
		// test



		// this.$("button.continue").html("Next Step...")

		var ticket = this.ticket();

		// check to see if KB is attached.
		this.update_article_status();

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

        if (ticket.status() == "new") {
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
			// var organization = this.ticket().organization();
			// // console.log(typeof organization);
			// this.appProperties.org_data = organization;
			// console.log("init----");
			// console.log(organization);
			// console.log("end init----");

			// this.generate_app_view();
		}


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
		this.update_article_status();

		// var ticket = this.ticket();

		// // subject = ticket.subject();
		// // this.update_app();
		
						
		// // this.appProperties
		// // var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));

		// // if (kb_article_valid) {
		// // 	this.change_zd_custom_field(22930600,"special_code");
		// // }
		// this.generate_app_view();
		// console.log("kb id changed");
	},

    help_topic_changed: function () {
		this.update_article_status();

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

	
	update_article_status: function () {
		var ticket = this.ticket();

		var help_topic_valid = KB.check_help_topic(ticket.customField("custom_field_22790214"));
		var kb_article_valid = KB.check_kb_id(ticket.customField("custom_field_22930600"));

		this.appProperties.kb_info.kb_article_valid = kb_article_valid;
		this.appProperties.kb_info.help_topic_valid = help_topic_valid;

		var no_kb_necessary = false;
		// subject = ticket.subject();
		if (help_topic_valid && kb_article_valid) {
			ticket.customField("custom_field_22953480", "kb_and_help_topic_attached");
		} 
		else if (!help_topic_valid && kb_article_valid) {
			ticket.customField("custom_field_22953480", "kb_article_attached");
		} 
		else if (help_topic_valid && !kb_article_valid) {
			ticket.customField("custom_field_22953480", "help_topic_attached");
		} 
		else {
			if(KB.kb_needed_test(ticket)) {
				ticket.customField("custom_field_22953480", "needs_kb_article");
			}
			else {
				ticket.customField("custom_field_22953480", "no_kb_necessary");
				no_kb_necessary = true;
			}
			
		}
		// this.update_app();
		// console.log("article status updated");
		this.generate_app_view();
	},


	field_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.get_organization_info();
		// console.log("something we want changed ");
	},

	subject_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.generate_app_view();
		// console.log("subject changed / setup search");
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


	get_organization_info: function() {

// TO DO
// test to make sure the org info is actually updated

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

    	// this.appProperties.kb_info = 


    	this.generate_app_view();
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

		if (ticket_source == "chat") {
			is_chat_ticket = true;
		}

		if (typeof this.appProperties.org_data.id != 'undefined') {
			if (this.appProperties.ticket_id === this.ticket().id()){
				// console.log("The ticket ID's match");
			} else {
				// console.log("Yikes. The ticket ID's don't match");
			}
			// console.log("this.appProperties.org_data.id");
			// console.log(this.appProperties.org_data.id);

			this.switchTo('app', {
			// this.switchTo('test', {
				ticket_new: ticket_new,
				kb_links: KB.make_kb_links(ticket),
				no_kb_necessary: KB.kb_needed_test(ticket),
				// help_topic_valid: KB.check_help_topic(ticket),
				help_topic_valid: kb_info.help_topic_valid,
				kb_article_valid: kb_info.kb_article_valid,
				is_chat_ticket: is_chat_ticket,
				// kb_article_valid: KB.check_kb_id(ticket.customField("custom_field_22930600")),

				kb_article_number: ticket.customField("custom_field_22930600"),
				help_topic: ticket.customField("custom_field_22790214"),
				// kb_quotes: this.kb_quotes(),
				// chat_base_URL: "https://k12supportform.myschoolapp.com/chat/",
				// chat_base_URL: "http://localhost:8888/k12-support-forms/chat/",

				organization: this.appProperties.school_info,	
				// organization: Info.fix_org_data(this.appProperties.org_data),
				school_urls: this.appProperties.school_info.organization_fields,

				chat_url: this.make_chat_link(),
				user_id: this.currentUser().id(),
				requester: ticket.requester()
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
		ticket_id: ticket_id
      };
    },



// ------------ KB Functions ---------------- //


	kb_quotes: function() {
		var kb_quotes = {};

		kb_quotes.kb_success = this.random_kb_success_quote();

		return kb_quotes;
	},

	random_kb_success_quote: function () {

		// var quote_array = [];
		
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

		// var random_number = Math.floor(Math.random() * quote_array.length);

		// return quote_array[random_number];

	},


// ------------ END KB Functions ---------------- //



















	};
	// 

	}());
