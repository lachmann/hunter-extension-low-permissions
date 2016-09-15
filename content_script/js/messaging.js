// Return if we are on a LinkedIn profile or not to the browser popup
//
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

    // Return if it's a profile or not
    if (request.subject == "is_linkedin_profile") {
      if ($(".profile-actions").length) { sendResponse({is_linkedin_profile: true}); }
      else                              { sendResponse({is_linkedin_profile: false}); }
    }

    // Return the parsed current profile
    if (request.subject == "get_linkedin_profile") {
      sendResponse(Object.assign({}, window.profile));
    }

    // Return the parsed company of the last experience
    if (request.subject == "get_company_page") {
      LinkedinCompany.get(request.profile, function(company) {
        sendResponse(company);
      });

      return true;
    }
  }
);
