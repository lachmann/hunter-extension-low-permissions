LinkedinSearch = {
  launch: function() {
    this_popup = this;

    var readyStateCheckInterval = setInterval(function() {
      chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {subject: "get_linkedin_search_results"}, function(response) {
          if (typeof response[0].profile_name != "undefined") {
            clearInterval(readyStateCheckInterval);

            this_popup.open(response);
          }
        });
      });
    }, 200);
  },

  open: function(profiles) {
    console.log(profiles);
    $.each(profiles, function(key, value) {
      $("#linkedin-search").append(value.profile_name + "<br/>");
    });
  }
}
