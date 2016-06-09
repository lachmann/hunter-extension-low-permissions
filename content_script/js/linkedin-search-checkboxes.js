//
// Inject Email Hunter checkboxes in the search
//
function injectLinkedinCheckboxes() {
  var icon = chrome.extension.getURL('shared/img/icon48.png');

  if (isSalesNavigator()) {
    $(".entity").not(".company-summary-entity").each(function(index) {
      result = $(this);

      // We check if the profile if out of network
      if (result.find(".name a").attr("href").indexOf("OUT_OF_NETWORK") == -1) {
        result.find(".actions").append("<div class='eh_checkbox_container' style='margin-top: 7px;'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>")
      }
    });
  } else if (isRecruiter()) {
    // TO DO : compatibility with LinkedIn Recruiter
  }
  else {
    $(".result.people").each(function(index) {
      result = $(this);

      // We check if the profile if out of network
      if (result.find(".result-image").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
        result.find(".srp-actions").prepend("<div class='eh_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>");
      }
    });
  }

  selectProfiles();
}

//
// Add a "select all" checkbox
//
function selectAllCheckbox() {
  // If there is at least one checkbox to check
  if ($(".eh_checkbox_container").length) {
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    if ($(".eh_selectall_checkbox_container").length == 0) {
      if (isSalesNavigator()) {
        $(".spotlights-count-wrapper").prepend("<div class='eh_selectall_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>")
      } else if (isRecruiter()) {
        // TO DO : compatibility with LinkedIn Recruiter
      }
      else {
        $("#results_count").prepend("<div class='eh_selectall_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>")
      }
    }

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
  chrome.storage.sync.get("linkedin_search_desactivated", function(value){
    if (value["linkedin_search_desactivated"] != true) {
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
  if (isSalesNavigator() && $(".search-loader").length > 0) {
    return true;
  }
  else if ($("#voltron-overlay").css('position') == 'absolute') {
    return true;
  }
  else {
    return false;
  }
}
