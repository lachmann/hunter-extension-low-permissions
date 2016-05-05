//
// Inject Email Hunter checkboxes in the search
//
function injectLinkedinCheckboxes() {
  $(".result.people").each(function(index) {
    result = $(this);
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    // We check if the profile if out of network
    if (result.find(".result-image").attr("href").slice(-14) != "OUT_OF_NETWORK" || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
      result.find(".srp-actions").prepend("<div class='eh_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>");

      selectProfiles();
    }
  });
}

//
// Add a "select all" checkbox
//
function selectAllCheckbox() {
  if ($(".eh_checkbox_container").length) {
    var icon = chrome.extension.getURL('shared/img/icon48.png');
    $("#results_count").prepend("<div class='eh_selectall_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>")

    $(".eh_selectall_checkbox_container").click(function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
        $(".eh_checkbox_container .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
        $(".eh_checkbox_container .fa").removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      updateSelection();
      updateSelectionView();
    });
  }
}

//
// Select a profile to add to the list
//
function selectProfiles() {
  $(".eh_checkbox_container").unbind().click(function() {
    checkbox = $(this).find(".fa").first();
    if (checkbox.hasClass("fa-square")) {
      checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
    }
    else {
      checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
    }

    updateSelection();
    updateSelectionView();
  });
}


//
// Start JS injection
//
chrome.extension.sendMessage({}, function(response) {
  chrome.storage.sync.get("linkedin_profiles_desactivated", function(value){
    if (value["linkedin_profiles_desactivated"] != true) {
      checkResultPageLoadingEnd();
    }
  });
});


//
// Listen when the search page is finally loaded
//
function checkResultPageLoadingEnd() {
  var readyStateCheckInterval = setInterval(function() {
    if (isSearchLoading() == false) {
      clearInterval(readyStateCheckInterval);
      checkResultPageLoadingStart();
    }
  }, 100);
}


//
// Inject the checkboxes and listen if the search is about to be loaded again
//
function checkResultPageLoadingStart() {
  injectLinkedinCheckboxes();
  selectAllCheckbox();
  closeSearchPopup();

  var readyStateCheckInterval = setInterval(function() {
    if (isSearchLoading()) {
      clearInterval(readyStateCheckInterval);

      updateSelection();
      updateSelectionView();
      checkResultPageLoadingEnd();
    }
  }, 100);
}


//
// Check if the search page is displayed
// Ok if there is no loader & profile are displayed
//
function isSearchLoading() {
  if ($("#voltron-overlay").css('position') == 'absolute') {
    return true;
  }
  else {
    return false;
  }
}
