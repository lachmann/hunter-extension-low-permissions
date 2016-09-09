//
// Inject Email Hunter button on Linkedin profile
//
function injectLinkedinButton() {
  var icon = chrome.extension.getURL('shared/img/icon48_white.png');

  if (isSalesNavigator()) {
    $(".profile-actions").prepend('<button disabled style="margin: 0 10px 0 0;" class="eh_linkedin_button eh_linked_connected"><img src="' + icon + '">Email Hunter</button>');
  } else if(isRecruiter()) {
    $(".profile-actions").prepend('<button disabled style="margin: 0 10px 0 0;" class="eh_linkedin_button eh_linkedin_button_small eh_linked_connected"><img src="' + icon + '">Email Hunter</button>');
  }
  else {
    $(".profile-aux .profile-actions").prepend('<button disabled style="margin: 5px 5px 5px 0;" class="eh_linkedin_button eh_linked_connected"><img src="' + icon + '">Email Hunter</button>');
  }
}


//
// Start JS injection
//
chrome.extension.sendMessage({}, function(response) {
  if (isProfilePage()) {
    var readyStateCheckInterval = setInterval(function() {
      if (isProfileLoaded()) {
        clearInterval(readyStateCheckInterval);
        launchEmailHunterOnProfile();
      }
    }, 50);
  }
});


//
// Inject the button and start parsing
//

function launchEmailHunterOnProfile() {
  injectLinkedinButton();

  // Parse the page (linkedin-dom.js)
  setTimeout(function(){
    parseLinkedinProfile($("html").html(), function(profile) {
      window.profile = profile;
      $(".eh_linkedin_button").prop("disabled", false);

      // Open popup on Linkedin profile
      $(".eh_linkedin_button").click(function() {
        launchPopup();
      });
    });
  }, parsingDuration());
}


//
// Is the profile ready?
//

function isProfileLoaded() {
  if (isRecruiter() && $(".send-inmail-split-button").length) {
    return true;
  }
  else if (isRecruiter() == false &&  document.readyState === "complete") {
    return true;
  }
  else {
    return false;
  }
}


//
// Is it a profile page?
//

function isProfilePage() {
  if ($(".profile-actions").length) { return true }
  else { return false }
}


//
// Time to wait to make sure the page is parsed
//
// It seems wise to wait one second on LinkedIn Recruiter as the content is
// loaded asynchronously. To be verified.
//

function parsingDuration() {
  if (isRecruiter()) { return 1000; }
  else { return 0; }
}
