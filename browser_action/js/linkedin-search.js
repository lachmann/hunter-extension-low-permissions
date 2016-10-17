LinkedinSearch = {
  launch: function() {
    this_popup = this;

    $("#linkedin-search").show();

    var readyStateCheckInterval = setInterval(function() {
      chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {subject: "get_linkedin_search_results"}, function(response) {
          if (typeof response[0] != "undefined") {
            clearInterval(readyStateCheckInterval);

            this_popup.open(response);
          }
          else {
            $("#linkedin-search").hide();
            $(".error-message").text("No lead to save on this search page. The profiles must be in your network in LinkedIn to be saved.");
            $(".error").slideDown(300);
          }
        });
      });
    }, 200);
  },

  open: function(profiles) {
    window.profiles = profiles;

    // console.log(profiles.length);
    // if (profiles.length == 0) {
    //   $("#linkedin-search").hide();
    //   $(".error-message").text("No lead to save on this search page. The profiles must be in your network in LinkedIn to be saved.");
    //   $(".error").slideDown(300);
    // }

    var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');

    $("#linkedin-search").prepend("\n\
      <div class='linkedin-search-top'>\n\
        <button id='linkedin-search-submit' class='orange-btn' disabled='disabled'>Find email addresses & save leads</button>\n\
        <img class='linkedin-search-logo' src='" + logo + "' alt='Hunter'>\n\
      </div>\n\
      <div class='linkedin-profiles-selected'><strong>0 profiles</strong> selected</div>\n\
      <div class='select-all-profiles'>\n\
        <i class='fa fa-square'></i>\n\
        Select all\n\
      </div>\n\
    ")

    $.each(profiles, function(key, value) {
      $(".linkedin-search-profiles").append("\n\
        <div class='linkedin-search-profile' data-profile-id='" + value.profile_id + "'>\n\
          <span class='linkedin-profile-status'></span>\n\
          <i class='fa fa-square'></i>\n\
          <img src='" + value.profile_pic + "'>\n\
          <div class='linkedin-profile-description'>\n\
            <span class='linkedin-profile-name'>" + limitLength(value.profile_name, 30) + "</span>\n\
            <br/>\n\
            <span class='linkedin-profile-title'>" + limitLength(value.profile_title, 40) + "</span>\n\
          </div>\n\
        </div>\n\
      ");
    });

    this.selectProfiles();
    this.addAccountInformation();
    this.saveWithoutEmailListener();
    ListSelection.appendSelector();
    this.launchParsing();
  },

  selectProfiles: function() {
    this_popup = this;

    $(".linkedin-search-profile").on("click", function() {
      checkbox = $(this).find(".fa-square, .fa-check-square").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      this_popup.updateSelection();
    });

    $(".select-all-profiles").click(function() {
      checkbox = $(this).find(".fa-square, .fa-check-square");
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
        $(".linkedin-search-profiles .fa-square").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
        $(".linkedin-search-profiles .fa-check-square").removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      this_popup.updateSelection();
    });
  },

  updateSelection: function() {
    selected_profiles = new Array;
    $(".linkedin-search-profile").each(function(key, value) {
      if ($(this).find(".fa-check-square").length) {
        profile_id = $(this).attr("data-profile-id");
        var profile = window.profiles.filter(function(p) { return p.profile_id == profile_id; });
        selected_profiles.push(profile[0]);
      }
    });

    window.selected_profiles = selected_profiles;

    // Update the number of porfiles selected in the view
    if (window.selected_profiles.length == 1) { $(".linkedin-profiles-selected strong").text(window.selected_profiles.length + " profile"); }
    else { $(".linkedin-profiles-selected strong").text(window.selected_profiles.length + " profiles"); }

    if (window.selected_profiles.length > 0) { $("#linkedin-search-submit").prop("disabled", false); }
    else { $("#linkedin-search-submit").prop("disabled", true); }
  },

  launchParsing: function() {
    this_popup = this;

    $("#linkedin-search-submit").click(function() {
      this_popup.desactivateButton();
      window.number_processed = 0;

      window.selected_profiles.forEach(function(search_profile, index) {
        $("div[data-profile-id='" + search_profile.profile_id + "'] .linkedin-profile-status").text("Loading...");
        this_popup.parseProfile(search_profile, index);
      });
    });
  },

  addAccountInformation: function() {
    Account.get(function(json) {
      if (json == "none") {
        $(".linkedin-profiles-account-requests").html('\n\
          Not logged in. \n\
          <a target="_blank" href="https://hunter.io/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Sign in</a>\n\
          or <a target="_blank" href="https://hunter.io/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Create a free account</a>\n\
        ');
        $("#linkedin-search-submit").prop("disabled", true);
        $("#linkedin-search-submit").text("Please sign in to save leads");
      }
      else {
        $(".linkedin-profiles-account-requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available)+" requests");
      }
    })
  },

  parseProfile: function(profile) {
    chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {subject: "get_selected_linkedin_profile", profile: profile }, function(response) {
        if (response.is_saved) {
          $("div[data-profile-id='" + response.id + "'] .linkedin-profile-status").html(response.status + "<i class='fa fa-check'></i>");
        }
        else {
          $("div[data-profile-id='" + response.id + "'] .linkedin-profile-status").html(response.status + "<i class='fa fa-times'></i>");
        }

        this_popup.finishStatus();
      });
    });
  },

  saveWithoutEmailListener: function() {
    this_popup = this
    this_popup.checkOptionSaveWithoutEmail();

    $(".linkedin-search-save-without-email").unbind().click(function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      this_popup.updateOptionSaveWithoutEmail();
    });
  },

  updateOptionSaveWithoutEmail: function() {
    if ($(".linkedin-search-save-without-email .fa").hasClass("fa-check-square")) {
      chrome.storage.sync.set({'save_leads_without_emails': true});
    }
    else {
      chrome.storage.sync.set({'save_leads_without_emails': false});
    }
  },

  checkOptionSaveWithoutEmail: function() {
    chrome.storage.sync.get('save_leads_without_emails', function(value){
      if (typeof value["save_leads_without_emails"] !== "undefined" && value["save_leads_without_emails"] == true) {
        $(".linkedin-search-save-without-email .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
    });
  },

  desactivateButton: function() {
    $("#linkedin-search-submit").prop("disabled", true);
    $("#linkedin-search-submit").text("Please wait...");
    $("#linkedin-search-submit").prepend("<i class='fa fa-spinner fa-spin'></i>");
  },


  activateButton: function() {
    $("#linkedin-search-submit").prop("disabled", false);
    $("#linkedin-search-submit").text("Find email addresses & save leads");
  },

  finishStatus: function() {
    window.number_processed ++;

    if (window.number_processed >= window.selected_profiles.length) {
      this.activateButton();
      this.addAccountInformation();
    }
  }
}
