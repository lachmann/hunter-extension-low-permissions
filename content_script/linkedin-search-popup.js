//
// Update the list of profiles selected in the search
//

function updateSelection() {
  var selected_profiles = new Array;

  $(".result.people").each(function(index) {
    //console.log($(this).find(".fa-check-square").length);
    if($(this).find(".fa-check-square").length) {
      profile_path = $(this).find(".title").attr("href");
      selected_profiles.push(profile_path);
    }
  });

  window.selected_profiles = selected_profiles;
}

function updateSelectionView() {
  if (window.selected_profiles.length > 0) {
    if ($("#eh_search_selection_popup").length > 0) {
      $("#eh_search_selection_popup").html(window.selected_profiles.length + ' profiles selected');
    }
    else {
      $("body").append('<div id="eh_search_selection_popup">' + window.selected_profiles.length + ' profiles selected</div>');
    }
  }
  else {
    $("#eh_search_selection_popup").remove();
  }
}
