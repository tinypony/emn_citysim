define(['jquery', 
        'moment', 
        'backbone',
        'hbs!templates/countdown'], function($, moment, Backbone, CountdowTemplate) {
  
  var Countdown = Backbone.View.extend({
    render: function() {
      this.$el.html(CountdowTemplate());
      
      var $div = this.$('.suds-countdown');
      
      var showTimer = function() {
        var then = moment([2015, 0, 29, 18, 0, 0, 0]);
        
        var now = moment();
        
        var days = then.diff(now, 'days');
        then.subtract(days, 'days');
        
        var hours = then.diff(now, 'hours');
        then.subtract(hours, 'hours');
        
        var minutes = then.diff(now, 'minutes');
        then.subtract(minutes, 'minutes');
        
        var seconds = then.diff(now, 'seconds');
        var countdownString="";
        
        if(days) {
          countdownString = days + 'days ' + hours + 'hours ' + minutes + 'minutes ' + seconds + 'seconds';
        } else {
          countdownString = hours + 'hours ' + minutes + 'minutes ' + seconds + 'seconds';
        }
       
        $div.text(countdownString);
      };
      
      var counter = 0;
      var classes = ['warm', 'umf'];
      var countdownView = self.$('.countdown-view');
      
      var changeBg = function() {
        var nextClass = classes[counter];
        counter = (counter+1) % 2;
        countdownView.removeClass(classes.join(" "));
        countdownView.addClass(nextClass);
        var image = $("img."+nextClass);
        var sibs = image.siblings('img');
        sibs.fadeOut(500);
        image.fadeIn(500);
      };
      
      setInterval(showTimer, 1000);
      setInterval(changeBg, 30000);
      
      changeBg();
      showTimer();
    }
  });
  
  return Countdown;
});