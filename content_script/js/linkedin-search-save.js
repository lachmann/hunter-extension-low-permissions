var LinkedinSearchSave = {

  //
  // Input: a non-parsed profile array including the profile path
  // Output:
  // - If it has been saved or not
  // - The status to show to the user
  // - The ID of the profile processed
  //

  launch: function(search_profile, fn) {
    this_search = this;

    // 1. We fetch and parse the profile
    //
    this_search.fetchProfile(search_profile["profile_path"], function(response) {
      LinkedinProfile.parse(response, function(parsed_profile) {
        parsed_profile["profile_id"] = search_profile["profile_id"];

        // If we don't have the last experience, we stop
        if (typeof parsed_profile["last_company_id"] == "undefined") {
          this_search.saveAndReturnStatus("no_company_found", parsed_profile, function(is_saved, status, id) { fn(is_saved, status, id) });
        }
        else {
          // 2. We find the email address
          //
          this_search.findEmailAddress(parsed_profile, function(parsed_profile) {
            if (parsed_profile["email"] == null) {
              this_search.saveAndReturnStatus("email_not_found", parsed_profile, function(is_saved, status, id) { fn(is_saved, status, id) });
            }
            else {
              this_search.saveAndReturnStatus("email_found", parsed_profile, function(is_saved, status, id) { fn(is_saved, status, id) });
            }
          });
        }
      });
    });
  },

  saveAndReturnStatus: function(error_id, profile, fn) {
    if (typeof profile["email"] != "undefined" && profile["email"] != null) {
      saveLead(profile, function(response) {
        if (response == "please_sign_in") { fn(false, "Please sign in", profile["profile_id"]); }
        else if (response == "duplicated_entry") { fn(false, "Already saved", profile["profile_id"]); }
        else if (response == "error") { fn(false, "Error", profile["profile_id"]); }
        else { fn(true, "Saved", profile["profile_id"]); }
      });
    }
    else {
      profile["email"] = "";
      profile["confidence_score"] = "";
      chrome.storage.sync.get('save_leads_without_emails', function(value){
        if (typeof value["save_leads_without_emails"] == "undefined" || value["save_leads_without_emails"] == false) {
          fn(false, "Email not found", profile["profile_id"]);
        }
        // If the user wants to save leads even without email address found
        else {
          saveLead(profile, function(response) {
            if (response == "please_sign_in") { fn(false, "Please sign in", profile["profile_id"]); }
            else if (response == "duplicated_entry") { fn(false, "Already saved", profile["profile_id"]); }
            else if (response == "error") { fn(false, "Error", profile["profile_id"]); }
            else { fn(true, "Saved", profile["profile_id"]); }
          });
        }
      });
    }
  },

  findEmailAddress: function(parsed_profile, fn) {
    this_search = this;

    // First we have to find email addresses
    Account.getApiKey(function(api_key) {

      if (typeof parsed_profile["domain"] !== "undefined") {
        company_param = 'domain=' + encodeURIComponent(parsed_profile["domain"]);
      }
      else if (typeof parsed_profile["last_company_id"] !== "undefined") {
        company_param = 'linkedin_id=' + encodeURIComponent(parsed_profile["last_company_id"]);
      }

      if (typeof company_param !== "undefined") {

        generate_email_endpoint = 'https://api.hunter.io/v2/email-finder?linkedin_id=' + encodeURIComponent(parsed_profile["last_company_id"]) + '&first_name=' + encodeURIComponent(parsed_profile["first_name"]) + '&last_name=' + encodeURIComponent(parsed_profile["last_name"]) + '&position=' + encodeURIComponent(parsed_profile["position"]) + '&company=' + encodeURIComponent(parsed_profile["last_company"]);
        apiCall(api_key, generate_email_endpoint, function(email_json) {

          if (email_json.data.domain != null) {
            parsed_profile["domain"] = email_json.data.domain;

            // If there is no result, we try to remove a subdomain
            if (email_json.data.email == null && withoutSubDomain(parsed_profile["domain"])) {
              parsed_profile["domain"] = withoutSubDomain(parsed_profile["domain"]);
              this_search.findEmailAddress(parsed_profile, function(parsed_profile) {
                fn(parsed_profile);
              });
            }
            else {
              parsed_profile["email"] = email_json.data.email;
              parsed_profile["confidence_score"] = email_json.data.score;

              fn(parsed_profile);
            }
          }
          else {
            fn(parsed_profile);
          }
        });
      }
    });
  },


  fetchProfile: function(profile_path, callback) {
    // We force HTTPS (it can happen the links to profiles are in HTTP)
    profile_path = profile_path.replace("http://", "https://");

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
  }
}
