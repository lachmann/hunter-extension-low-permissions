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
    $("#linkedin-search").prepend("\n\
      <div class='linkedin-search-top'>\n\
        <button id='linkedin-search-submit' class='orange-btn'>Find email addresses & save leads</button>\n\
        <div class='linkedin-profiles-selected'>0 profiles selected</div>\n\
      </div>\n\
      <div class='select-all-profiles'>\n\
        <i class='fa fa-square'></i>\n\
        Select all\n\
      </div>\n\
    ")

    $.each(profiles, function(key, value) {
      $(".linkedin-search-profiles").append("\n\
        <div class='linkedin-search-profile'>\n\
          <i class='fa fa-square'></i>\n\
          <img src='" + value.profile_pic + "'>\n\
          <div class='linkedin-profile-description'>\n\
            <span class='linkedin-profile-name'>" + limitLength(value.profile_name, 30) + "</span>\n\
            <br/>\n\
            <span class='linkedin-profile-title'>" + limitLength(value.profile_title, 50) + "</span>\n\
          </div>\n\
        </div>\n\
      ");
    });

    $(".linkedin-search-profile").on("click", function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }
    });

    $(".select-all-profiles").click(function() {
      checkbox = $(this).find(".fa");
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
        $(".linkedin-search-profiles .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
        $(".linkedin-search-profiles .fa").removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }
    });


    this.updateSelection();
  },

  updateSelection: function() {

  }
}
