var ListSelection = {
  appendSelector: function() {
    this_list_selection = this;

    this_list_selection.getLeadsLists(function(json) {
      if (json != "none") {
        $(".ehunter_list_select_container").html('<select class="ehunter_list_select"></select>');

        chrome.storage.sync.get('current_leads_list_id', function(value) {
          jQuery.each(json.data.leads_lists, function(i, val) {
            if (value.current_leads_list_id == val.id) { selected = 'selected="selected"' }
            else { selected = '' }
            $(".ehunter_list_select").append("<option " + selected +" value='" + val.id + "'>" + val.name + "</option>")
          });

          $(".ehunter_list_select").append("<option value='new_list'>Create a new list...</option>")
        });

        this_list_selection.updateCurrent();
      }
    });
  },

  updateCurrent: function() {
    $(".ehunter_list_select").on("change", function(){
      if ($(this).val() == "new_list") {
        openInNewTab("https://hunter.io/leads_lists/new?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension")
      }
      else {
        chrome.storage.sync.set({'current_leads_list_id': $(this).val()});
      }
    });
  },

  getLeadsLists: function(callback) {
    Account.getApiKey(function(api_key) {
      if (api_key != '') {
        url = "https://api.hunter.io/v2/leads_lists?api_key=" + api_key;
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
