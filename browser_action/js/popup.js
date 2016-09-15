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
  }
  else {
    DomainSearchPopup.launch();
  }
});
