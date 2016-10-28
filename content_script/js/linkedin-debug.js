Debug = {

  handleDisappearedButton: function() {
    if (this.isLinkedinButtonBlocked()) {
      this.displayDebugMessage("It seems Hunter's button failed to appear on the profile. No worries! You still can find the email address by clicking on the icon in your browser.");
      chrome.storage.sync.set({'linkedin_button_blocked_date': weekTodayString()});
    }
  },

  isLinkedinButtonBlocked: function() {
    if ($(".ehunter_linkedin_button").length && $(".ehunter_linkedin_button").is(":visible")) {
      return false;
    }
    return true;
  },

  handleDisappearedCheckboxes: function() {
    if (this.isLinkedinSearchBlocked()) {
      this.displayDebugMessage("It seems Hunter's checkboxes failed to appear on the search. No worries! You still can save the leads from this page by clicking on the icon in your browser.");
      chrome.storage.sync.set({'linkedin_checkboxes_blocked_date': weekTodayString()});
    }
  },

  isLinkedinSearchBlocked: function() {
    if ($(".ehunter_checkbox_container").length && $(".ehunter_checkbox_container").is(":visible")) {
      return false;
    }
    return true;
  },

  hasMessageBeenDisplayed: function(message_name, response) {
    chrome.storage.sync.get(message_name, function(value){
      if (value[message_name] == weekTodayString()) {
        return response(true);
      }
      return response(false);
    });
  },

  displayDebugMessage: function(message) {
    var html = $("<div>" + message + "</div>");
    $("body").append(html);
    html.css({
      "font-family": "'Lato', Helvetica, Ubuntu, Arial, sans-serif",
      "font-size": "14px",
      "line-height": "21px",
      "border-left": "7px solid #ff5722",
      "border-radius": "5px",
      "position": "fixed",
      "top": "123px",
      "right": "20px",
      "width": "200px",
      "color": "#333",
      "padding": "20px",
      "background": "#fff",
      "box-shadow": "0 0 20px rgba(0, 0, 0, 0.5)",
      "z-index": "11001",
    })
  }
}
