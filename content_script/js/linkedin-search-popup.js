//
// Update the list of profiles selected in the search
//

function updateSelection() {
  var selected_profiles = new Array;

  $(".result.people").each(function(index) {
    //console.log($(this).find(".fa-check-square").length);
    if($(this).find(".fa-check-square").length) {
      profile_path = $(this).find(".title").attr("href");
      selected_profiles.push(profile_path);
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
      $("body").append('<div id="eh_search_selection_popup"><i class="fa fa-ellipsis-v eh_search_popup_drag"></i><div id="eh_search_popup_close">&times;</div><img src="' + logo + '" alt="Email Hunter"><div id="eh_profile_selected"><strong>' + window.selected_profiles.length + ' profile' + s + '</strong> selected</div><button class="orange-btn">Find email addresses & save leads</button></div>');

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
    $(this).prop "disabled", true
    window.profile = new Array;

    window.selected_profiles.forEach(function(profile_path, index) {

      // Fetch and parse the profile
      fetchProfileFromSearch(profile_path, function(response) {
        parseLinkedinProfile(response, function(profile) {
          window.profile[index] = profile;

          // Visit company page and get the website
          getWebsite(window.profile[index], function(website) {
            console.log(window.profile[index]);
            window.profile[index]["domain"] = cleanDomain(website);
            findEmailAndSave(index);
          });
        });
      });
    });
  })
}

// 2. Find email addresses and save leads
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
      saveLead(email_json.email, window.profile[index], api_key, function() {
        console.log(email_json.email + " saved in leads!");
      });
    });
  });
}
