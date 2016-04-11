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









// requests: { fetchUser: function(id){ return { url: helpers.fmt("/api/v2/users/%@.json?include=identities", id), type: 'GET', dataType: 'json', proxy_v2: true }; } }

// And then you can make the following ajax call in your app:

// this.ajax('fetchUser', this.ticket().requester().id());

// Then you'll have access to the user data and his identities (http://developer.zendesk.com/documentation/rest_api/user_identities.html).







    // requests: {
    //   ShoutoutStatus_old: {
    //      url: 'http://services.faa.gov/shoutout/status/SFO',
    //      type: 'GET',
    //      dataType: 'json'
    //   },
    //   SourceAudit: {

    //      // url: 'https://spreadsheets.google.com/feeds/cells/1BQihAfFFp28m3Zt_O8NrM82ef9VgD_e_IuBJShrmV4A/od6/public/values?alt=json-in-script',
    //      // url: 'http://services.faa.gov/shoutout/status/SFO',

    //      //  Need to figure out how to not have this hard-coded
    //      url: '/api/v2/tickets/' + '70525' + '/audits.json',
    //      type: 'GET',
    //      dataType: 'json'        
    //   }
    // }, 





 //    	events: {
	// 	// 'app.activated':'doSomething'
	// 	// 'SourceAudit.done': 'showAuditData',
	// 	//'SourceAudit.fail': 'showError',
	// 	'app.activated': function() {
	// 		// this.getAuditData();
	// 		// 	console.log("app activated, before getting data");
	// 		// this.showAuditData();
	// 		// 	console.log("app activated, after showing data");

	// 		this.activate_app();

	// 	},
	// 	'ticket.custom_field_22930600.changed' : 'kb_id_changed',
	// 	'ticket.custom_field_22790214.changed' : 'help_topic_changed',
	// 	'ticket.custom_field_22222564.changed' : 'kb_id_changed',
	// 	'ticket.subject.changed' : 'subject_changed',
	// 	'ticket.requester.id.changed' : 'get_school_info',
	//     'ticket.requester.email.changed': 'get_school_info'

	// },




// 	getAuditData: function() {
//         this.ajax('SourceAudit');
//         		console.log("Getting Source Audit");

//     },
//     showAuditData: function(audit_data) { 
//       // console.log(audit_data.memes[0].name + " test");
// 		// var ticket = this.ticket();
// 		// this.ajax('SourceAudit');
// 		for (var i = audit_data.audits.length - 1; i >= 0; i--) {
// 			console.log(audit_data.audits[i]);
// 		};
// 		console.log(audit_data.audits[0]['metadata']['system'].client + " metadata");
// 		console.log(audit_data.audits[0].ticket_id + " ticket id");
// // https://developer.zendesk.com/rest_api/docs/core/ticket_audits.html#the-via-object
// 		console.log("Show Audit");
// 	},














SIDELOADING
https://support.zendesk.com/hc/en-us/community/posts/204424158-Names-Along-With-Id-s-in-API-Requests

https://support.zendesk.com/hc/en-us/community/posts/203461186-Ticket-Requester-s-phone-number









(function() {

  var Util = require('utilities.js');

  return {
    // Please note that paths are relative from the ./lib directory
    events:   require('events.js'),
    requests: require('requests.js'),

    requestBookmarks: function() {
      console.log('CommonJS Sample app loaded');
      this.ajax('fetchBookmarks');
    },

    fetchBookmarksDone: function(data) {
      var message = Util.string.interpolate('%@ bookmark(s) loaded', data.count);
      console.log(message);
      console.log(data);
    }
  };

}());













