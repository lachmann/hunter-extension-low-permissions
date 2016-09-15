//
// --- linkedin-usage-warning.js ---
//
// A too intensive usage of LinkedIn can block an account.
// One metric taken into account by LinkedIn is the number of page viewed in a
// short span of time. In this file, we count the number of pages viewed the
// current day in order to display a warning before the securities of LinkedIn
// are triggered.
//

LinkedinUsageWarning = {
  dailyLimit: 1,

  countOneProfileView: function() {
    this_usage = this

    chrome.storage.sync.get('linkedin_profile_views_last', function(value){
      if (typeof value["linkedin_profile_views_last"] === "undefined" || value["linkedin_profile_views_last"] != this_usage.dateTodayString()) {
        this_usage.updateProfileViewsDate();
        this_usage.updateProfileViewsCount(1);
        this_usage.updateWarningViewed(false);
      }
      else {
        this_usage.incrementProfileViewsCount();
      }
    });
  },

  updateProfileViewsDate: function() {
    chrome.storage.sync.set({'linkedin_profile_views_last': this_usage.dateTodayString()});
  },

  updateProfileViewsCount: function(count) {
    chrome.storage.sync.set({'linkedin_profile_views': count});
  },

  updateWarningViewed: function(value) {
    chrome.storage.sync.set({'usage_warning_viewed': value});
  },

  updateWarningHide: function(value) {
    chrome.storage.sync.set({'usage_warning_hide': value});
  },

  incrementProfileViewsCount: function() {
    this_usage = this

    chrome.storage.sync.get('linkedin_profile_views', function(value){
      if (typeof value["linkedin_profile_views"] !== "undefined") {
        views_count = value["linkedin_profile_views"] + 1;
        this_usage.updateProfileViewsCount(views_count);
        this_usage.prepareLimitationWarning(views_count);
      }
      else {
        this_usage.updateProfileViewsCount(1);
      }
    })
  },

  prepareLimitationWarning: function(views_count) {
    this_usage = this

    if (views_count >= this_usage.dailyLimit) {
      chrome.storage.sync.get('usage_warning_hide', function(hide){
        if (typeof hide['usage_warning_hide'] === "undefined") {
          chrome.storage.sync.get('usage_warning_viewed', function(value) {
            if (typeof value["usage_warning_viewed"] === "undefined" || value["usage_warning_viewed"] == false) {
              this_usage.displayLimitationWarning();
            }
          });
        }
      });
    }
  },

  displayLimitationWarning: function() {
    this_usage = this;

    var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');
    $("body").append('<div id="hio_bar_usage_warning"><form id="hio_usage_warning_form"><img src="' + logo + '" alt="Email Hunter"><br/>Wow! It seems you have visited an important number of profiles on LinkedIn today. LinkedIn may block your access if you continue to visit pages today. Please note that each profile saved from LinkedIn\'s search with Email Hunter is also a page view.<br/><br/><label for="hio_usage_warning_dont_show"><input type="checkbox" id="hio_usage_warning_dont_show">Don\'t show me this in the future</label><button type="submit">OK, I understand the risks</button></form></div>');

    $("#hio_usage_warning_form").on("submit", function(){
      $("#hio_bar_usage_warning").fadeOut(200);
      this_usage.updateWarningViewed(true);

      if ($("#hio_usage_warning_dont_show").prop("checked") == true) {
        this_usage.updateWarningHide(true);
      }

      return false;
    });
  },

  dateTodayString: function() {
    date = new Date()
    return date.toDateString()
  }
}
