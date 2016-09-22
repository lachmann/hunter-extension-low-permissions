LinkedinSearchCheckboxes = {
  launch: function() {
    this_checkboxes = this;

    var counter = 0;
    var readyStateCheckInterval = setInterval(function() {
      Debug.hasMessageBeenDisplayed("linkedin_checkboxes_blocked_date", function(response) {
        if (response == false) {
          this_checkboxes.inject();
          this_checkboxes.injectSelectAll();

          counter++;
          if(counter === 1) {
            // Check if for some reason the button disappeared and notify the
            // user if this is the case.
            //
            if ($(".eh_checkbox_container").length) {
              setTimeout(function() {
                Debug.handleDisappearedCheckboxes();
              }, 500);
            }
          }
        }
      });
    }, 1000);
  },

  inject: function() {
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    if (LinkedinVersion.isSalesNavigator()) {
      // Sales Navigator
      $("#results-list .result").each(function(index) {
        result = $(this);

        // We check if the profile if out of network
        if (result.find(".profile-link").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
          if (result.find(".actions .eh_checkbox_container").length == 0) {
            result.find(".actions").append("\n\
              <div class='eh_checkbox_container' style='margin: 35px 0 0 0; line-height: 17px;'>\n\
                <img class='eh_checkbox_icon' src='" + icon + "'>\n\
                <i class='fa fa-square'></i>\n\
              </div>\n\
            ");
          }
        }
      });

    } else if (LinkedinVersion.isRecruiter()) {
      // TO DO : compatibility with LinkedIn Recruiter
    }
    else {
      // Standard version
      $(".result.people").each(function(index) {
        result = $(this);

        // We check if the profile if out of network
        if (result.find(".result-image").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
          if (result.find(".srp-actions .eh_checkbox_container").length == 0) {
            result.find(".srp-actions").prepend("\n\
              <div class='eh_checkbox_container'>\n\
                <img class='eh_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>\n\
              </div>\n\
            ");
          }
        }
      });
    }

    this.selectProfiles();
  },

  injectSelectAll: function() {
    // If there is at least one checkbox to check and no 'select all' yet
    if ($(".eh_checkbox_container").length && $(".eh_selectall_checkbox_container").length == 0) {
      var icon = chrome.extension.getURL('shared/img/icon48.png');

      if (LinkedinVersion.isSalesNavigator()) {
        // Old Sales Navigator
        $(".spotlights-count-wrapper").prepend("\n\
          <div class='eh_selectall_checkbox_container'>\n\
            <img class='eh_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>Select all\n\
          </div>\n\
        ");

        // New Sales Navigator
        $(".status-container").append("\n\
          <div class='eh_selectall_checkbox_container' style='line-height: 17px; margin: 0 0 0 10px;'>\n\
            <img class='eh_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>\n\
            Select all\n\
          </div>\n\
        ");

      } else if (LinkedinVersion.isRecruiter()) {
        // The integration in search pages is not compatible with
      }
      else {
        $("#results_count").prepend("\n\
          <div class='eh_selectall_checkbox_container'>\n\
            <img class='eh_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>\n\
            Select all\n\
          </div>\n\
        ")
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

        LinkedinSearchPopup.updateSelection();
        LinkedinSearchPopup.updateSelectionView();
      });
    }
  },

  selectProfiles: function() {
    $(".eh_checkbox_container").unbind().click(function() {
      checkbox = $(this).find(".fa").first();
      if (checkbox.hasClass("fa-square")) {
        checkbox.removeClass("fa-square").addClass("fa-check-square").css({ 'color': '#e86240' });
      }
      else {
        checkbox.removeClass("fa-check-square").addClass("fa-square").css({ 'color': '#ddd' });
      }

      LinkedinSearchPopup.updateSelection();
      LinkedinSearchPopup.updateSelectionView();
    });
  }
}


//
// Start JS injection
//
chrome.extension.sendMessage({}, function(response) {
  LinkedinSearchCheckboxes.launch();
});
