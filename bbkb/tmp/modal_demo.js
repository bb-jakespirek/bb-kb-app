(function() {

  return {
    events: {
      'app.activated':'init',
      'ticket.save':'popModal',
      'click #save_ticket': 'onModalSave',
      'click #fail_ticket': 'onModalCancel'
    },

    init: function() {
      this.switchTo('main');
    },

    popModal: function() {
      var status = this.ticket().status();
      if (status == "solved");
      this.$('#myModal').modal({
        backdrop: true,
        keyboard: false
      });
      return this.promise(function(done, fail) {
        this.saveHookDone = done;
        this.saveHookFail = fail;
        }.bind(this));
    },

    onModalSave: function() {
      this.$('#myModal').hide();
      this.saveHookDone();
    },

    onModalCancel: function() {
      this.saveHookFail('failed save on cancel');
    }
  };

}());
