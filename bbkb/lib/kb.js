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
		// console.log(subject);
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
		var subject;
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


		// console.log("check the kb id");

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

		// _.each(invalid_article_numbers, function(element, index, list){ console.log(element + " = " + index ); });

		var invalid_number = _.contains(invalid_article_numbers, kb_article_number);

		if (article_num_test) {
			kb_article_valid = true;
			if (invalid_number) {
				kb_article_valid = false;
			}
		} else {
			kb_article_valid = false;
		}


		return kb_article_valid;
		
	},

	check_help_topic: function (help_topic) {
		// console.log("check help topic field");
		// var ticket = this.ticket();
		// help_topic = ticket.customField("custom_field_22790214");
		var help_topic_valid = false;

		var pattern = new RegExp(/https:\/\/www.blackbaud.com/g);
		// var pattern = new RegExp(/^[0-9]{5,6}$/g);

		var help_topic_test = pattern.test(help_topic);

		if (help_topic_test && help_topic !== "") {
			help_topic_valid = true;
		} 
		else {
			help_topic_valid = false;
		}
		
		// this.update_article_status(ticket);

		// this.update_app();

		return help_topic_valid;
	},



	no_kb_needed_test: function (ticket) {
		// var ticket = this.ticket();
		var kb_article_number = ticket.customField("custom_field_22930600");

		var ticket_about = ticket.customField("custom_field_22222564");
		var ticket_source = ticket.customField("custom_field_27286948");
		var no_kb_needed = false;

		// console.log("ticket type");
		// console.log(ticket.type());
		// Incidents don't need KB's
		if (ticket.type() == "incident") {
			no_kb_needed = true;
			// console.log("no kb needed");
			return no_kb_needed;

		}


		if (ticket_source == "follow_up") {
			no_kb_needed = true;
			// console.log("no kb needed");
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
		"product_owner__eap",
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
		"support__no_resolution_needed",
		"support__no_customer_response",
		"support_lead__enhancement",
		"support_lead__r_d_bug_review",
		"support_programmer__change_order",
		"support_programmer__css",
		"support_programmer__custom_page_bug",
		"support_programmer__redirect",
		];

		

		for (var i = no_kb_necessary_list.length - 1; i >= 0; i--) {
			if (ticket_about == no_kb_necessary_list[i]) {
				// console.log("no kb needed");
				// If true, this ticket doesn't need a KB
				no_kb_needed = true;
				break;
			}
		}


		if (this.internal_kb_recommended(ticket)) {
			no_kb_needed = true;
			return no_kb_needed;
		}

		// TRUE = no KB is necessary
		return no_kb_needed;
	},

	internal_kb_recommended: function (ticket) {

		var ticket_product = ticket.customField("custom_field_21744040");
		var ticket_about = ticket.customField("custom_field_22222564");

		var internal_kb_rec = false;

		var products_int_kb_rec_list = [
		"podium",
		"support_systems"
		];

		var about_int_kb_rec_list = [
		"support__customer_specific"
		];

		// _.each(invalid_article_numbers, function(element, index, list){ console.log(element + " = " + index ); });

		var product_listed = _.contains(products_int_kb_rec_list, ticket_product);
		var about_listed = _.contains(about_int_kb_rec_list, ticket_about);
		// console.log(product_listed);

		if (product_listed || about_listed) {
			internal_kb_rec = true;

		} else {
			internal_kb_rec = false;
		}

		return internal_kb_rec;
	},



};
