// Ajax API call
// Use the API key if it is defined. If there is a limitation issue, show the right limitation message
//
function apiCall(api_key, endpoint, callback) {
  if (api_key != '') {
    api_key_param = '&api_key=' + api_key;
  }
  else if (endpoint.indexOf("email-count") == -1) {
    endpoint = endpoint.replace("https://api.emailhunter.co/v1/", "https://api.emailhunter.co/trial/v1/");
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
        showError('Email Hunter Chrome extension seems not to be associated to your account. Please sign in to continue.<br/><br/><a href="https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Sign in</a>');
      }
      else if (xhr.status == 429) {
        if (api_key != '') {
          showError('You\'ve reached your monthly quota. Please upgrade your account to continue using Email Hunter.<br/><br/><a href="https://emailhunter.co/subscription?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Upgrade my account</a>');
        }
        else {
          showError('You\'ve reached your daily limit, please connect to your Email Hunter account to continue. It\'s free and takes 30 seconds.<br/><br/><a href="https://emailhunter.co/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="orange-btn" target="_blank">Create a free account</a><a href="https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" class="eh_popup_signin_link" target="_blank">Sign in</a>');
        }
      }
      else {
        showError('Sorry, something went wrong. Please try again later.');
      }
    }
  });
}


// Save lead in Ajax
//
function saveLead(lead, callback) {
  chrome.storage.sync.get('api_key', function(value) {
    if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
      api_key = value["api_key"];
    }
    else { api_key = ""; }

    $.ajax({
      url : "https://api.emailhunter.co/v1/lead?first_name="+ encodeURI(lead["first_name"]) + "&last_name=" + encodeURI(lead["last_name"]) + "&company=" + encodeURI(lead["last_company"]) + "&company_industry=" + encodeURI(lead["company_industry"]) + "&company_size=" + encodeURI(lead["company_size"]) + "&position=" + encodeURI(lead["position"]) + "&country_code=" + encodeURI(lead["country_code"]) + "&email=" + encodeURI(lead["email"]) + "&confidence_score=" + encodeURI(lead["confidence_score"]) + "&website=http://" + encodeURI(lead["domain"]) + "&source=Email Hunter (LinkedIn)&linkedin_url=" + encodeURI(lead["linkedin_url"]) + "&api_key=" + api_key,
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
        else {
          callback("error");
        }
      }
    });
  });
}
