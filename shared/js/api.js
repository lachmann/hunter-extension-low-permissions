// Does an API call on Email Hunter's API. This function is used to do the 3
// main requests possible on Email Hunter:
//
// Domain Search    https://hunter.io/api/v2/docs#domain-search
// Email Finder     https://hunter.io/api/v2/docs#email-finder
// Email Verifier   https://hunter.io/api/v2/docs#email-verifier
//
function apiCall(api_key, endpoint, callback) {
  if (api_key != '') {
    api_key_param = '&api_key=' + api_key;
  }
  else if (endpoint.indexOf("email-count") == -1) {
    endpoint = endpoint.replace("https://api.hunter.io/v2/", "https://api.hunter.io/trial/v2/");
    api_key_param = '';
  } else {
    api_key_param = '';
  }

  $.ajax({
    url : endpoint + api_key_param,
    headers: {"Email-Hunter-Origin": "chrome_extension"},
    type : 'GET',
    dataType : 'json',
    success : function(json){
      callback(json);
    },
    error: function(xhr) {
      if (xhr.status == 400) {
        showError('Sorry, something went wrong on the query.');
      }
      else if (xhr.status == 401) {
        showError('Email Hunter Chrome extension seems not to be associated to your account. Please sign in to continue.<br/><br/><a href="https://hunter.io/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Sign in</a>');
      }
      else if (xhr.status == 429) {
        if (api_key != '') {
          showError('You\'ve reached your monthly quota. Please upgrade your account to continue using Email Hunter.<br/><br/><a href="https://hunter.io/subscription?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Upgrade my account</a>');
        }
        else {
          showError('You\'ve reached your daily limit, please connect to your Email Hunter account to continue. It\'s free and takes 30 seconds.<br/><br/><a href="https://hunter.io/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Create a free account</a><a href="https://hunter.io/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="ehunter_popup_signin_link" target="_blank">Sign in</a>');
        }
      }
      else {
        showError('Sorry, something went wrong. Please try again later.');
      }
    }
  });
}


// Save a lead in Email Hunter
//
// Documentation: https://hunter.io/api/v2/docs#create-lead
//
function saveLead(lead, callback) {
  chrome.storage.sync.get('api_key', function(value) {
    if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
      api_key = value["api_key"];
    }
    else { api_key = ""; }

    chrome.storage.sync.get('current_leads_list_id', function(value) {
      if (typeof value["current_leads_list_id"] !== "undefined" && value["current_leads_list_id"] !== "") {
        leads_list_id = value["current_leads_list_id"];
      }
      else { leads_list_id = ""; }

      $.ajax({
        url : "https://api.hunter.io/v2/leads?first_name="+ encodeURIComponent(lead["first_name"]) + "&last_name=" + encodeURIComponent(lead["last_name"]) + "&company=" + encodeURIComponent(lead["last_company"]) + "&company_industry=" + encodeURIComponent(lead["company_industry"]) + "&company_size=" + encodeURIComponent(lead["company_size"]) + "&position=" + encodeURIComponent(lead["position"]) + "&country_code=" + encodeURIComponent(lead["country_code"]) + "&email=" + encodeURIComponent(lead["email"]) + "&confidence_score=" + encodeURIComponent(lead["confidence_score"]) + "&website=http://" + encodeURIComponent(lead["domain"]) + "&source=Email Hunter (LinkedIn)&linkedin_url=" + encodeURIComponent(lead["linkedin_url"]) + "&leads_list_id=" + leads_list_id + "&api_key=" + api_key,
        headers: {"Email-Hunter-Origin": "chrome_extension"},
        type : 'POST',
        dataType : 'json',
        success : function(json){
          callback(json);
        },
        error: function(xhr) {
          if (xhr.status == 401) {
            callback("please_sign_in");
          }
          else if (xhr.status == 422 && xhr.responseJSON.errors[0].id == "duplicated_entry") {
            callback("duplicated_entry");
          }
          else {
            callback("error");
          }
        }
      });
    });
  });
}
