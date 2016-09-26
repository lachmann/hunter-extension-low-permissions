//
// Check what's the current domain to display the appropriate content.
//
// - If it's a LinkedIn profile, display information about it
// - If it's a LinkedIn search page, allow to save leads from it
// - In other cases, do a Domain Search
//
chrome.tabs.getSelected(null, function(tab) {
  window.domain = new URL(tab.url).hostname.replace("www.", "");

  if (window.domain == "linkedin.com") {
    chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {subject: "linkedin_page_type"}, function(response) {
        if (typeof response != "undefined" && response.linkedin_page_type == "profile") {
          LinkedinProfile.launch();
        }
        else if (typeof response != "undefined" && response.linkedin_page_type == "search")  {
          LinkedinSearch.launch();
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
