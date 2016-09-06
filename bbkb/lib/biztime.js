module.exports = {
  // TO DO
  // If total days is greater than 7, then spans a weekend needs adjusting
  // If total days is greater than the SLA, automatically mark it as missed.
  // Set up SLA's
  // Get fractions of an hour to work...
  // Have it check when reassigned, take out buttons

  // RAINY DAY
  // Use Zendesk holidays / schedule https://developer.zendesk.com/rest_api/docs/core/schedules#list-all-schedules

  get_work_hours: function() {
    var work_hours = {start_of_day: 8, end_of_day: 20};
    return work_hours
  },

  check_holidays: function (start_date, end_date) {
    // returns number of holidays in span of dates

    var num_days = this.number_of_days(start_date, end_date);
    var holidays = ['9/5/2016', '11/24/2016', '11/25/2016', '12/26/2016', '1/1/2017'];
    var num_holidays = 0;

    for (var i = 0; i < num_days; i++) {
      // Cycle through each day in between the start and end and see if a holiday is present
      var new_date = new Date(this.format_date(start_date));
      new_date.setDate(new_date.getDate() + i);
      var find_date = this.format_date(new_date);
      if (_.contains(holidays, find_date)) {
        num_holidays += 1;
      }
    }
    return num_holidays;
  },

  check_priorities: function (total_hours, ticket) {

    // Urgent	  High	Normal	Low
    // 1	       24	   48    	120
    console.log("-----");
    console.log("ticket_priority");
    console.log(ticket.priority());
    console.log("total_hours");
    console.log(total_hours);

    var priorities = [
      {priority: 'urgent', hours: 1},
      {priority: 'high', hours: 24},
      {priority: 'normal', hours: 48},
      {priority: 'low', hours: 120},
    ];
    var sla = _.findWhere(priorities, {priority: ticket.priority()});
    if (total_hours <= sla.hours) {
      console.log("Met SLA!! (" + sla.hours + " hours)");
      ticket.customField("custom_field_40302407", 'sla_met');
      return true;
    } else {
      console.log("Didn't meet SLA...(" + sla.hours + " hours)");
      ticket.customField("custom_field_40302407", 'sla_not_met');
      return false;
    }
  },

  format_date: function (date) {
    // formats as M/D/YYYY
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var formatted = month + '/' + day + '/' + year;

    return formatted;
  },

  showWorkingHours: function (app) {
    // workingHours: {
    //   0: null,
    //   1: ['08:00:00', '20:00:00'],
    //   2: ['08:00:00', '20:00:00'],
    //   3: ['08:00:00', '20:00:00'],
    //   4: ['08:00:00', '20:00:00'],
    //   5: ['08:00:00', '20:00:00'],
    //   6: null
    // };

    return app.workingHours;
  },

  convert_time_difference_to_hours: function(time_in_milliseconds) {
		return time_in_milliseconds / 1000 / 60 / 60;
	},

  hours_difference: function(date1, date2) {
    var difference = Math.abs(date1 - date2);
    return this.convert_time_difference_to_hours(difference);
  },

  biz_hours_till_end_of_day: function(date_object) {
    var end_of_day = this.get_work_hours().end_of_day;
    var hours = end_of_day - date_object.getHours()
    return hours;
  },

  biz_hours_from_beginning_of_day: function(date_object) {
    var start_of_day = this.get_work_hours().start_of_day;
    var hours = date_object.getHours() - start_of_day;
    return hours;
  },

  number_of_days: function(start_date, end_date) {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.round(Math.abs((start_date.getTime() - end_date.getTime())/(oneDay)));
    return diffDays;
  },

  spans_a_weekend: function(start_date, end_date) {
    if (end_date.getDay() < start_date.getDay()) {
      return true;
    } else {
      return false;
    }
  },







};
