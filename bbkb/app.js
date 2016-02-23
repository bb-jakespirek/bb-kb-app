
	(function() {

	// var article_num_status = "";
	// var article_num_text = "";
	// var article_num_test = "";
	// var is_special_code = "";
	// var kb_article_number = "";
	// var kb_article_valid = "";

	// var subject = "";
	// var product = "";
	// var assignee = "";
	// var assignee_name ="";


	// var help_topic = "";
	// var help_topic_valid = false;
	// var no_kb_necessary = false;

	// // School Info
	// var school_urls = {};
	// var school_url = "";
	// var app_url = "";
	// var prog_url = "";
	// var status = "";

	// var ae_name = "";
	// var ae_phone = "";
	// var ae_email = "";

	// var site_specs = "";
	// var support_handoffs = "";
	// var edition = false;
	// var notes = "";

	// var requester = "";
	// var authorized_contact = "";
	// var user_notes = "";

	// var ticket_new = "";


// TO-DO:
// get rid of all the vars above
// figure out how to side-load biz details for new tickets
// divide up new ticket / open ticket view details
// clean up the code




	// var Util = require('utilities.js');
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

		'click #chat_button': function(event) { 
			//event.preventDefault(); 
			console.log("chat clicked");
			this.disableSave();
			//this.$('div.more').toggle(); 
		},
		'click #phone_btn': function(event) { 
			//event.preventDefault(); 
			console.log("phone clicked");
			// alert(organization.ae_info.ae_phone);
			// alert("phone number","Test");
			this.$('#myModal').modal({
				backdrop: true,
				keyboard: true
			});
			this.$("#phone_input").select();

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



    initialize: function(data) { // function called when we load
		// if (data.firstLoad) {
		//   // this.switchTo('main');
		//   this.generate_app_view();
		// }

        

		

		this.resetGlobals();


		Info.test_func(this); 
		// pass the app as an argument to info.js
		// info.js looks like this:
		// test_func: function (app) {
		// 	console.log(app.ticket().id());
		// },		


		var ticket = this.ticket();

		// See if globals data is stale
		// if (this.appProperties.ticket_id == this.ticket().id()) {
		   //    console.log('ticket ID matches!');
		// } else {
		 //  console.log('ticket ID does not match!');
		// }



		// Check the ticket ID to see if things match
		// this.appProperties.ticket_id === this.ticket().id()

		// Check if it's a new ticket or not
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





	requester_changed: function() {
      // Requester changed - let's just regenerate everything including our handlebars
		if(this.ticket().requester()){
			this.get_organization_info();
		}
    },


    update_zd_custom_field: function(field_id, value) {
    	// ticket.customField("custom_field_22953480", "special_code");
  	    return this.ticket().customField( helpers.fmt('custom_field_%@', id), value );
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
		console.log("kb id changed");
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
		console.log("help topic changed");
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
		console.log("article status updated");
		this.generate_app_view();
	},


	field_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.get_organization_info();
		console.log("something we want changed ");
	},

	subject_changed: function () {
		// subject = ticket.subject();
		// this.update_app();
		this.generate_app_view();
		console.log("subject changed / setup search");
	},


	update_app2: function () {
		// var base = "k-12 on products";
		// var parent = base + "|";
		// var k12Products = base; 
		// var Core = parent+"core"; 
		// var onAccount = parent+"onaccount";
		// var onBoard = parent+"onboard";
		// var onCampus = parent+"oncampus";
		// var onMessage = parent+"onmessage";
		// var onRecord = parent+"onrecord";
		// var allK12Products = k12Products + "," + Core + "," + onAccount + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord + "," + "internal systems";
		// var allK12ProductsPKB = k12Products + "," + Core + "," + onAccount + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord;

		// var ticket = this.ticket();
		// var subject = ticket.subject();
		// if (!subject) {
		// 	subject="";
		// }
		// var product = ticket.customField("custom_field_21744040");
		// // var assignee = ticket.assignee();
		// // var assignee_name = assignee.user().name();

		// var kb_article_number = ticket.customField("custom_field_22930600");


		// switch (product) {
		// 	case 'core':
		// 		product = Core;
		// 		break;
		// 	case 'onaccount':
		// 		product = onAccount;
		// 		break;
		// 	case 'onboard':
		// 		product = onBoard;
		// 		break;
		// 	case 'oncampus':
		// 		product = onCampus;
		// 		break;	
		// 	case 'onmessage':
		// 		product = onMessage;
		// 		break;
		// 	case 'onrecord':
		// 		product = onRecord;
		// 		break;
		// 	default:
		// 		product = k12Products; 
		// 		break;
		// }

		// // Remove the first part of the subject up to the backslash
		// subject = subject.replace(/(.+\s?\\)/, ''); 

		// // Remove any other backslashes
		// subject = subject.replace('\\', '');
		
		// // Remove Five9 Call and CHAT:
		// subject = subject.replace('Five9 Call', '');
		// subject = subject.replace('CHAT:', '');



		// console.log("app updated");
		this.switchTo('app', {
			// username: test
			productName: product,
			articleNumber: kb_article_number,
			productDebug: ticket.customField("custom_field_21744040"),
			// chat_base_URL: "https://k12supportform.myschoolapp.com/chat/",
			chat_base_URL: "http://localhost:8888/k12-support-forms/chat/",
			baseURL: "http://bbkb.blackbaud.com/#sort=relevancy",
			baseURLpkb: "http://search.blackbaud.com/#sort=relevancy",
			ticketSubject: subject,
			k12Products: k12Products,
			allK12ProductsPKB: allK12ProductsPKB,
			allK12Products: allK12Products, 
			Core: Core,
			onAccount: onAccount,
			onBoard: onBoard,
			onCampus: onCampus, 
			onMessage: onMessage,
			onRecord: onRecord,
			notApplicable: "Not Applicable",
			article_num_status: article_num_status,
			article_num_text: article_num_text, 
			article_num_test: article_num_test,
			is_special_code: is_special_code,
			kb_article_valid: kb_article_valid,
			help_topic: help_topic,
			help_topic_valid: help_topic_valid,
			no_kb_necessary: no_kb_necessary,
			school_url: school_url,
			app_url: app_url,
			prog_url: prog_url,
			notes: notes,
			status : status,
			ae_name : ae_name,
			ae_phone : ae_phone,
			ae_email : ae_email,
			site_specs : site_specs,
			support_handoffs : support_handoffs,
			edition : edition,
			authorized_contact: authorized_contact,
			user_notes: user_notes,
			school_urls: school_urls,
			ticket_new: ticket_new,
			user_id: this.currentUser().id(),
			requester: requester

		});
	},


	// activate_app: function() {
	// 	// console.log("do something");
	// 	var ticket = this.ticket();

	// 	// console.log("status = " + ticket.status());
	// 	if (ticket.status() == "new") {
	// 		ticket_new = true;
	// 		// console.log("this is a new ticket");
	// 		// var organization = this.ticket().organization();
	// 		// if (!organization) {
	// 		// 	return;
	// 		// }

	// 	}
	// 	else {
	// 		ticket_new = false;
	// 	}
		
	// 	this.update_app();
	// 	this.kb_id_changed();
	// 	this.help_topic_changed();
	// 	this.get_school_info();

	// },




	check_data: function() {
        // Check if it's a new ticket or not
        if (ticket.status() == "new") {
        	// ticket.isNew()
			ticket_new = true;
		}
		else {
			ticket_new = false;
		}

	},

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


	// fix_organization_info: function() {


	// },






	make_chat_link: function() {
		var ticket = this.ticket();
		var subject = ticket.subject();
		var chat_base_URL = "http://localhost:8888/k12-support-forms/chat/";
		// var chat_base_URL = "https://k12supportform.myschoolapp.com/chat/";

		var user_id = this.currentUser().id();
		var requester = ticket.requester();

		var product = ticket.customField("custom_field_21744040");


		// console.log(requester);
		// console.log(requester.email());
		var chat_url = chat_base_URL; 
		chat_url += "?requester=" + requester.email();
		chat_url += "&requester_name=" + requester.name();
		chat_url += "&assignee=" + user_id;
		chat_url += "&assignee_name=" + this.currentUser().name();;
		
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

		if (ticket.isNew()) {
			ticket_new = true;
		}

		if (typeof this.appProperties.org_data.id != 'undefined') {
			if (this.appProperties.ticket_id === this.ticket().id()){
				console.log("The ticket ID's match");
			} else {
				console.log("Yikes. The ticket ID's don't match");
			}
			console.log("this.appProperties.org_data.id");
			console.log(this.appProperties.org_data.id);

			this.switchTo('app', {
			// this.switchTo('test', {
				ticket_new: ticket_new,
				kb_links: KB.make_kb_links(ticket),
				no_kb_necessary: KB.kb_needed_test(ticket),
				// help_topic_valid: KB.check_help_topic(ticket),
				help_topic_valid: kb_info.help_topic_valid,
				kb_article_valid: kb_info.kb_article_valid,
				// kb_article_valid: KB.check_kb_id(ticket.customField("custom_field_22930600")),

				kb_article_number: ticket.customField("custom_field_22930600"),
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
			console.log("don't update the view yet!");
			this.switchTo('loading', {
					user_id: this.currentUser().id()
			});	
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

		var quote_array = [];
		
		var quote = {};
		quote.txt = "You're swell!";
		quote.pic = this.assetURL("emoticons/badpokerface.png");
		quote_array.push(quote);

		var quote = {};
		quote.txt = "You did great!";
		quote.pic = this.assetURL("emoticons/boom.gif");
		quote_array.push(quote);	

		var quote = {};
		quote.txt = "What if you did another one?";
		quote.pic = this.assetURL("emoticons/philosoraptor.png");
		quote_array.push(quote);	

		var random_number = Math.floor(Math.random() * quote_array.length);

		return quote_array[random_number];

	},


// ------------ END KB Functions ---------------- //




















	old_gen_app: function(org_data) {
		console.log("test view");

		var ticket = this.ticket(),
          ccArray;


        var ticket_new, org_info;

        var my_org;
        var requester = {};
		

        // Check if it's a new ticket or not
        if (ticket.status() == "new") {
        	// ticket.isNew()
			ticket_new = true;
		}
		else {
			ticket_new = false;
		}

		// Look for requester
		if (ticket.requester()) {
			requester = ticket.requester();
			var req_org = requester.organizations();

			// var test = ticket.requester().organizations().notes();
			console.log(requester);
			// console.log(requester.organizations());
			// console.log(test);


			this.get_organization_info();

			// if(this.ticket().organization()) {
			// 	// console.log(this.ticket().organization().id());
			// 	// console.log(this.ticket().organization().name());
			// 	// organization.id = this.ticket().organization().id();
			// 	this.get_organization_info();
			// 	console.log("organization in test view");
			// 	var organization_data = this.appProperties.org_data;
			// 	console.log(organization_data);
				
      			
			// }

			// console.log(requester.organizations().id);
			// console.log("req_org:");
			// console.log(req_org[0] );
			// console.log("req_org_id:");
			// console.log(req_org[0].id );

			// console.log(req_org[0]['id'] + " = req_org [id]");
			// organization = this.ticket().organization();
			// notes = organization.notes();

		} else {
			requester.name = "None selected";
			// notes = "No org yet";
		}



		this.switchTo('test', {
			ticket_new: ticket_new,
			user_id: this.currentUser().id(),
			organization: org_info,
			requester: requester

		});
	}
	// end generate_app_view function





	};
	// 

	}());
