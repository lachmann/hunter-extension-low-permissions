// Communicate with the browser popup to detect when we are on a profile or on
// search pages in LinkedIn and to send the data necessary to find the email
// addresses.
//
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

    // Return the type of page we are on on LinkedIn
    if (request.subject == "linkedin_page_type") {
      if ($(".profile-actions").length) {
        sendResponse({linkedin_page_type: "profile"});
      }
      else if ($("#results-list .result").length || $(".result.people").length) {
        sendResponse({linkedin_page_type: "search"});
      }
      else {
        sendResponse({linkedin_page_type: "other"});
      }
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

    // Return the profiles available in the search
    if (request.subject == "get_linkedin_search_results") {
      LinkedInSearchResults.parse($("html").html(), function(response){
        sendResponse(response);
      });

      return true;
    }

    // Return the profiles available in the search
    if (request.subject == "get_linkedin_search_results") {
      LinkedInSearchResults.parse($("html").html(), function(response){
        sendResponse(response);
      });

      return true;
    }

    // Fetch the profiles selected in the search and saved it
    if (request.subject == "get_selected_linkedin_profile") {
      LinkedinSearchSave.launch(request.profile, function(is_saved, status, id) {
        sendResponse({ "is_saved": is_saved, "status": status, "id": id });
      });

      return true;
    }
  }
);