// 
    generateTicketView: function() { // Draw the 'Ticket' tab
      var ticket = this.ticket(),
          ccArray;

      // this array and analogous ones further down are used because Handlebars won't call functions, so we need to pass in properties
      ccArray = _.map(ticket.collaborators(), function(collaborator) {
        return {
          email: collaborator.email(), // .email() is the function call we are replacing with the .email property
          role:  collaborator.role() || 'Not registered'
        };
      });

      this.switchTo('ticket', { // render the ticket.hdbs template
        ticketType:     ticket.type(),
        ticketSubject:  ticket.subject(),
        ticketCCs:      ccArray
      });

      this.$('.tickettypeset').zdSelectMenu('setValue', ticket.type()); // initialise the Zendesk-style dropdown to the actual value
    },








    newTicketType: function() { // The ticket type has been changed in our app - better change it in Zendesk
      var newType = this.$('.tickettypeset').zdSelectMenu('value'); // note: you can't use all of jQuery here but selectors are OK
      if (this.ticket().type() != newType) {
        this.ticket().type(newType);
      }
    },

    detectedChange: function(event) {
      if (event.propertyName == 'ticket.type' && event.newValue != this.$('.tickettypeset').zdSelectMenu('value')) {
      // The ticket type changed in Zendesk - better change it in our app but not if we initiated the change from the app, that would be an endless loop!
        this.$('.tickettypeset').zdSelectMenu('setValue', event.newValue);
      }
      else if (event.propertyName == 'ticket.collaborators') {
       // We could copy the code out of the newCCs function below and put it here
      }
    },












AJAX STUFF

(function() {

  return {

    requests: {
      requestOrganization: function(org_id) {
        return {
          url: "/api/v2/organizations/%@.json".fmt(org_id),
          type: "GET",
          contentType: "application/json"
        };
      }
    },

    events: {
      'app.activated':'init' //the first thing we fire is init, which sets up the data we need then fires the function that makes use of said data
    },

    init: function() {
      //you could also do things like start with a ...loading template by default so the user is aware that the app is loading data before it starts
      var app = this; //we create an alias for 'this' because once we are in the callback 'this' no longer refers to the appFramework
      var organization = this.ticket().organization();
      this.ajax('requestOrganization', organization.id()).done(function(response){
        var org_info = response.organization;
        app.appStart(org_info); // Usually you would call using this.appStart but in the context of the ajax .done() callback we reference the app variable we created
     });
    },

    appStart: function(organization_data) {
      // because we fire the function from the ajax .done() function we don't need to worry that the request hasn't finished yet, now we can do what needs to be done with our returned data
      this.switchTo('org_data_view', {
        data: organization_data
      });

    }
  };

}());










(function() {

  return {
    
    appProperties: {
      // This is available globally in your functions via this.appProperties.org_data
      // We need to be very careful here though. When setting this, it might be possible previous data or unrelated data is served.
      // This would also be shared among different instances of the app (per user) so if the agent switches tabs the data might be
      // in the object may no longer be relevant. One way to get around that would be to make sure when setting data to include the
      // current ticket_id in the object, so we can check that this.appProperties.ticket_id === this.ticket().id() before we trust the data.
    }
      "org_data":{},
      "ticket_id": 0
    },

    requests: {
      requestOrganization: function(org_id) {
        return {
          url: "/api/v2/organizations/%@.json".fmt(org_id),
          type: "GET",
          contentType: "application/json"
        };
      }
    },

    events: {
      'app.activated':'init' //the first thing we fire is init, which sets up the data we need then fires the function that makes use of said data
    },

    init: function() {
      //you could also do things like start with a ...loading template by default so the user is aware that the app is loading data before it starts
      var app = this; //we create an aliast for 'this' because once we are in the callback 'this' no longer refers to the appFramework
      this.resetGlobals(); // Below I added a function to clear the global object and add the current ticket id, you can use this where appropriate (wherever your process starts)
      var organization = this.ticket().organization();
      this.ajax('requestOrganization', organization.id()).done(function(response){
        var org_info = response.organization;
        app.appProperties.org_data = org_info;
        this.appStart();
     });
    },

    appStart: function() {
      // because we fire the function from the ajax .done() function we don't need to worry that the request hasn't finished yet, now we can do what needs to be done with our returned data
      // we added the org data to the global properties, now we can access that data from whatever functions we like (because we can access them doesn't mean they are there however, so make sure you fetch everything you need in the first request by batching promises with this.when.apply(promises, context).done())
      var organization_data = this.appProperties.org_data;
      this.switchTo('org_data_view', {
        data: organization_data
      });
    },
    resetGlobals: function(){
      var ticket_id = this.ticket().id();
      this.appProperties = {
        "org_data": {},
        ticket_id: ticket_id
      };
    }
  };

}());



















