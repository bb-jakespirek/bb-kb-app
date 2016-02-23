module.exports = {


// subject_changed: function () {
	// 	// subject = ticket.subject();
	// 	this.update_app();
	// 	console.log("subject changed / setup search");
	// },

	test_func: function (app) {
		console.log("test inside utils");
		console.log(app.ticket().id());
	},


	fix_org_data: function (org_data) {
		var organization = org_data;
		var org_fields = organization.organization_fields;
		console.log("org_fields");
		console.log(org_fields);
		console.log("-----");
		// Create the Prog Web link
		// try {
		// 	org_fields.prog_web = org_fields.prog_url.replace(/(\/app)(\/)?$/, '/page/'); 
		// } catch(e) {
		// 	console.log("Oh no!");
		// }
		if(org_fields.prog_url != null) {
			org_fields.prog_web = org_fields.prog_url.replace(/(\/app)(\/)?$/, '/page/'); 
		}

		// Fix the AE format
		organization.ae_info = {};
		var ae_info = organization.ae_info;

		var ae_name_raw = org_fields['account_manager'];
		var ae_name, ae_phone, ae_email;

		if (ae_name_raw) {
			ae_name = ae_name_raw.replace('_', ' '); 
			ae_name = ae_name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

			ae_phone = org_fields['ae_phone_number'];
			
			ae_email = ae_name_raw.replace('_', '.'); 
			ae_email += "@blackbaud.com";

			ae_info.ae_name = ae_name;
			ae_info.ae_phone = ae_phone;
			ae_info.ae_email = ae_email;

		}

		// organization.school_urls = this.get_school_info(org_fields);

		return organization;
	},


	fix_ae_name: function () {
	},


	get_school_info: function (org_fields) {
		var school_urls = {};

		// school_urls.prog_url

		return school_urls;

	},


	// get_school_info: function () {

// 		console.log("running get school info");
// 		var ticket = this.ticket();
// 				// console.log("status = " + ticket.status());
// 		if (ticket.status() == "new") {
// 			ticket_new = true;
// 			console.log("this is a new ticket");
// 			// var organization = this.ticket().organization();
// 			// if (!organization) {
// 			// 	return;
// 			// }

// 		}
// 		else {
// 			ticket_new = false;
// 		}

// 		// body...
// 		var organization = this.ticket().organization();
// 		if (!organization) {
// 			console.log("no org");
// 			return;
// 		} else {
// 			console.log("org detected");
// 		}
// 		requester = this.ticket().requester();
// 		if (!requester) {
// 			console.log("no requester");
// 			return;
// 		} else {
// 			console.log("requester detected");

// 		}

// 		// console.log(requester.customField('authorized_contact'));
// 		var org_fields = organization.organizationFields();
// 		console.log(org_fields);
// 		// var school_url = organization.organizationFields("hosted_url");
// 		console.log("adding org fields");
// 		school_urls.hosted_url = org_fields['hosted_url'];
// 		school_urls.app_url = org_fields['app_url'];
// 		school_urls.prog_url = org_fields['prog_url'];
// 		if (school_urls.prog_url) {
// 			school_urls.prog_web = school_urls.prog_url.replace(/(\/app)(\/)?$/, '/page/'); 
// 		}
// 		school_urls.school_id = org_fields['school_id'];
// 		school_urls.clarify_site_id = org_fields['clarify_site_id'];
// 		school_urls.database = org_fields['database'];
// 		// console.log("website replace: " + school_urls.prog_web);

// // get rid of these 
// 		// school_url = org_fields['hosted_url'];
// 		// app_url = org_fields['app_url'];
// 		// prog_url = org_fields['prog_url'];


// 		notes = organization.notes();

// // to-do: make status into an object and show different colors for things like in production
// 		status = org_fields['status'];
// 		if (status == "in_support") {
// 			status = "In Support";
// 		}
// // console.log(status + " In support");
// 		var ae_name_raw = org_fields['account_manager'];
// 		if (ae_name_raw) {
// 			ae_name = ae_name_raw.replace('_', ' '); 
// 			ae_name = ae_name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
// 			ae_phone = org_fields['ae_phone_number'];
			
// 			ae_email = ae_name_raw.replace('_', '.'); 
// 			ae_email += "@blackbaud.com";
// 		}

// 		site_specs = org_fields['site_specs'];
// 		support_handoffs = org_fields['support_handoffs'];
// 		edition = org_fields['full_edition'];

// 		if (requester) {
// 			authorized_contact = requester.customField('authorized_contact');
// 			user_notes = requester.notes();
// 			console.log(user_notes);
// 		}

		
// 			// console.log("VIA = " + ticket.via);
// 		// Ticket Source info
// 		if (ticket.via) {
// 			// console.log("VIA = " + ticket.via);
// 		}


// 		// console.log(ae_email);
// 		this.update_article_status();
// 		this.update_app();
	// }



};
