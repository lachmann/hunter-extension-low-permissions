var LinkedinProfileButton = {

  // Inject the button on the profile
  inject() {
    var icon = chrome.extension.getURL('shared/img/icon48_white.png');
    if (LinkedinVersion.isSalesNavigator()) {
      $(".profile-actions").prepend('\n\
        <button disabled style="margin: 0 10px 0 0;" class="eh_linkedin_button">\n\
          <img src="' + icon + '">Email Hunter\n\
        </button>\n\
      ');
    } else if(LinkedinVersion.isRecruiter()) {
      $(".profile-actions").prepend('\n\
        <button disabled style="margin: 0 10px 0 0;" class="eh_linkedin_button eh_linkedin_button_small">\n\
          <img src="' + icon + '">Email Hunter\n\
        </button>');
    }
    else {
      $(".profile-aux .profile-actions").prepend('\n\
        <button disabled style="margin: 5px 5px 5px 0;" class="eh_linkedin_button">\n\
          <img src="' + icon + '">Email Hunter\n\
        </button>');
    }
  },

  // Start the parsing and injection
  // The button is active only when the profile is parsed
  launch: function() {
    this.inject();

    if (LinkedinVersion.isRecruiter()) { parsing_duration = 500; }
    else { parsing_duration = 0; }

    // Parse the page
    setTimeout(function(){
      LinkedinProfile.parse($("html").html(), function(profile) {
        window.profile = profile;
        $(".eh_linkedin_button").prop("disabled", false);

        // Open popup on Linkedin profile
        $(".eh_linkedin_button").click(function() {
          LinkedinProfilePopup.launch();
        });
      });
    }, parsing_duration);
  },

  // Check is we can start the injection depending on the version of LinkedIn
  isReadyToInject: function() {
    if (LinkedinVersion.isRecruiter() && $(".send-inmail-split-button").length) {
      return true;
    }
    else if (LinkedinVersion.isRecruiter() == false &&  document.readyState === "complete") {
      return true;
    }
    else {
      return false;
    }
  }
}


// >> Start JS injection when the extension loads
//
chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    // $(".profile-actions").length  == this is a profile page
    if (LinkedinProfileButton.isReadyToInject() && $(".profile-actions").length) {
      clearInterval(readyStateCheckInterval);
      LinkedinProfileButton.launch();
    }
  }, 200);
});
