
	// 
	// https://whipplehill.zendesk.com/agent/tickets/54637?zat=true

	// Custom fields
	// https://developer.zendesk.com/apps/docs/agent/data
	// curl http://services.faa.gov/airport/status/SFO -H "Accept: application/json"
	// curl http://jsonblob.com/api/jsonBlob/555f9ee2e4b02057f77c7557 -H "Accept: application/json"

	// JSON
	// https://support.zendesk.com/hc/en-us/articles/203691456

	// test locally
	// https://support.zendesk.com/hc/en-us/articles/203691236
	// OLD: cd /Applications/MAMP/htdocs/zendesk_api/app/bbkb

	// cd /Users/jake.spirek/Dropbox/BBWH/GitHub/zd-kb/bbkb
	// zat server
	// zat package

	// custom_field_22930600 = KB article
	// custom_field_22790214 = Help Topic




	(function() {

	var article_num_status = "";
	var article_num_text = "";
	var article_num_test = "";
	var is_special_code = "";
	var kb_article_number = "";
	var kb_article_valid = "";

	var subject = "";
	var product = "";
	var assignee = "";
	var assignee_name ="";


	var help_topic = "";
	var help_topic_valid = false;
	var no_kb_necessary = false;

	// School Info
	var school_url = "";
	var app_url = "";
	var status = "";

	var ae_name = "";
	var ae_phone = "";
	var ae_email = "";

	var site_specs = "";
	var support_handoffs = "";
	var edition = "";
	var notes = "";

	var requester = "";
	var authorized_contact = "";
	var user_notes = "";



	return {
	events: {
		// 'app.activated':'doSomething'
		'app.activated': function() {
			this.activate_app();
		},
		'ticket.custom_field_22930600.changed' : 'kb_id_changed',
		'ticket.custom_field_22790214.changed' : 'help_topic_changed',
		'ticket.custom_field_22222564.changed' : 'kb_id_changed',
		'ticket.subject.changed' : 'subject_changed'
	},


	kb_id_changed: function () {
		var ticket = this.ticket();
		kb_article_number = ticket.customField("custom_field_22930600");

		console.log("kb id changed");

		var pattern = new RegExp(/^[0-9]{5,6}$/g);
		var article_num_test = pattern.test(kb_article_number);
		// console.log(article_num_test + " article_num_test");

		if (article_num_test) {
			article_num_status = "bg-success text-success";
			article_num_text = "KB Article Number:";
			ticket.tags().add("valid_code");
			ticket.tags().remove("needs_kb_article");
			ticket.customField("custom_field_22953480", "kb_article_attached");
			is_special_code = false;
			if (kb_article_number == "00000" | kb_article_number == "000000" | kb_article_number == "111111" | kb_article_number == "22222" | kb_article_number == "222222") {
				is_special_code = true;
				article_num_status = "bg-warning text-warning";
				ticket.tags().add("special_code");
				ticket.tags().remove("valid_code");
				ticket.tags().remove("needs_kb_article");
				ticket.customField("custom_field_22953480", "special_code");
			}
			kb_article_valid = true;
		} else {
			article_num_status = "bg-danger text-danger";
			article_num_text = "Make sure you fill out KB Article Number";
			ticket.tags().remove("special_code");
			ticket.tags().remove("valid_code");
			ticket.tags().add("needs_kb_article");
			ticket.customField("custom_field_22953480", "needs_kb_article");
			kb_article_valid = false;
		}

		this.update_article_status();
		this.update_app();
	},

	kb_needed_test: function () {
		var ticket = this.ticket();
		kb_article_number = ticket.customField("custom_field_22930600");

		var ticket_about = ticket.customField("custom_field_22222564");


		// var pattern = new RegExp(/^[0-9]{5,6}$/g);
		// var article_num_test = pattern.test(kb_article_number);
		// console.log(article_num_test + " article_num_test");
		var no_kb_necessary_list = [
		"data__chargeable",
		"data__export",
		"data__fix",
		"data__idc",
		"data__other",
		"data__refresh",
		"data__research_question",
		"product_owner__bug",
		"product_owner__enhancement",
		"product_owner__tech_research",
		"r_d__bug_review",
		"r_d__technical_research",
		"success_coach__best_practice",
		"success_coach__change_order",
		"success_coach__jeopardy",
		"success_coach__termination",
		"success_coach__training",
		"success_coach__transition",
		"support__install_related",
		"support_lead__advanced_case",
		"support_lead__enhancement",
		"support_lead__r_d_bug_review",
		"support_programmer__change_order",
		"support_programmer__css",
		"support_programmer__custom_page_bug",
		"support_programmer__redirect"
		];

		var kb_needed = true;

		for (var i = no_kb_necessary_list.length - 1; i >= 0; i--) {
			if (ticket_about == no_kb_necessary_list[i]) {
				kb_needed = false;
				break;
			}
		}

		// if (ticket_about == "product_owner__enhancement") {
		// 	kb_needed = false;
		// 	console.log("kb not needed");

		// } else {
		// 	kb_needed = true;
		// }
		return kb_needed;
	},

	help_topic_changed: function () {
		console.log("help topic changed");
		var ticket = this.ticket();
		help_topic = ticket.customField("custom_field_22790214");
		help_topic_valid = false;

		var pattern = new RegExp(/https:\/\/www.blackbaud.com/g);
		// var pattern = new RegExp(/^[0-9]{5,6}$/g);

		var help_topic_test = pattern.test(help_topic);

		if (help_topic_test) {
			help_topic_valid = true;
		} 
		else {
			help_topic_valid = false;
		}
		
		this.update_article_status();
		this.update_app();
	},


	update_article_status: function () {
		var ticket = this.ticket();
		console.log("Help Topic Valid? " + help_topic_valid);
		console.log("KB Article Valid? " + kb_article_valid);
		no_kb_necessary = false;
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
			if(this.kb_needed_test()) {
				ticket.customField("custom_field_22953480", "needs_kb_article");
			}
			else {
				ticket.customField("custom_field_22953480", "no_kb_necessary");
				no_kb_necessary = true;
			}
			
		}
		this.update_app();
		console.log("subject changed / setup search");
	}, 


	subject_changed: function () {
		// subject = ticket.subject();
		this.update_app();
		console.log("subject changed / setup search");
	},

	get_school_info: function () {
		// body...
		var organization = this.ticket().organization();
		requester = this.ticket().requester();
		console.log(requester.customField('authorized_contact'));
		var org_fields = organization.organizationFields();
		// console.log(org_fields);
		// var school_url = organization.organizationFields("hosted_url");
		school_url = org_fields['hosted_url'];
		app_url = org_fields['app_url'];
		notes = organization.notes();

		status = org_fields['status'];

		var ae_name_raw = org_fields['account_manager'];
		ae_name = ae_name_raw.replace('_', ' '); 
		ae_name = ae_name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		ae_phone = org_fields['ae_phone_number'];
		
		ae_email = ae_name_raw.replace('_', '.'); 
		ae_email += "@blackbaud.com";

		site_specs = org_fields['site_specs'];
		support_handoffs = org_fields['support_handoffs'];
		edition = {full_edition: org_fields['full_edition']};

		authorized_contact = requester.customField('authorized_contact');
		user_notes = requester.notes();
		console.log(user_notes);
		// console.log(ae_email);
		this.update_app();
	},


	update_app: function () {
		var base = "k-12 on products";
		var parent = base + "|";
		var k12Products = base; 
		var Core = parent+"core"; 
		var onAccount = parent+"onaccount";
		var onBoard = parent+"onboard";
		var onCampus = parent+"oncampus";
		var onMessage = parent+"onmessage";
		var onRecord = parent+"onrecord";
		var allK12Products = k12Products + "," + Core + "," + onAccount + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord + "," + "internal systems";
		var allK12ProductsPKB = k12Products + "," + Core + "," + onAccount + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord;

		var ticket = this.ticket();
		var subject = ticket.subject();
		var product = ticket.customField("custom_field_21744040");
		// var assignee = ticket.assignee();
		// var assignee_name = assignee.user().name();

		var kb_article_number = ticket.customField("custom_field_22930600");


		switch (product) {
			case 'core':
				product = Core;
				break;
			case 'onaccount':
				product = onAccount;
				break;
			case 'onboard':
				product = onBoard;
				break;
			case 'oncampus':
				product = onCampus;
				break;	
			case 'onmessage':
				product = onMessage;
				break;
			case 'onrecord':
				product = onRecord;
				break;
			default:
				product = k12Products; 
				break;
		}

		// Remove the first part of the subject up to the backslash
		subject = subject.replace(/(.+\s?\\)/, ''); 

		// Remove any other backslashes
		subject = subject.replace('\\', '');
		
		// Remove Five9 Call and CHAT:
		subject = subject.replace('Five9 Call', '');
		subject = subject.replace('CHAT:', '');



		console.log("app updated");
		this.switchTo('app', {
			// username: test
			productName: product,
			articleNumber: kb_article_number,
			productDebug: ticket.customField("custom_field_21744040"),
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
			notes: notes,
			status : status,
			ae_name : ae_name,
			ae_phone : ae_phone,
			ae_email : ae_email,
			site_specs : site_specs,
			support_handoffs : support_handoffs,
			edition : edition,
			authorized_contact: authorized_contact,
			user_notes: user_notes

		});
	},

	activate_app: function() {
		// console.log("do something");
		var ticket = this.ticket();
		// console.log("status = " + ticket.status());
		if (ticket.status() == "new") {
			console.log("this is a new ticket");
		}
		else {
		}
		
		this.update_app();
		this.kb_id_changed();
		this.help_topic_changed();
		this.get_school_info();

	},


	set_first_responder: function () {
		// this is just a test
		// console.log("kb id changed");

		// var tags = ticket.tags();
		// var assignee_tag = assignee_name.replace(' ', '');
		// var first = "first_";
		// var first_assignee_tag = first.concat(assignee_tag);
		// if (tags.indexOf("first_response") > -1) {
		// //ticket.tags().add("valid_code");
		// console.log("first response found");
		// console.log(assignee_tag + " is assigned");
		// console.log(first_assignee_tag + " is first_assignee");
		// // console.log("first_" + assignee_tag);
		// }
	},


	sayHello: function() {
		console.log("hello");
	}
	// end function

	};
	// 

	}());
