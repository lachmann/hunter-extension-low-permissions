var ListSelection = {
  appendSelector: function() {
    this_list_selection = this;

    this_list_selection.getLeadsLists(function(json) {
      if (json != "none") {
        $(".eh_list_select_container").html('<select class="eh_list_select"></select>');

        chrome.storage.sync.get('current_leads_list_id', function(value) {
          jQuery.each(json.data.leads_lists, function(i, val) {
            if (value['current_leads_list_id'] == val.id) { selected = 'selected="selected"' }
            else { selected = '' }
            $(".eh_list_select").append("<option " + selected +" value='" + val.id + "'>" + val.name + "</option>")
          });

          $(".eh_list_select").append("<option value='new_list'>Create a new list...</option>")
        });

        this_list_selection.updateCurrent();
      }
    });
  },

  updateCurrent: function() {
    $(".eh_list_select").on("change", function(){
      if ($(this).val() == "new_list") {
        openInNewTab("https://emailhunter.co/leads_lists/new?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension")
      }
      else {
        chrome.storage.sync.set({'current_leads_list_id': $(this).val()});
      }
    });
  },

  getLeadsLists: function(callback) {
    chrome.storage.sync.get('api_key', function(value){
      if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
        url = "https://api.emailhunter.co/v2/leads_lists?api_key="+value["api_key"];
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
  }
}
