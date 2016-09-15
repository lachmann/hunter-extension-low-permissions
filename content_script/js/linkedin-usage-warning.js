//
// --- linkedin-usage-warning.js ---
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
  chrome.storage.sync.set({'linkedin_profile_views_last': dateTodayString()});
}

function updateProfileViewsCount(count) {
  chrome.storage.sync.set({'linkedin_profile_views': count});
}

function updateUsageWarningViewed(value) {
  chrome.storage.sync.set({'usage_warning_viewed': value});
}

function updateUsageWarningHide(value) {
  chrome.storage.sync.set({'usage_warning_hide': value}, function() {
    // Never show the warning in the future
  });
}

function incrementProfileViewsCount() {
  chrome.storage.sync.get('linkedin_profile_views', function(value){
    if (typeof value["linkedin_profile_views"] !== "undefined") {
      views_count = value["linkedin_profile_views"] + 1;
      updateProfileViewsCount(views_count);
      prepareLimitationWarning(views_count);
    }
    else {
      updateProfileViewsCount(1);
    }
  })
}

function prepareLimitationWarning(views_count) {
  if (views_count >= 400) {
    chrome.storage.sync.get('usage_warning_hide', function(hide){
      if (typeof hide['usage_warning_hide'] === "undefined") {
        chrome.storage.sync.get('usage_warning_viewed', function(value) {
          if (typeof value["usage_warning_viewed"] === "undefined" || value["usage_warning_viewed"] == false) {
            displayLimitationWarning();
          }
        });
      }
    });
  }
}

function displayLimitationWarning() {
  var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');
  $("body").append('<div id="hio_bar_usage_warning"><form id="hio_usage_warning_form"><img src="' + logo + '" alt="Email Hunter"><br/>Wow! It seems you have visited an important number of profiles on LinkedIn today. LinkedIn may block your access if you continue to visit pages today. Please note that each profile saved from LinkedIn\'s search with Email Hunter is also a page view.<br/><br/><label for="hio_usage_warning_dont_show"><input type="checkbox" id="hio_usage_warning_dont_show">Don\'t show me this in the future</label><button type="submit">OK, I understand the risks</button></form></div>');

  $("#hio_usage_warning_form").on("submit", function(){
    $("#hio_bar_usage_warning").fadeOut(200);
    updateUsageWarningViewed(true);

    if ($("#hio_usage_warning_dont_show").prop("checked") == true) {
      updateUsageWarningHide(true);
    }

    return false;
  });
}

function dateTodayString() {
  date = new Date()
  return date.toDateString()
}
