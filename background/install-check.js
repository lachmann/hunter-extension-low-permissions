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

// Open another tab when it's uninstalled
//
chrome.runtime.setUninstallURL("https://hunter.io/chrome/uninstall?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=uninstall");
