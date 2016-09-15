// Return if we are on a LinkedIn profile or not to the browser popup
//
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.subject == "is_linkedin_profile") {
      if ($(".profile-actions").length) { sendResponse({response: true}); }
      else                              { sendResponse({response: false}); }
    }
  }
);
