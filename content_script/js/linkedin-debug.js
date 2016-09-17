Debug = {

  handleDisappearedButton: function() {
    if (this.isLinkedinButtonBlocked()) {
      this.displayDebugMessage("It seems Email Hunter's button failed to appear on the profile. No worries! You still can find the email address by clicking on the icon in your browser.");
      chrome.storage.sync.set({'linkedin_button_blocked_date': dateTodayString()});
    }
  },

  isLinkedinButtonBlocked: function() {
    if ($(".eh_linkedin_button").length && $(".eh_linkedin_button").is(":visible")) {
      return false;
    }
    return true;
  },

  hasMessageBeenDisplayed: function(message_name, response) {
    chrome.storage.sync.get(message_name, function(value){
      if (value[message_name] == dateTodayString()) {
        return response(true);
      }
      return response(false);
    });
  },

  isLinkedinSearchBlocked: function() {

  },

  displayDebugMessage: function(message) {
    var html = $("<div>" + message + "</div>");
    $("body").prepend(html);
    html.css({
      "font-family": "'Open Sans', Helvetica, Ubuntu, Arial, sans-serif",
      "font-size": "14px",
      "line-height": "21px",
      "border-left": "7px solid #e86240",
      "border-radius": "5px",
      "position": "fixed",
      "top": "87px",
      "right": "15px",
      "width": "200px",
      "color": "#333",
      "padding": "20px",
      "background": "#fff",
      "box-shadow": "0 0 20px rgba(0, 0, 0, 0.5)",
      "z-index": "11001",
    })
  }
}
