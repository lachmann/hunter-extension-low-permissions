// Send anonymously the domains visited to help Hunter identify the most
// popular websites and improve the relevance of its data.
//
function sendTabDomain() {
  // First, we check if we're authorized by the user to collect this data.
  chrome.storage.sync.get({
    trackDomain: true
  }, function(item) {
    if (item.trackDomain == true) {
      chrome.tabs.query(
        {currentWindow: true, active : true},
        function(tabArray){
          getGuid(function(guid) {
            domain = url_domain(tabArray[0]["url"]);
            pingDomain(domain, guid);
          });
        }
      );
    }
  });
}

// Get a unique ID. If it doesn't exists, generate it. This allows to
// differenciate recurring visits from new visits.
//
function getGuid(fn) {
  chrome.storage.sync.get("guid", function(value){
    if (typeof value["guid"] != "undefined") {
      fn(value["guid"]);
    }
    else {
      guid = randomString();
      chrome.storage.sync.set({'guid': guid });
      fn(guid);
    }
  });
}

function randomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i=0; i < 25; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function pingDomain(domain, guid) {
  $.ajax({
    url : 'https://webstats.hunter.io/webstats/visit?domain='+domain+'&guid='+guid,
    type : 'GET',
    success : function(){
      console.log(domain);
    },
    error : function() {

    }
  });
}

// When an URL changes
//
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  sendTabDomain();
});
