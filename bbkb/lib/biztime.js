module.exports = {


  // optional, if not specified defaults to empty array
  // var holidays = [];

  // var myBusinessTime = SeriousBusinessTime.createInstance(moment, workinghours, holidays);

  showWorkingHours: function (app) {
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

  number_of_days: function(starting_date, end_date) {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.round(Math.abs((starting_date.getTime() - end_date.getTime())/(oneDay)));
    return diffDays;
  },

  spans_a_weekend: function(starting_date, end_date) {
    if (end_date.getDay() < starting_date.getDay()) {
      return true;
    } else {
      return false;
    }
  },






};
