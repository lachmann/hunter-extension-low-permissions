// Counts the main actions made with the extension to know which features
// are the most successful
//

var Analytics = {
  trackEvent: function(eventName) {
    url = "https://hunter.io/events?name="+eventName;
    $.ajax({
      url : url,
      type : 'GET',
      dataType : 'json',
      success : function(json){
        // Done!
      }
    });
  }
}

var analytics = Object.create(Analytics);
