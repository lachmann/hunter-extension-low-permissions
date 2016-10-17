var Account = {
  get: function getAccountInformation(callback) {
    chrome.storage.sync.get('api_key', function(value){
      if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
        url = "https://api.hunter.io/v2/account?api_key="+value["api_key"];
        $.ajax({
          url : url,
          type : 'GET',
          dataType : 'json',
          success : function(json){
            return callback(json);
          }
        });
      }
      else {
        callback("none");
      }
    });
  },

  setApiKey: function(api_key) {
    chrome.storage.sync.set({'api_key': api_key}, function() {
      console.log("Hunter extension successfully installed.");
    });
  },

  getApiKey: function(callback) {
    chrome.storage.sync.get('api_key', function(value){
      if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") { api_key = value["api_key"]; }
      else { api_key = ''; }

      callback(api_key)
    });
  }
}