Handlebars

{{#if ticket_new}}

{{/if}}

{{organization.id}}

{{#each requester}}
        <li><i class="fa fa-users-o fa-li fa-lg"></i>{{@key}}: {{this}}</li>
    {{/each}}

























Not being used:


    get_organization_info_old: function() {
    // console.log(this.ticket().organization().id());
    var organization = this.ticket().organization();
    var org_object = {};
    
    console.log("get_organization_info test");
    console.log(this.appProperties);
    
    // Need to do a fresh grab of the info using the ID of the org. Will return organization object


    var app = this; //we create an alias for 'this' because once we are in the callback 'this' no longer refers to the appFramework
    var organization = this.ticket().organization();
    this.resetGlobals();
    // var org_info;

    console.log("start");
    // https://developer.zendesk.com/apps/docs/agent/promises

    // return this.promise(function(done, fail) {
   //        this.ajax('fetchOrganization', organization.id()).then(
   //            function(data) {
   //                console.log('Request succeeded');

   //                var org_info = data.organization;
    //          app.appProperties.org_data = org_info;

    //          console.log("org_info");
   //                console.log(org_info);
          
    //      // console.log(this.glob_var + " = app.glob_var1 ");

   //                // do something with the data
   //                done();     // ok to save the ticket
   //       //          done(function() {
    //        //     app.new_organization = data.organization;
               
    //        //     console.log(app.glob_var + " = app.glob_var ");
    //        // });
   //            },
   //            function() {
   //                console.log('Request failed');
   //                done();     // failed, but save the ticket anyway
   //            }
   //        );
   //    });

    // This response will be handled by fetchOrganizationDone if it's a success
    // It will then run generate_app_view again

    this.ajax('fetchOrganization', organization.id());


    // this.ajax('fetchOrganization', organization.id()).done(function(data){
    //  var org_info = data.organization;
   //        app.appProperties.org_data = org_info;
    //  console.log("done");
    //  // console.log(org_info);

    //  // console.log("org_info.notes");
    //  // console.log(org_info.notes);
      
    //  // app.set_org_info(org_info); // Usually you would call using this.appStart but in the context of the ajax .done() callback we reference the app variable we created
    // });
    // console.log("return");

    // return org_info;

    // this.ajax('fetchOrganization', organization.id()).done(function(response){
   //        var org_info = response.organization;
   //        app.appStart(org_info); // Usually you would call using this.appStart but in the context of the ajax .done() callback we reference the app variable we created
   //     });

    // this.requestOrganization(organization.id());
        // console.log(bob.notes());

      
    // console.log(this.ticket().organization().notes());
    // this.ajax('fetchOrganizationFields', organization.id());



    // console.log("organization.name()");
    // console.log(organization.name());

    // // For use with Handlebars in the view
    // org_object.id = organization.id();
    // org_object.name = organization.name();
    // org_object.notes = organization.notes();

    // var org_fields = organization.organizationFields();
    // console.log(org_fields);
    // console.log(org_fields['hosted_url']);

    // var school_url = organization.organizationFields("hosted_url");
    // console.log("adding org fields");
    // school_urls.hosted_url = org_fields['hosted_url'];



// var organization = this.organization();
// organization.customField("my_text_field", "text"); // type: text
// organization.customField("my_checkbox_field", "yes"); // type: checkbox
    
  },








  get_school_info: function () {

    console.log("running get school info");
    var ticket = this.ticket();
        // console.log("status = " + ticket.status());
    if (ticket.status() == "new") {
      ticket_new = true;
      console.log("this is a new ticket");
      // var organization = this.ticket().organization();
      // if (!organization) {
      //  return;
      // }

    }
    else {
      ticket_new = false;
    }

    // body...
    var organization = this.ticket().organization();
    if (!organization) {
      console.log("no org");
      return;
    } else {
      console.log("org detected");
    }
    requester = this.ticket().requester();
    if (!requester) {
      console.log("no requester");
      return;
    } else {
      console.log("requester detected");

    }

    // console.log(requester.customField('authorized_contact'));
    var org_fields = organization.organizationFields();
    console.log(org_fields);
    // var school_url = organization.organizationFields("hosted_url");
    console.log("adding org fields");
    school_urls.hosted_url = org_fields['hosted_url'];
    school_urls.app_url = org_fields['app_url'];
    school_urls.prog_url = org_fields['prog_url'];
    if (school_urls.prog_url) {
      school_urls.prog_web = school_urls.prog_url.replace(/(\/app)(\/)?$/, '/page/'); 
    }
    school_urls.school_id = org_fields['school_id'];
    school_urls.clarify_site_id = org_fields['clarify_site_id'];
    school_urls.database = org_fields['database'];
    // console.log("website replace: " + school_urls.prog_web);

// get rid of these 
    // school_url = org_fields['hosted_url'];
    // app_url = org_fields['app_url'];
    // prog_url = org_fields['prog_url'];


    notes = organization.notes();

// to-do: make status into an object and show different colors for things like in production
    status = org_fields['status'];
    if (status == "in_support") {
      status = "In Support";
    }
// console.log(status + " In support");
    var ae_name_raw = org_fields['account_manager'];
    if (ae_name_raw) {
      ae_name = ae_name_raw.replace('_', ' '); 
      ae_name = ae_name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      ae_phone = org_fields['ae_phone_number'];
      
      ae_email = ae_name_raw.replace('_', '.'); 
      ae_email += "@blackbaud.com";
    }

    site_specs = org_fields['site_specs'];
    support_handoffs = org_fields['support_handoffs'];
    edition = org_fields['full_edition'];

    if (requester) {
      authorized_contact = requester.customField('authorized_contact');
      user_notes = requester.notes();
      console.log(user_notes);
    }

    
      // console.log("VIA = " + ticket.via);
    // Ticket Source info
    if (ticket.via) {
      // console.log("VIA = " + ticket.via);
    }


    // console.log(ae_email);
    this.update_article_status();
    this.update_app();
  }























      serializeCustomFields: function() {
      var fields = [];

      this.forEachCustomField(function(field){

        if (field.value !== ""){
          var test = ""+field.value+"";
          var isDate = "";
          
          if (field.value !== undefined){
              isDate = test.match(this.dateRegExp);
          }
          
          var value = "";
          
          if (isDate !== "" && isDate !== null) {
              var date = new Date(field.value);
              var year = date.getFullYear();
              var month = (1 + date.getMonth()).toString();
              month = month.length > 1 ? month : '0' + month;
              var day = date.getDate().toString();
              day = day.length > 1 ? day : '0' + day;
              value = year+"-"+month+"-"+day;
          } else {
              value = field.value;
          }

          if (field.value !== null) { // Only save field ID & value is there is a value present
            fields.push({
              id: field.id,
              value: value
            });
          }
        }
      });

      return fields;
    },
    forEachCustomField: function(block){
      _.each(this._customFields(), function(field){
        var id      = field.match(this.customFieldRegExp)[1],
            value   = this.normalizeValue(this.ticket().customField(field));
        block.call(this, {
          label: field,
          id: id,
          value: value
        });
      }, this);
    },
    normalizeValue: function(value){
      return {
        "yes": true,
        "no": false
      }[value] || value;
    },
    _customFields: _.memoize(function(){
      return _.filter(_.keys(this.containerContext().ticket), function(field){
        return field.match(this.customFieldRegExp);
      }, this);
    }