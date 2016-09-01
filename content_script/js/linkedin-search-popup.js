// Update the list of profiles selected in the search
//

function updateSelection() {
  var selected_profiles = new Array;

  if (isSalesNavigator()) {
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
  } else if (isRecruiter()) {
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
}

function updateSelectionView() {
  if (window.selected_profiles.length > 0) {
    if (window.selected_profiles.length == 1) { s = ""; } else { s = "s"; }

    if ($("#eh_search_selection_popup").length > 0) {
      $("#eh_profile_selected").html('<strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected');
    }
    else {
      var logo = chrome.extension.getURL('shared/img/orange_transparent_logo.png');
      $("body").append('<div id="eh_search_selection_popup"><i class="fa fa-ellipsis-v eh_search_popup_drag"></i><div id="eh_search_popup_close">&times;</div><img src="' + logo + '" alt="Email Hunter"><div id="eh_search_popup_content_container"><div id="eh_profile_selected"><strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected</div><ul id="eh_search_status_list"></ul><button class="orange-btn">Find email addresses & save leads</button><br/><br/><label id="eh_save_without_email_label"><i class="fa fa-square"></i>Save even if the email adress is not found.</label></div><div id="eh_search_popup_error"></div><div id="eh_search_selection_popup_account"><div class="pull-right" id="eh_search_popup_requests"></div><div class="eh_list_select_container"></div></div></div>');

      // Add account information in the search
      addAccountInformationSearch();

      // Display the lists of leads
      appendListSelector();

      // Launch the search
      launchSearchParsing();

      // Update "save without email" option
      saveWithoutEmailListener();

      // Drag popup
      $("#eh_search_selection_popup").draggable({ handle: ".eh_search_popup_drag" });

      // Close popup
      $("#eh_search_popup_close").click(function() {
        closeSearchPopup();
      });
      $(document).keyup(function(e) {
        if (e.keyCode == 27) {
          closeSearchPopup();
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
    closeSearchPopup();
  }

  // Adapt the DOM in Sales Navigator
  adaptSalesNavigatorBody();
}

function closeSearchPopup() {
  $("#eh_search_selection_popup").remove();

  if (isSalesNavigator()) {
    $("#body, .nav-wrapper").css( { "margin-left": "auto" } );
  }
}


// Show account information
//
function addAccountInformationSearch() {
  getAccountInformation(function(json) {
    if (json == "none") {
      $("#eh_search_popup_requests").html('Not logged in. <a target="_blank" href="https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Sign in</a> or <a target="_blank" href="https://emailhunter.co/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_search_popup">Create a free account</a>');
      $("#eh_search_selection_popup button").prop("disabled", true);
      $("#eh_search_selection_popup button").text("Please sign in to save leads");
    }
    else {
      $("#eh_search_popup_requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available));
    }
  })
}


// Finds the domain name of the last experience or returns false
//
function fetchProfileFromSearch(profile_path, callback) {
  $.ajax({
    url : profile_path,
    type : 'GET',
    success : function(response){
      return callback(response);
    },
    error : function() {
      // ERROR
    }
  });
}

// 1. Launch the parsing of profiles and companies
//    (full profile & company website)
//
function launchSearchParsing() {
  $("#eh_search_selection_popup button").click(function() {
    window.number_processed = 0;
    desactivateSearchButton();
    $("#eh_search_status_list li span").text("Loading...");

    window.profile = new Array;
    window.selected_profiles.forEach(function(search_profile, index) {
      parseProfile(search_profile, index);
    });
  })
}

// 2. Parse the profile
//

function parseProfile(search_profile, index) {

  // Fetch and parse the profile
  fetchProfileFromSearch(search_profile["profile_path"], function(response) {
    parseLinkedinProfile(response, function(parsed_profile) {
      window.profile[index] = parsed_profile;
      window.profile[index]["profile_id"] = search_profile["profile_id"];

      if (typeof window.profile[index]["last_company_path"] == "undefined") {
        saveOrNotAndUpdateStatus("Company not found", index);
      }
      else {
        // Visit company page and get the website
        getCompanyPage(window.profile[index], function(company_data) {
          if (company_data == "none") {
            saveOrNotAndUpdateStatus("Website not found", index);
          }
          else {
            window.profile[index]["domain"] = cleanDomain(company_data.website);
            window.profile[index]["company_size"] = company_data.company_size;
            window.profile[index]["company_industry"] = company_data.company_industry;
            findEmailAndSave(index);
          }
        });
      }
    });
  });
}

// 3. Find email addresses and save leads
//
function findEmailAndSave(index) {

  // First we have to find email addresses
  chrome.storage.sync.get('api_key', function(value){
    if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
      api_key = value["api_key"];
    }
    else { api_key = ""; }

    generate_email_endpoint = 'https://api.emailhunter.co/v2/email-finder?domain=' + encodeURIComponent(window.profile[index]["domain"]) + '&first_name=' + encodeURIComponent(window.profile[index]["first_name"]) + '&last_name=' + encodeURIComponent(window.profile[index]["last_name"]) + '&position=' + encodeURIComponent(window.profile[index]["position"]) + '&company=' + encodeURIComponent(window.profile[index]["last_company"]);
    apiCall(api_key, generate_email_endpoint, function(email_json) {

      // If there is no result, we try to remove a subdomain
      if (email_json.data.email == null && withoutSubDomain(window.profile[index]["domain"])) {
        window.profile[index]["domain"] = withoutSubDomain(window.profile[index]["domain"]);
        findEmailAndSave(index);
      }
      else {
        window.profile[index]["email"] = email_json.data.email;
        window.profile[index]["confidence_score"] = email_json.data.score;

        saveOrNotAndUpdateStatus("Email not found", index);
      }
    });
  });
}

// 4. Save or not and update status
//
// fail_status is the error returned if the email address is not found
//
function saveOrNotAndUpdateStatus(fail_status, index) {
  if (window.profile[index]["email"] == null || typeof window.profile[index]["email"] == "undefined") { window.profile[index]["email"] = ""; }
  if (window.profile[index]["confidence_score"] == null || typeof window.profile[index]["confidence_score"] == "undefined") { window.profile[index]["confidence_score"] = ""; }

  if (window.profile[index]["email"] != "") {
    saveLead(window.profile[index], function() {
      $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").html("Saved<i class='fa fa-check'></i>");
      finishStatus();
    });
  }
  else {
    chrome.storage.sync.get('save_leads_without_emails', function(value){
      if (typeof value["save_leads_without_emails"] == "undefined" || value["save_leads_without_emails"] == false) {
        $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").html(fail_status + "<i class='fa fa-times'></i>");
        finishStatus();
      }
      else {
        saveLead(window.profile[index], function() {
          $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").html("Saved without email<i class='fa fa-check'></i>");
          finishStatus();
        });
      }
    });
  }
}


// Update the option to save or not a lead if the email is not found
//
function saveWithoutEmailListener() {
  checkOptionSaveWithoutEmail();

  $("#eh_save_without_email_label").unbind().click(function() {
    checkbox = $(this).find(".fa").first();
    if (checkbox.hasClass("fa-square")) {
      checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
    }
    else {
      checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
    }

    updateOptionSaveWithoutEmail();
  });
}

function updateOptionSaveWithoutEmail() {
  if ($("#eh_save_without_email_label .fa").hasClass("fa-check-square")) {
    chrome.storage.sync.set({'save_leads_without_emails': true}, function() {
      // Now leads can be saved ven if the email addresses are not found
    });
  }
  else {
    chrome.storage.sync.set({'save_leads_without_emails': false}, function() {
      // Leads aren't saved if the email address is not found (default)
    });
  }
}

function checkOptionSaveWithoutEmail() {
  chrome.storage.sync.get('save_leads_without_emails', function(value){
    if (typeof value["save_leads_without_emails"] !== "undefined" && value["save_leads_without_emails"] == true) {
      $("#eh_save_without_email_label .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
    }
  });
}

// Fix for Sales Navigator to avoid the popup to hide the body
//
function adaptSalesNavigatorBody() {
  if (isSalesNavigator()) {
    if (window.selected_profiles.length > 0) {
      $("#body, .nav-wrapper").animate({ "margin-left": "20px" }, 300);
    }
    else {
      $("#body, .nav-wrapper").css( { "margin-left": "auto" } );
    }
  }
}

// View utilities
//

function desactivateSearchButton() {
  $("#eh_search_selection_popup button").prop("disabled", true);
  $("#eh_search_selection_popup button").text("Please wait...");
  $("#eh_search_selection_popup button").prepend("<i class='fa fa-spinner fa-spin'></i>");
}

function activateSearchButton() {
  $("#eh_search_selection_popup button").prop("disabled", false);
  $("#eh_search_selection_popup button").text("Find email addresses & save leads");
}

function finishStatus() {
  window.number_processed ++;

  if (window.number_processed >= window.selected_profiles.length) {
    activateSearchButton();
    addAccountInformationSearch();
  }
}
