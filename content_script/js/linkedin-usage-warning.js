//
// --- linkedin-usage-monitoring.js ---
//
// A too intensive usage of LinkedIn can block an account.
// One metric taken into account by LinkedIn is the number of page viewed in a
// short span of time. In this file, we count the number of pages viewed the
// current day in order to display a warning before the securities of LinkedIn
// are triggered.
//

function countOneProfileView() {
  chrome.storage.sync.get('linkedin_profile_views_last', function(value){
    if (typeof value["linkedin_profile_views_last"] === "undefined" || value["linkedin_profile_views_last"] != dateTodayString()) {
      updateProfileViewsDate();
      updateProfileViewsCount(1);
      updateUsageWarningViewed(false);
    }
    else {
      incrementProfileViewsCount();
    }
  });
}

function updateProfileViewsDate() {
  chrome.storage.sync.set({'linkedin_profile_views_last': dateTodayString()}, function() {
    // Profiles views counted for today
  });
}

function updateProfileViewsCount(count) {
  chrome.storage.sync.set({'linkedin_profile_views': count}, function() {
    // Profiles views updated
  });
}

function updateUsageWarningViewed(value) {
  chrome.storage.sync.set({'usage_warning_viewed': value}, function() {
    // Profile seen status updated
  });
}

function incrementProfileViewsCount() {
  chrome.storage.sync.get('linkedin_profile_views', function(value){
    if (typeof value["linkedin_profile_views"] !== "undefined") {
      views_count = value["linkedin_profile_views"] + 1;
      updateProfileViewsCount(views_count);
      //prepareLimitationWarning(views_count);
    }
    else {
      updateProfileViewsCount(1);
    }
  })
}

function prepareLimitationWarning(views_count) {
  if (views_count >= 400) {
    chrome.storage.sync.get('usage_warning_viewed', function(value) {
      if (typeof value["usage_warning_viewed"] === "undefined" || value["usage_warning_viewed"] == false) {
        displayLimitationWarning();
      }
    });
  }
}

function displayLimitationWarning() {
  var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');
  $("body").append('<div id="eh_bar_usage_warning"><div class="eh_usage_warning_container"><img src="' + logo + '" alt="Email Hunter"><br/>Wow! It seems you have visited an important number of profiles on LinkedIn today. LinkedIn may block your access if you continue to visit pages today. Please note that each profile saved from LinkedIn\'s search with Email Hunter is also a page view.<br/><br/><span id="eh_close_bar_usage_warning">I understand the risks, thank you</span></div></div>');

  $("#eh_close_bar_usage_warning").click(function() {
    $("#eh_bar_usage_warning").fadeOut(200);
    updateUsageWarningViewed(true);
  });
}

function dateTodayString() {
  date = new Date()
  return date.toDateString()
}
