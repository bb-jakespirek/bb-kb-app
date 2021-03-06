module.exports = {
  // TODO:
  // Remove logs

  // RAINY DAY
  // Use Zendesk holidays / schedule https://developer.zendesk.com/rest_api/docs/core/schedules#list-all-schedules

  get_work_hours: function() {
    var start_date = new Date();
        start_date.setHours(8);
        start_date.setMinutes(30);
    var end_date = new Date();
        end_date.setHours(20);
        end_date.setMinutes(0);
    // console.log("diff------------------------");
    // console.log(diff);
    var start = 9;
    var end = 20;
    // var day_hours = end - start;
    var day_hours = this.convert_time_difference_to_hours(end_date - start_date);
    var weekend_hours = day_hours * 2;
    var night_hours = 24 - day_hours;

    var work_hours = {
      start_of_day: start,
      start_hour: 8,
      start_minutes: 30,
      end_of_day: end,
      day_hours: day_hours,
      night_hours: night_hours,
      weekend_hours: weekend_hours
    };
    return work_hours;
  },

  check_holidays: function (start_date, end_date) {
    // returns number of holidays in span of dates

    var num_days = this.number_of_days(start_date, end_date);
    // var holidays = ['8/31/2016', '9/1/2016', '11/24/2016', '11/25/2016', '12/26/2016', '1/1/2017']; // testing
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
    var priorities = [
      {priority: 'urgent', hours: 1, days: 1},
      {priority: 'high', hours: 24, days: 2},
      {priority: 'normal', hours: 48, days: 4},
      {priority: 'low', hours: 110, days: 10},
    ];
    var sla = _.findWhere(priorities, {priority: ticket.priority()});
    if (total_hours <= sla.hours) {
      // console.log("Met SLA!! (" + sla.hours + " hours)");
      ticket.customField("custom_field_40302407", 'sla_met');
      return true;
    } else {
      // console.log("Didn't meet SLA...(" + sla.hours + " hours)");
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
    var hours = end_of_day - date_object.getHours();
    return hours;
  },

  old_biz_hours_from_beginning_of_day: function(date_object) {
    var start_of_day = this.get_work_hours().start_of_day;
    var hours = start_of_day - date_object.getHours();
    return hours;
  },



  number_of_days: function(start_date, end_date) {
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var diffDays = Math.round(Math.abs((start_date.getTime() - end_date.getTime())/(oneDay)));
    // console.log("diffDays: " + diffDays);
    return diffDays + 1;
  },

  spans_a_weekend: function(start_date, end_date) {
    if (end_date.getDay() < start_date.getDay()) {
      return true;
    } else {
      return false;
    }
  },

  biz_hours_from_beginning_of_day: function(date_object) {
    var start = new Date(date_object.getTime());
    start.setHours(this.get_work_hours().start_hour);
    start.setMinutes(this.get_work_hours().start_minutes);

    return this.convert_time_difference_to_hours(date_object - start);
  },

  sent_to_psl_during_biz_hours: function(sent_to_psl_date) {
    var biz_hours_from_beginning_of_day = this.biz_hours_from_beginning_of_day(sent_to_psl_date);

    // console.log("biz_hours_from_beginning_of_day");
    // console.log(biz_hours_from_beginning_of_day);
    if (biz_hours_from_beginning_of_day >= 0) {
      // console.log("day hours");
      // console.log(this.get_work_hours().day_hours);
      if (biz_hours_from_beginning_of_day >= this.get_work_hours().day_hours) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  },

  count_num_biz_hours: function(sent_to_psl_date, sent_to_csa_date) {

    var biz_hours = this.sent_to_psl_during_biz_hours(sent_to_psl_date);
    var biz_hours_psl_date = this.biz_hours_from_beginning_of_day(sent_to_psl_date);
    // console.log(biz_hours_psl_date + ": biz_hours_psl_date");
    var biz_hours_csa_date = this.biz_hours_till_end_of_day(sent_to_csa_date);
    // console.log(biz_hours_csa_date + ": biz_hours_csa_date");
    var number_of_days = this.number_of_days(sent_to_psl_date, sent_to_csa_date);
    var num_holidays = this.check_holidays(sent_to_psl_date, sent_to_csa_date);
    // console.log("number_of_days");
    // console.log(number_of_days);
    var total = 0;

    // var days = [];
    //
    // for (var i = 0; i < number_of_days; i++) {
    //   console.log("---------- Day: " + (i + Number(1)));
    //   var day = {start_time:};
    //
    //   days.push("lala");
    // }
    // console.log(days);

// variations in sent to psl time (before or after work hours or during)
// if same day, CSA time... after work hours?

    var sent_to_psl_after_hours, sent_to_psl_before_hours;

    // Figure out if it was sent to PSL during biz hours
    if (biz_hours_psl_date > this.get_work_hours().day_hours) {
      // Sent after hours
      sent_to_psl_after_hours = true;
      // console.log("sent_to_psl_after_hours");
    } else if (biz_hours_psl_date < 0) {
      // Sent before biz hours
      sent_to_psl_before_hours = true;
      // console.log("sent_to_psl_before_hours");
    }

    var sent_to_csa_after_hours, sent_to_csa_before_hours;
    // Figure out if it was sent to CSA during biz hours
    if (biz_hours_csa_date > this.get_work_hours().day_hours) {
      // Sent to CSA before hours
      sent_to_csa_before_hours = true;
      if (number_of_days > 1) {
        // If multi-day, take off the last day because an extra day got added because it was sent to CSA after hours
        number_of_days -= 1;
      }
    }
    else if (biz_hours_csa_date <= 0) {
      // Sent to CSA after hours
      sent_to_csa_after_hours = true;
      if (number_of_days > 1) {
        // If multi-day, take off the last day because an extra day got added because it was sent to CSA after hours
        number_of_days -= 1;
      }
      // console.log("sent_to_csa_after_hours");
    }

    // Account for holidays
    if (num_holidays > 0) {
      // console.log("num_holidays" + num_holidays);
      number_of_days -= num_holidays;
    }

    // Make sure we don't get a negative number of days
    if (number_of_days < 1) {
      number_of_days = 1;
    }


    // Figure out if we're dealing with 1 day or multiple
    if (number_of_days === 1) {
      // This is happening on the same day
      // console.log("This is happening on the same day");
      if (sent_to_psl_before_hours) {
        total += biz_hours_psl_date; // adding a negative number
        // console.log(biz_hours_psl_date);
      }
      total += this.convert_time_difference_to_hours(sent_to_csa_date - sent_to_psl_date);
      // total += biz_hours_csa_date;
      // console.log(total + " sent_to_csa_date - sent_to_psl_date");
    } else {
      // This spans multiple days
      // console.log("---------");
      // Cycle through each day and add hours
      for (var i = 1; i <= number_of_days; i++) {
        // console.log("ran x: " + i );
        if (i === 1) {
          // Day One
          if (sent_to_psl_before_hours) {
            // Since this is multiple days, we'll count the full day since it was sent before hours
            total += this.get_work_hours().day_hours; // adding a negative number
            // console.log("Adding: " + this.get_work_hours().day_hours + " // Sent before hours, multi-day");
          }
          else if (sent_to_psl_after_hours) {
            // Sent after hours, skip the first day
            // console.log("Skipping first day");
          }
          else {
            // Sent during the day
            total += this.get_work_hours().day_hours - biz_hours_psl_date;
            // console.log("Adding: " + this.get_work_hours().day_hours - biz_hours_psl_date);
          }
          // console.log("Day 1: //" + total + "\n ------------");
        } else if (i === number_of_days) {
          // Last day, just add the actual biz hours
          if (sent_to_csa_after_hours) {
            // The last day, if it was sent to CSA after hours, it will think there's a whole other day
            // Don't subtract anything
            total += this.get_work_hours().day_hours ;
            // console.log("Sent to CSA after hours");
          }
          else if (sent_to_csa_before_hours) {
            // if it's sent before hours on the day it's due
            total += this.get_work_hours().day_hours ;
          }
          else {
            total += this.get_work_hours().day_hours - biz_hours_csa_date;
          }
          // console.log("Adding: " + biz_hours_csa_date);
          // console.log("Last Day, Day: " + i + " // " + total + "\n ------------");
        }
        else {
          total += this.get_work_hours().day_hours;
          // console.log("Adding: " + this.get_work_hours().day_hours + " // Normal full day");
          // console.log("Day: " + i + " // " + total + "\n ------------");
        }
      }
      // this.cycle_through_days(total);
    }
    // console.log("number_of_days");
    // console.log(number_of_days);
    // console.log("biz_hours_psl_date");
    // console.log(biz_hours_psl_date);
    // console.log("biz_hours_csa_date");
    // console.log(biz_hours_csa_date);
    //
    // console.log(" ---- total ---- ");
    // console.log(total);
    return total;

  },






};
