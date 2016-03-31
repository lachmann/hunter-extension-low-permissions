//
// Inject Email Hunter checkboxes in the search
//
function injectLinkedinCheckboxes() {
  $(".result.people").each(function(index) {
    result = $(this);
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    // We check if the profile if out of network
    if (result.find(".result-image").attr("href").slice(-14) != "OUT_OF_NETWORK") {
      result.find(".srp-actions").append("<div class='eh_checkbox_container'><img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>");

      selectProfiles();
    }
  });
}


//
// Select a a profile to add to the list
//

function selectProfiles() {
  $(".eh_checkbox_container").click(function() {
    checkbox = $(this).find(".fa");
    if (checkbox.hasClass("fa-square")) {
      checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
    }
    else {
      checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
    }
    updateSelection();
  });
}

function updateSelection() {

}


//
// Start JS injection
//
chrome.extension.sendMessage({}, function(response) {
  checkResultPageLoading();
});


function checkResultPageLoading() {
  var readyStateCheckInterval = setInterval(function() {
    if (isSearchLoaded()) {
      clearInterval(readyStateCheckInterval);
      launchEmailHunterOnSearch();
    }
  }, 20);
}


//
// Inject the button and start parsing
//
function launchEmailHunterOnSearch() {
  injectLinkedinCheckboxes();

  $(".pagination a").click(function() {
    checkResultPageLoading();
  });
}


//
// Check if the search page is displayed
// Ok if there is no loader & profile are displayed
//
function isSearchLoaded() {
  if ($(".result.people").length && $("#voltron-overlay").css('position') != 'absolute') {
    return true;
  }
}
