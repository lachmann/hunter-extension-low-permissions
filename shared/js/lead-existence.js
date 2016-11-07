LeadExistence = {
  check: function(full_name, fn) {
    Account.getApiKey(function(api_key) {
      if (api_key != '' && full_name != "LinkedIn Member") {
        full_name_array = cleanName(full_name).split(" ");
        first_name = full_name_array[0];
        full_name_array.shift();
        last_name = full_name_array.join(" ");

        $.ajax({
          url : "https://api.hunter.io/v2/leads/exist?first_name=" + first_name + "&last_name=" + last_name + "&api_key=" + api_key,
          headers: { "Email-Hunter-Origin": "chrome_extension" },
          type : 'GET',
          dataType : 'json',
          success : function(json){
            // If we find at least one lead with this name, we return true
            if (json.data.id != null) {
              fn(true);
            }
            else {
              fn(false);
            }
          },
          error: function(xhr) {
            fn(false);
          }
        });
      }
      else {
        fn(false);
      }
    });
  }
}
