// Send a message to Hunter website if the extension is installed
//
chrome.runtime.onMessageExternal.addListener(
function(request, sender, sendResponse) {
  if (request) {
    if (request.message) {
      if (request.message == "version") {
        var manifest = chrome.runtime.getManifest();
        sendResponse({version: manifest.version});
      }
    }
  }
  return true;
});


// Open a tab when it's installed
//

chrome.runtime.onInstalled.addListener(function (object) {
  if (object.reason == "install") {
    chrome.tabs.create({ url: "https://hunter.io/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=new_install" });
  }
});
