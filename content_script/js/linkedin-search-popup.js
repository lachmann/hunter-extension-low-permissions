//
// Update the list of profiles selected in the search
//

function updateSelection() {
  var selected_profiles = new Array;

  $(".result.people").each(function(index) {
    if($(this).find(".fa-check-square").length) {
      profile_path = $(this).find(".title").attr("href");
      profile_name = $(this).find(".title").html();
      profile_id = $(this).attr("data-li-entity-id");
      selected_profiles.push({ "profile_path":  profile_path,
                               "profile_name": profile_name,
                               "profile_id": profile_id });
    }
  });

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
      $("body").append('<div id="eh_search_selection_popup"><i class="fa fa-ellipsis-v eh_search_popup_drag"></i><div id="eh_search_popup_close">&times;</div><img src="' + logo + '" alt="Email Hunter"><div id="eh_profile_selected"><strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected</div><ul id="eh_search_status_list"></ul><button class="orange-btn">Find email addresses & save leads</button></div>');

      // Launch the search
      launchSearchParsing();

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
}

function closeSearchPopup() {
  $("#eh_search_selection_popup").remove();
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
        $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").text("No current job");
        finishStatus();
      }
      else {
        // Visit company page and get the website
        getWebsite(window.profile[index], function(website) {
          if (website == "none") {
            $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").text("Website not found");
            finishStatus();
          }
          else {
            window.profile[index]["domain"] = cleanDomain(website);
            findEmailAndSave(index);

            console.log(window.profile);
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
    else { api_key = ''; }

    generate_email_endpoint = 'https://api.emailhunter.co/v1/generate?domain=' + window.profile[index]["domain"] + '&first_name=' + window.profile[index]["first_name"] + '&last_name=' + window.profile[index]["last_name"] + '&position=' + window.profile[index]["position"] + '&company=' + window.profile[index]["last_company"];
    apiCall(api_key, generate_email_endpoint, function(email_json) {

      if (email_json.email == null) {
        email = "";
        email_message = "without email";
      } else {
        email = email_json.email;
        email_message = "with email";
      }

      // Then we can save it in leads (with or without email address)
      saveLead(email, window.profile[index], api_key, function() {
        console.log(email_json.email + " saved in leads!");
        $("#eh_search_status_list li[data-profile-id='" + window.profile[index]["profile_id"] + "'] span").text("Saved " + email_message);
        finishStatus();
      });
    });
  });
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

  //console.log(number_processed + " / " + window.selected_profiles.length);
  if (window.number_processed >= window.selected_profiles.length) {
    activateSearchButton();
  }
}
