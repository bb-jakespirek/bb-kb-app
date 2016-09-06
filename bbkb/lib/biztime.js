module.exports = {

  format_date: function (date) {
    // formats as M/D/YYYY
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var formatted = month + '/' + day + '/' + year;

    return formatted;
  },

  check_holidays: function (start_date, end_date) {
    // returns number of holidays in span of dates

    var num_days = this.number_of_days(start_date, end_date);
    var holidays = ['9/5/2016', '1/1/2017'];
    var num_holidays = 0;

    for (var i = 0; i < num_days; i++) {
      // Cycle through each day in between the start and end and see if a holiday is present
      // console.log(i + " = iteration");
      var new_date = new Date(this.format_date(start_date));
      new_date.setDate(new_date.getDate() + i);
      var find_date = this.format_date(new_date);
      // console.log(find_date);
      if (_.contains(holidays, find_date)) {
        // console.log("it's in there");
        num_holidays += 1;
      }
    }
    return num_holidays;
  },

  // spans_a_holiday: function(start_date, end_date) {
  //   var num_holidays = this.check_holidays(start_date, end_date);
  //   if (num_holidays > 0 ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // },

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
    var end_of_day = 20;
    var hours = end_of_day - date_object.getHours()
    return hours;
  },

  biz_hours_from_beginning_of_day: function(date_object) {
    var start_of_day = 8;
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
