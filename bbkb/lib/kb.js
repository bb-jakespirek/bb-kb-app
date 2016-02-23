module.exports = {

	make_kb_links: function (ticket) {
		var kb_links = {};
		var base = "k-12 on products";
		var baseURL = "http://bbkb.blackbaud.com/#sort=relevancy";
		var baseURLpkb = "http://search.blackbaud.com/#sort=relevancy";
		var parent = base + "|";
		var k12Products = base; 
		var Core = parent+"core"; 
		var onBoard = parent+"onboard";
		var onCampus = parent+"oncampus";
		var onMessage = parent+"onmessage";
		var onRecord = parent+"onrecord";
		var notApplicable = "Not Applicable";
		var allK12Products = k12Products + "," + Core + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord + "," + "internal systems";
		// var allK12ProductsPKB = k12Products + "," + Core + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord + "," + base;

		var allK12ProductsPKB = k12Products + "," + Core + "," + onBoard + "," + onCampus + "," + onMessage + "," + onRecord;

		// var ticket = this.ticket();
		var subject = ticket.subject();
		console.log(subject);
		if (!subject) {
			subject="";
		}
		var product = ticket.customField("custom_field_21744040");
		// var assignee = ticket.assignee();
		// var assignee_name = assignee.user().name();

		var kb_article_number = ticket.customField("custom_field_22930600");

		var fixed_subject = this.fix_subject(subject);

		switch (product) {
			case 'core':
				product = Core;
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


			// articleNumber: kb_article_number,
			// productDebug: ticket.customField("custom_field_21744040"),


			// k12Products: k12Products,
			// allK12ProductsPKB: allK12ProductsPKB,
			// allK12Products: allK12Products, 
			// Core: Core,
			// onBoard: onBoard,
			// onCampus: onCampus, 
			// onMessage: onMessage,
			// onRecord: onRecord,
			// notApplicable: "Not Applicable",
			// article_num_status: article_num_status,
			// article_num_text: article_num_text, 
			// article_num_test: article_num_test,
			// is_special_code: is_special_code,
			// kb_article_valid: kb_article_valid,
			// help_topic: help_topic,
			// help_topic_valid: help_topic_valid,
			// no_kb_necessary: no_kb_necessary,
			// school_url: school_url,
			// app_url: app_url,
			// prog_url: prog_url,
			// notes: notes,
			// status : status,
			// ae_name : ae_name,
			// ae_phone : ae_phone,
			// ae_email : ae_email,
			// site_specs : site_specs,
			// support_handoffs : support_handoffs,
			// edition : edition,
			// authorized_contact: authorized_contact,
			// user_notes: user_notes,
			// school_urls: school_urls,
			// ticket_new: ticket_new,
			// user_id: this.currentUser().id(),
			// requester: requester

		kb_links.baseURL = "http://bbkb.blackbaud.com/#sort=relevancy";

		var kb_search_string_internal = "&f:@articlefilters:not=[archived]&f:@hproduct=[" + allK12Products + "]&f:@hproduct:not=[" + notApplicable + "]";


		var kb_search_string_public = "&f:@hproduct=[" + allK12ProductsPKB + "]";
		// &f:@hproduct:not=[" + notApplicable + "]"


		kb_links.btn_blank_kb_search = baseURL + kb_search_string_internal;

		kb_links.btn_public_kb_search = baseURLpkb + kb_search_string_public + "&q=" + fixed_subject;

		kb_links.btn_internal_kb_search = baseURL + kb_search_string_internal + "&q=" + fixed_subject;

		kb_links.btn_internal_procedures_search = baseURL + "&f:@articlefilters=[internal procedure]" + kb_search_string_internal;

		kb_links.ticket_subject = fixed_subject;
		

		return kb_links;
	},



	fix_subject: function (raw_subject) {
		// Remove the first part of the subject up to the backslash
		subject = raw_subject.replace(/(.+\s?\\)/, ''); 

		// Remove any other backslashes
		subject = subject.replace('\\', '');
		
		// Remove Five9 Call and CHAT:
		subject = subject.replace('Five9 Call', '');
		subject = subject.replace('CHAT:', '');

		return subject;
	},

	check_kb_id: function (kb_article_number) {


		console.log("check the kb id");

		var pattern = new RegExp(/^[0-9]{5,6}$/g);
		var article_num_test = pattern.test(kb_article_number);
		// console.log(article_num_test + " article_num_test");
		var kb_article_valid = false;

		var invalid_article_numbers =[
		"00000",
		"000000",
		"11111",
		"111111",
		"22222",
		"222222",
		"12345",
		"123456"
		];
		_.each(invalid_article_numbers, function(element, index, list){ console.log(element + " = " + index ); });

		var invalid_number = _.contains(invalid_article_numbers, kb_article_number);

		if (article_num_test) {
			kb_article_valid = true;
			if (invalid_number) {
				kb_article_valid = false;
			}
		} else {
			kb_article_valid = false;
		}


		// var no_kb_necessary_list = [
		// "data__chargeable",
		// "data__export",
		// "data__fix",
		// "data__idc",
		// "data__other",
		// "data__refresh",
		// "data__research_question",
		// "product_owner__bug",
		// "product_owner__enhancement",
		// "product_owner__tech_research",
		// "r_d__bug_review",
		// "r_d__technical_research",
		// "success_coach__best_practice",
		// "success_coach__change_order",
		// "success_coach__jeopardy",
		// "success_coach__termination",
		// "success_coach__training",
		// "success_coach__transition",
		// "support__install_related",
		// "support_lead__enhancement",
		// "support_lead__r_d_bug_review",
		// "support_programmer__change_order",
		// "support_programmer__css",
		// "support_programmer__custom_page_bug",
		// "support_programmer__redirect"
		// ];

		

		// for (var i = no_kb_necessary_list.length - 1; i >= 0; i--) {
		// 	if (ticket_about == no_kb_necessary_list[i]) {
		// 		no_kb_needed = true;
		// 		break;
		// 	}
		// }


		return kb_article_valid;
		
	},

	check_help_topic: function (help_topic) {
		console.log("check help topic field");
		// var ticket = this.ticket();
		// help_topic = ticket.customField("custom_field_22790214");
		var help_topic_valid = false;

		var pattern = new RegExp(/https:\/\/www.blackbaud.com/g);
		// var pattern = new RegExp(/^[0-9]{5,6}$/g);

		var help_topic_test = pattern.test(help_topic);

		if (help_topic_test && help_topic != "") {
			help_topic_valid = true;
		} 
		else {
			help_topic_valid = false;
		}
		
		// this.update_article_status(ticket);

		// this.update_app();

		return help_topic_valid;
	},



	set_kb_status: function (app) {
		var ticket = app.ticket();
		console.log("check the kb id");

		var pattern = new RegExp(/^[0-9]{5,6}$/g);
		var article_num_test = pattern.test(kb_article_number);
		// console.log(article_num_test + " article_num_test");
		var kb_article_valid;

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

		return kb_article_valid;

	},

	kb_needed_test: function (ticket) {
		// var ticket = this.ticket();
		kb_article_number = ticket.customField("custom_field_22930600");

		var ticket_about = ticket.customField("custom_field_22222564");
		var no_kb_needed = false;

		console.log("ticket type");
		console.log(ticket.type());
		// Incidents don't need KB's
		if (ticket.type() == "incident") {
			no_kb_needed = true;
			console.log("no kb needed");
			return no_kb_needed;

		}

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
		"support_lead__enhancement",
		"support_lead__r_d_bug_review",
		"support_programmer__change_order",
		"support_programmer__css",
		"support_programmer__custom_page_bug",
		"support_programmer__redirect"
		];

		

		for (var i = no_kb_necessary_list.length - 1; i >= 0; i--) {
			if (ticket_about == no_kb_necessary_list[i]) {
				no_kb_needed = true;
				break;
			}
		}

		// if (ticket_about == "product_owner__enhancement") {
		// 	kb_needed = false;
		// 	console.log("kb not needed");

		// } else {
		// 	kb_needed = true;
		// }
		return no_kb_needed;
	},


	// help_topic_changed: function () {
	// 	console.log("help topic changed");
	// 	var ticket = this.ticket();
	// 	help_topic = ticket.customField("custom_field_22790214");
	// 	help_topic_valid = false;

	// 	var pattern = new RegExp(/https:\/\/www.blackbaud.com/g);
	// 	// var pattern = new RegExp(/^[0-9]{5,6}$/g);

	// 	var help_topic_test = pattern.test(help_topic);

	// 	if (help_topic_test) {
	// 		help_topic_valid = true;
	// 	} 
	// 	else {
	// 		help_topic_valid = false;
	// 	}
		
	// 	this.update_article_status();
	// 	this.update_app();
	// },


	update_article_status_old: function (ticket) {
		// var ticket = this.ticket();
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
		// this.update_app();
		console.log("article status updated");
	}








};
