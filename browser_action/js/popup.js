//
// Check what's the current domain to display the appropriate content.
//
// - If it's a LinkedIn profile, display information about it
// - If not, do a Domain Search
//
chrome.tabs.getSelected(null, function(tab) {
  window.domain = new URL(tab.url).hostname.replace("www.", "");

  if (window.domain == "linkedin.com") {
    // We ask the content script if it's a profile or not
    // chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    //   console.log(response);
    // });
    chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {subject: "is_linkedin_profile"}, function(response) {
        console.log(response);
      });
    });
  }
  else {
    $("#domain-search").show();
    DomainSearchPopup.launch();
  }
});
