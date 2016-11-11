// Every time a user make a successful search, we count it in Chrome local storage.
// This is used to display a notification to rate the extension or give feedback.
//

function countCall() {
  chrome.storage.sync.get({ 'calls_count': 1 }, function(value){
    value.calls_count++;
    chrome.storage.sync.set({ 'calls_count': value.calls_count });
  });
}
