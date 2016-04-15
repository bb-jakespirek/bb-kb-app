module.exports = {


// subject_changed: function () {
	// 	// subject = ticket.subject();
	// 	this.update_app();
	// 	console.log("subject changed / setup search");
	// },

	// test_func: function (app) {
	// 	console.log("test inside utils");
	// 	console.log(app.ticket().id());
	// },


	fix_org_data: function (org_data) {
		var organization = org_data;
		var org_fields = organization.organization_fields;
		// console.log("org_fields");
		// console.log(org_fields);
		// console.log("-----");
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
		if(org_fields.success_coach != null) {
			organization.csm = org_fields.success_coach.replace('_', ' ');
		}
		// organization.school_urls = this.get_school_info(org_fields);

		return organization;
	},


	get_school_info: function (org_fields) {
		var school_urls = {};

		// school_urls.prog_url

		return school_urls;

	},





};
