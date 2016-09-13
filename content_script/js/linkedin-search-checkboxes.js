//
// Inject Email Hunter checkboxes in the search
//
function injectLinkedinCheckboxes() {
  var icon = chrome.extension.getURL('shared/img/icon48.png');

  if (isSalesNavigator()) {
    // Old version of Sales Navigator (still running on some account)
    $(".entity").not(".company-summary-entity").each(function(index) {
      result = $(this);

      // If it's a company or if the profile is out of network
      if (result.find(".name a").attr("href").indexOf("OUT_OF_NETWORK") == -1 && result.find(".name a").attr("href").indexOf("/sales/accounts") == -1) {
        if (result.find(".actions .hio_checkbox_container").length == 0) {
          result.find(".actions").append("<div class='hio_checkbox_container' style='margin-top: 7px;'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>")
        }
      }
    });

    // New version of Sales Navigator
    $("#results-list .result").each(function(index) {
      result = $(this);

      // We check if the profile if out of network
      if (result.find(".profile-link").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
        if (result.find(".actions .hio_checkbox_container").length == 0) {
          result.find(".actions").append("<div class='hio_checkbox_container' style='margin: 35px 0 0 0; line-height: 17px;'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>");
        }
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
        if (result.find(".srp-actions .hio_checkbox_container").length == 0) {
          result.find(".srp-actions").prepend("<div class='hio_checkbox_container'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i></div>");
        }
      }
    });
  }

  selectProfiles();
}

//
// Add a "select all" checkbox
//
function injectSelectAllCheckbox() {
  // If there is at least one checkbox to check and no 'select all' yet
  if ($(".hio_checkbox_container").length && $(".hio_selectall_checkbox_container").length == 0) {
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    if (isSalesNavigator()) {
      // Old Sales Navigator
      $(".spotlights-count-wrapper").prepend("<div class='hio_selectall_checkbox_container'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>");

      // New Sales Navigator
      $(".status-container").append("<div class='hio_selectall_checkbox_container' style='line-height: 17px; margin: 0 0 0 10px;'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>");
    } else if (isRecruiter()) {
      // TO DO : compatibility with LinkedIn Recruiter
    }
    else {
      $("#results_count").prepend("<div class='hio_selectall_checkbox_container'><img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>Select all</div>")
    }

    $(".hio_selectall_checkbox_container").click(function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
        $(".hio_checkbox_container .fa").removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
        $(".hio_checkbox_container .fa").removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
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
  $(".hio_checkbox_container").unbind().click(function() {
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
  injectCheckboxes();
});


//
// Inject the checkboxes
//
function injectCheckboxes() {
  var readyStateCheckInterval = setInterval(function() {
    injectLinkedinCheckboxes();
    injectSelectAllCheckbox();
  }, 800);
}
