var LinkedinSearchPopup = {

  updateSelection: function() {
    var selected_profiles = new Array;

    if (LinkedinVersion.isSalesNavigator()) {
      // Old version of Sales Navigator
      $(".entity").each(function(index) {
        if($(this).find(".fa-check-square").length) {
          profile_path = $(this).find(".name a").attr("href");
          profile_name = $(this).find(".name a").text();
          profile_id = profile_name.hashCode();
          selected_profiles.push({ "profile_path":  profile_path,
                                   "profile_name": profile_name,
                                   "profile_id": profile_id });
        }
      });

      // New version of Sales Navigator
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

      if ($("#eh_search_selection_popup").length > 0) {
        $("#eh_profile_selected").html('<strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected');
      }
      else {
        var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');

        $("body").append('\n\
          <div id="eh_search_selection_popup">\n\
            <i class="fa fa-ellipsis-v eh_search_popup_drag"></i>\n\
            <div id="eh_search_popup_close">&times;</div>\n\
            <img src="' + logo + '" alt="Email Hunter">\n\
            <div id="eh_search_popup_content_container">\n\
              <div id="eh_profile_selected">\n\
                <strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected\n\
              </div>\n\
              <ul id="eh_search_status_list"></ul>\n\
              <button class="orange-btn">Find email addresses & save leads</button>\n\
              <br/><br/>\n\
              <label id="eh_save_without_email_label">\n\
                <i class="fa fa-square"></i>\n\
                Save even if the email adress is not found.\n\
              </label>\n\
            </div>\n\
            <div id="eh_search_popup_error"></div>\n\
            <div id="eh_search_selection_popup_account">\n\
              <div class="pull-right" id="eh_search_popup_requests"></div>\n\
              <div class="eh_list_select_container"></div>\n\
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
        $("#eh_search_selection_popup").draggable({ handle: ".eh_search_popup_drag" });

        // Close popup
        $("#eh_search_popup_close").click(function() {
          this_popup.close();
        });
        $(document).keyup(function(e) {
          if (e.keyCode == 27) {
            this_popup.close();
          }
        });
      }

      // Display the list in the popup
      $("#eh_search_status_list").html("");
      window.selected_profiles.forEach(function(search_profile, index) {
        $("#eh_search_status_list").append("<li data-profile-id='" + search_profile["profile_id"] + "'><span></span>" + search_profile["profile_name"] + "</li>");
      });
    }
    else {
      this_popup.close();
    }

    // Adapt the DOM in Sales Navigator
    this_popup.adaptSalesNavigatorBody();
  },

  close: function() {
    $("#eh_search_selection_popup").remove();

    if (LinkedinVersion.isSalesNavigator()) {
      $("#body, .nav-wrapper").css( { "margin-left": "auto" } );
    }
  },

  addAccountInformation: function() {
    Account.get(function(json) {
      if (json == "none") {
        $("#eh_search_popup_requests").html('\n\
          Not logged in. \n\
          <a target="_blank" href="https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Sign in</a>\n\
          or <a target="_blank" href="https://emailhunter.co/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Create a free account</a>\n\
        ');
        $("#eh_search_selection_popup button").prop("disabled", true);
        $("#eh_search_selection_popup button").text("Please sign in to save leads");
      }
      else {
        $("#eh_search_popup_requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available));
      }
    })
  },

  fetchProfile: function(profile_path, callback) {
    $.ajax({
      url: profile_path,
      type: 'GET',
      success: function(response){
        return callback(response);
      },
      error: function() {
        // ERROR
      }
    });
  },


  // 1. Launch the parsing of profiles and companies
  //    (full profile & company website)
  //
  launchParsing: function() {
    this_popup = this

    $("#eh_search_selection_popup button").click(function() {
      window.number_processed = 0;
      this_popup.desactivateButton();
      $("#eh_search_status_list li span").text("Loading...");

      window.profile = new Array;
      window.selected_profiles.forEach(function(search_profile, index) {
        this_popup.parseProfile(search_profile, index);
      });
    })
  },


  // 2. Parse the profile
  //
  parseProfile: function(search_profile, index) {
    this_popup = this

    // Fetch and parse the profile
    this_popup.fetchProfile(search_profile["profile_path"], function(response) {
      LinkedinProfile.parse(response, function(parsed_profile) {
        window.profile[index] = parsed_profile;
        window.profile[index]["profile_id"] = search_profile["profile_id"];

        if (typeof window.profile[index]["last_company_path"] == "undefined") {
          this_popup.saveOrNotAndUpdateStatus("Company not found", index);
        }
        else {
          // Visit company page and get the website
          LinkedinCompany.get(window.profile[index], function(company_data) {
            if (company_data == "none") {
              this_popup.saveOrNotAndUpdateStatus("Website not found", index);
            }
            else {
              window.profile[index]["domain"] = cleanDomain(company_data.website);
              window.profile[index]["company_size"] = company_data.company_size;
              window.profile[index]["company_industry"] = company_data.company_industry;
              this_popup.findEmailAndSave(index);
            }
          });
        }
      });
    });
  },


  // 3. Find email addresses and save leads
  //
  findEmailAndSave: function(index) {
    this_popup = this

    // First we have to find email addresses
    Account.getApiKey(function(api_key) {

      generate_email_endpoint = 'https://api.emailhunter.co/v2/email-finder?domain=' + encodeURIComponent(window.profile[index]["domain"]) + '&first_name=' + encodeURIComponent(window.profile[index]["first_name"]) + '&last_name=' + encodeURIComponent(window.profile[index]["last_name"]) + '&position=' + encodeURIComponent(window.profile[index]["position"]) + '&company=' + encodeURIComponent(window.profile[index]["last_company"]);
      apiCall(api_key, generate_email_endpoint, function(email_json) {

        // If there is no result, we try to remove a subdomain
        if (email_json.data.email == null && withoutSubDomain(window.profile[index]["domain"])) {
          window.profile[index]["domain"] = withoutSubDomain(window.profile[index]["domain"]);
          this_popup.findEmailAndSave(index);
        }
        else {
          window.profile[index]["email"] = email_json.data.email;
          window.profile[index]["confidence_score"] = email_json.data.score;

          this_popup.saveOrNotAndUpdateStatus("Email not found", index);
        }
      });
    });
  },


  // 4. Save or not and update status
  //
  // fail_status is the error returned if the email address is not found
  //
  saveOrNotAndUpdateStatus: function(fail_status, index) {
    this_popup = this
    if (window.profile[index]["email"] == null || typeof window.profile[index]["email"] == "undefined") { window.profile[index]["email"] = ""; }
    if (window.profile[index]["confidence_score"] == null || typeof window.profile[index]["confidence_score"] == "undefined") { window.profile[index]["confidence_score"] = ""; }

    if (window.profile[index]["email"] != "") {
      saveLead(window.profile[index], function(response) {
        this_popup.handleSaveStatus(response, window.profile[index]["profile_id"]);
        this_popup.finishStatus();
      });
    }
    else {
      chrome.storage.sync.get('save_leads_without_emails', function(value){
        if (typeof value["save_leads_without_emails"] == "undefined" || value["save_leads_without_emails"] == false) {
          $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").html(fail_status + "<i class='fa fa-times'></i>");
          this_popup.finishStatus();
        }
        else {
          saveLead(window.profile[index], function(response) {
            this_popup.handleSaveStatus(response, window.profile[index]["profile_id"]);
            this_popup.finishStatus();
          });
        }
      });
    }
  },


  // Update the option to save or not a lead if the email is not found
  //
  saveWithoutEmailListener: function() {
    this_popup = this
    this_popup.checkOptionSaveWithoutEmail();

    $("#eh_save_without_email_label").unbind().click(function() {
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
    if ($("#eh_save_without_email_label .fa").hasClass("fa-check-square")) {
      chrome.storage.sync.set({'save_leads_without_emails': true});
    }
    else {
      chrome.storage.sync.set({'save_leads_without_emails': false});
    }
  },


  checkOptionSaveWithoutEmail: function() {
    chrome.storage.sync.get('save_leads_without_emails', function(value){
      if (typeof value["save_leads_without_emails"] !== "undefined" && value["save_leads_without_emails"] == true) {
        $("#eh_save_without_email_label .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
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
    $("#eh_search_selection_popup button").prop("disabled", true);
    $("#eh_search_selection_popup button").text("Please wait...");
    $("#eh_search_selection_popup button").prepend("<i class='fa fa-spinner fa-spin'></i>");
  },

  activateButton: function() {
    $("#eh_search_selection_popup button").prop("disabled", false);
    $("#eh_search_selection_popup button").text("Find email addresses & save leads");
  },

  handleSaveStatus: function(response, profile_id) {
    if (typeof response.status != "undefined" && response.status == "success") {
      $("#eh_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Saved<i class='fa fa-check'></i>");
    }
    else if (response == "please_sign_in") {
      $("#eh_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Please sign in<i class='fa fa-times'></i>");
    }
    else if (response == "duplicated_entry") {
      $("#eh_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Already saved<i class='fa fa-times'></i>");
    }
    else {
      $("#eh_search_status_list li[data-profile-id='" + profile_id + "'] span").html("Error<i class='fa fa-times'></i>");
    }
  },

  finishStatus: function() {
    window.number_processed ++;

    if (window.number_processed >= window.selected_profiles.length) {
      this.activateButton();
      this.addAccountInformation();
    }
  }
}
