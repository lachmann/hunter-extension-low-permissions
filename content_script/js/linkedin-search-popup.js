var LinkedinSearchPopup = {

  updateSelection: function() {
    var selected_profiles = new Array;

    if (LinkedinVersion.isSalesNavigator()) {
      // Sales Navigator
      $("#results-list .result").each(function(index) {
        if($(this).find(".fa-check-square").length) {
          profile_path = $(this).find(".profile-link").attr("href");
          profile_name = $(this).find(".name a").text();
          profile_id = profile_name.hashCode();
          selected_profiles.push({ "profile_path":  profile_path,
                                   "profile_name": profile_name,
                                   "profile_id": profile_id });
        }
      });
    } else if (LinkedinVersion.isRecruiter()) {
      // TO DO : compatibility with LinkedIn Recruiter
    }
    else {
      // Standard LinkedIn
      $(".result.people").each(function(index) {
        if($(this).find(".fa-check-square").length) {
          profile_path = $(this).find(".title").attr("href");
          profile_name = $(this).find(".main-headline").text();
          profile_id = profile_name.hashCode();
          selected_profiles.push({ "profile_path":  profile_path,
                                   "profile_name": profile_name,
                                   "profile_id": profile_id });
        }
      });
    }

    window.selected_profiles = selected_profiles;
  },

  updateSelectionView: function() {
    this_popup = this

    if (window.selected_profiles.length > 0) {
      if (window.selected_profiles.length == 1) { s = ""; } else { s = "s"; }

      if ($("#ehunter_search_selection_popup").length > 0) {
        $("#ehunter_profile_selected").html('<strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected');
      }
      else {
        var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');

        $("body").append('\n\
          <div id="ehunter_search_selection_popup">\n\
            <i class="fa fa-ellipsis-v ehunter_search_popup_drag"></i>\n\
            <div id="ehunter_search_popup_close">&times;</div>\n\
            <img src="' + logo + '" alt="Hunter">\n\
            <div id="ehunter_search_popup_content_container">\n\
              <div id="ehunter_profile_selected">\n\
                <strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected\n\
              </div>\n\
              <ul id="ehunter_search_status_list"></ul>\n\
              <button class="orange-btn">Find email addresses & save leads</button>\n\
              <br/><br/>\n\
              <label id="ehunter_save_without_email_label">\n\
                <i class="fa fa-square"></i>\n\
                Save even if the email adress is not found.\n\
              </label>\n\
            </div>\n\
            <div id="ehunter_search_popup_error"></div>\n\
            <div id="ehunter_search_selection_popup_account">\n\
              <div class="pull-right" id="ehunter_search_popup_requests"></div>\n\
              <div class="ehunter_list_select_container"></div>\n\
            </div>\n\
          </div>\n\
        ');

        // Add account information in the search
        this_popup.addAccountInformation();

        // Display the lists of leads
        ListSelection.appendSelector();

        // Launch the search
        this_popup.launchParsing();

        // Update "save without email" option
        this_popup.saveWithoutEmailListener();

        // Drag popup
        $("#ehunter_search_selection_popup").draggable({ handle: ".ehunter_search_popup_drag" });

        // Close popup
        $("#ehunter_search_popup_close").click(function() {
          this_popup.close();
        });
        $(document).keyup(function(e) {
          if (e.keyCode == 27) {
            this_popup.close();
          }
        });
      }

      // Display the list in the popup
      $("#ehunter_search_status_list").html("");
      window.selected_profiles.forEach(function(search_profile, index) {
        $("#ehunter_search_status_list").append("<li data-profile-id='" + search_profile["profile_id"] + "'><span></span>" + limitLength(search_profile["profile_name"], 20) + "</li>");
      });
    }
    else {
      this_popup.close();
    }

    // Adapt the DOM in Sales Navigator
    this_popup.adaptSalesNavigatorBody();
  },

  close: function() {
    $("#ehunter_search_selection_popup").remove();

    if (LinkedinVersion.isSalesNavigator()) {
      $("#body, .nav-wrapper").css( { "margin-left": "auto" } );
    }
  },

  addAccountInformation: function() {
    Account.get(function(json) {
      if (json == "none") {
        $("#ehunter_search_popup_requests").html('\n\
          Not logged in. \n\
          <a target="_blank" href="https://hunter.io/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Sign in</a>\n\
          or <a target="_blank" href="https://hunter.io/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Create a free account</a>\n\
        ');
        $("#ehunter_search_selection_popup button").prop("disabled", true);
        $("#ehunter_search_selection_popup button").text("Please sign in to save leads");
      }
      else {
        $("#ehunter_search_popup_requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available));
      }
    })
  },

  finishStatus: function() {
    window.number_processed ++;

    if (window.number_processed >= window.selected_profiles.length) {
      this.activateButton();
      this.addAccountInformation();
    }
  },


  // Launch the parsing of profiles and companies and save the leads
  // (linkedin-search-save.js)
  //
  launchParsing: function() {
    this_popup = this;

    $("#ehunter_search_selection_popup button").click(function() {
      window.number_processed = 0;
      this_popup.desactivateButton();
      $("#ehunter_search_status_list li span").text("Loading...");

      window.selected_profiles.forEach(function(search_profile, index) {
        LinkedinSearchSave.launch(search_profile, function(is_saved, status, id) {
          if (is_saved) {
            $("#ehunter_search_status_list li[data-profile-id='" + id + "'] span").html(status + "<i class='fa fa-check'></i>");
          }
          else {
            $("#ehunter_search_status_list li[data-profile-id='" + id + "'] span").html(status + "<i class='fa fa-times'></i>");
          }

          this_popup.finishStatus();
        });
      });
    })
  },


  // Update the option to save or not a lead if the email is not found
  //
  saveWithoutEmailListener: function() {
    this_popup = this
    this_popup.checkOptionSaveWithoutEmail();

    $("#ehunter_save_without_email_label").unbind().click(function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#ff5722' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      this_popup.updateOptionSaveWithoutEmail();
    });
  },


  updateOptionSaveWithoutEmail: function() {
    if ($("#ehunter_save_without_email_label .fa").hasClass("fa-check-square")) {
      chrome.storage.sync.set({'save_leads_without_emails': true});
    }
    else {
      chrome.storage.sync.set({'save_leads_without_emails': false});
    }
  },


  checkOptionSaveWithoutEmail: function() {
    chrome.storage.sync.get('save_leads_without_emails', function(value){
      if (typeof value["save_leads_without_emails"] !== "undefined" && value["save_leads_without_emails"] == true) {
        $("#ehunter_save_without_email_label .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#ff5722' });
      }
    });
  },


  adaptSalesNavigatorBody: function() {
    if (LinkedinVersion.isSalesNavigator()) {
      if (window.selected_profiles.length > 0) {
        $("#body, .nav-wrapper").animate({ "margin-left": "20px" }, 300);
      }
      else {
        $("#body, .nav-wrapper").css( { "margin-left": "auto" } );
      }
    }
  },


  desactivateButton: function() {
    $("#ehunter_search_selection_popup button").prop("disabled", true);
    $("#ehunter_search_selection_popup button").text("Please wait...");
    $("#ehunter_search_selection_popup button").prepend("<i class='fa fa-spinner fa-spin'></i>");
  },


  activateButton: function() {
    $("#ehunter_search_selection_popup button").prop("disabled", false);
    $("#ehunter_search_selection_popup button").text("Find email addresses & save leads");
  },


  handleSaveStatus: function(response, profile_id) {
    if (typeof response.status != "undefined" && response.status == "success") {
      $("#ehunter_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Saved<i class='fa fa-check'></i>");
    }
    else if (response == "please_sign_in") {
      $("#ehunter_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Please sign in<i class='fa fa-times'></i>");
    }
    else if (response == "duplicated_entry") {
      $("#ehunter_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Already saved<i class='fa fa-times'></i>");
    }
    else {
      $("#ehunter_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Error<i class='fa fa-times'></i>");
    }
  }
}
