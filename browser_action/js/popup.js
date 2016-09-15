//
// Check what's the current domain to display the appropriate content.
//
// - If it's a LinkedIn profile, display information about it
// - If not, do a Domain Search
//
chrome.tabs.getSelected(null, function(tab) {
  window.domain = new URL(tab.url).hostname.replace("www.", "");

  if (window.domain == "linkedin.com") {
    chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {subject: "is_linkedin_profile"}, function(response) {
        if (response.is_linkedin_profile == true) {
          LinkedinProfile.launch();
        }
        else {
          $("#domain-search").show();
          DomainSearch.launch();
        }
      });
    });
  }
  else {
    $("#domain-search").show();
    DomainSearch.launch();
  }
});
