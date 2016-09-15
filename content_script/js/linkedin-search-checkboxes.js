LinkedinSearchCheckboxes = {
  launch: function() {
    this_checkboxes = this;

    var readyStateCheckInterval = setInterval(function() {
      this_checkboxes.inject();
      this_checkboxes.injectSelectAll();
    }, 800);
  },

  inject: function() {
    var icon = chrome.extension.getURL('shared/img/icon48.png');

    if (LinkedinVersion.isSalesNavigator()) {
      // Old version of Sales Navigator (still running on some account)
      $(".entity").not(".company-summary-entity").each(function(index) {
        result = $(this);

        // If it's a company or if the profile is out of network
        if (result.find(".name a").attr("href").indexOf("OUT_OF_NETWORK") == -1 && result.find(".name a").attr("href").indexOf("/sales/accounts") == -1) {
          if (result.find(".actions .hio_checkbox_container").length == 0) {
            result.find(".actions").append("\n\
              <div class='hio_checkbox_container' style='margin-top: 7px;'>\n\
                <img class='hio_checkbox_icon' src='" + icon + "'>\n\
                <i class='fa fa-square'></i>\n\
              </div>\n\
            ")
          }
        }
      });

      // New version of Sales Navigator
      $("#results-list .result").each(function(index) {
        result = $(this);

        // We check if the profile if out of network
        if (result.find(".profile-link").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
          if (result.find(".actions .hio_checkbox_container").length == 0) {
            result.find(".actions").append("\n\
              <div class='hio_checkbox_container' style='margin: 35px 0 0 0; line-height: 17px;'>\n\
                <img class='hio_checkbox_icon' src='" + icon + "'>\n\
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
      $(".result.people").each(function(index) {
        result = $(this);

        // We check if the profile if out of network
        if (result.find(".result-image").attr("href").indexOf("OUT_OF_NETWORK") == -1 || (result.find(".degree-icon").length && result.find(".degree-icon").text() != "YOU")) {
          if (result.find(".srp-actions .hio_checkbox_container").length == 0) {
            result.find(".srp-actions").prepend("\n\
              <div class='hio_checkbox_container'>\n\
                <img class='hio_checkbox_icon' src='" + icon + "'><i class='fa fa-square'></i>\n\
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
    if ($(".hio_checkbox_container").length && $(".hio_selectall_checkbox_container").length == 0) {
      var icon = chrome.extension.getURL('shared/img/icon48.png');

      if (LinkedinVersion.isSalesNavigator()) {
        // Old Sales Navigator
        $(".spotlights-count-wrapper").prepend("\n\
          <div class='hio_selectall_checkbox_container'>\n\
            <img class='hio_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>Select all\n\
          </div>\n\
        ");

        // New Sales Navigator
        $(".status-container").append("\n\
          <div class='hio_selectall_checkbox_container' style='line-height: 17px; margin: 0 0 0 10px;'>\n\
            <img class='hio_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>\n\
            Select all\n\
          </div>\n\
        ");

      } else if (LinkedinVersion.isRecruiter()) {
        // The integration in search pages is not compatible with
      }
      else {
        $("#results_count").prepend("\n\
          <div class='hio_selectall_checkbox_container'>\n\
            <img class='hio_checkbox_icon' src='" + icon + "'>\n\
            <i class='fa fa-square'></i>\n\
            Select all\n\
          </div>\n\
        ")
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

        LinkedinSearchPopup.updateSelection();
        LinkedinSearchPopup.updateSelectionView();
      });
    }
  },

  selectProfiles: function() {
    $(".hio_checkbox_container").unbind().click(function() {
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
