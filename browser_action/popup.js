// Verify the API key and launch the popup search
//
chrome.tabs.getSelected(null, function(tab) {
  window.domain = new URL(tab.url).hostname.replace("www.", "");
  $("#currentDomain").text(window.domain);
  $("#completeSearch").attr("href", "https://emailhunter.co/search/" + window.domain + "?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup");

  // Alternative search
  withoutSudomainLink();

  launchSearch();
  feedbackNotification();
  linkedinNotification();

  // Get account information
  addAccountInformation();

  // Analytics
  eventTrack("Open browser popup");
});


// Suggest to search without subdomain
//
function withoutSudomainLink() {
  if (withoutSubDomain(window.domain)) {
    $("#currentDomain").append("<span class='new-domain-link' title='Search just \"" + newdomain + "\"'>" + newdomain + "</a>");
    $(".new-domain-link").click(function() {
      newSearch(newdomain);
    });
  }
}


// Start a new search with a new domain
//
function newSearch(domain) {
  window.domain = domain;

  $("#currentDomain").text(window.domain);
  $("#completeSearch").attr("href", "https://emailhunter.co/search/" + window.domain + "?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup");
  $(".loader").show();
  $("#resultsNumber").text("");

  $(".result").remove();
  $(".see_more").remove();

  launchSearch();
}


// Launch domain search
//
function launchSearch() {
  chrome.storage.sync.get('api_key', function(value){
    if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
      loadResults(value["api_key"]);
    }
    else {
      loadResults();
    }
  });
}


// Load the email addresses search of the current domain
//
function loadResults(api_key) {

  if (typeof api_key == "undefined") {
    url = 'https://api.emailhunter.co/trial/v2/domain-search?domain=' + window.domain;
  }
  else {
    url = 'https://api.emailhunter.co/v2/domain-search?domain=' + window.domain + '&api_key=' + api_key;
  }

  $.ajax({
    url : url,
    headers: {"Email-Hunter-Origin": "chrome_extension"},
    type : 'GET',
    dataType : 'json',
    success : function(json){
      $(".results").slideDown(300);
      resultsMessage(json.meta.results);
      $(".loader").hide();

      // We count call to measure use
      countCall();

      // Update the number of requests
      addAccountInformation();

      // We display the email pattern
      if (json.data.pattern != null) {
        $("#domain-pattern").html("Most common pattern: <strong>" + addPatternTitle(json.data.pattern) + "@" + domain + "</strong></span>");
      }

      // Each email
      $.each(json.data.emails.slice(0,10), function(email_key, email_val) {

        if (email_val.confidence < 30) { confidence_score_class = "low-score"; }
        else if (email_val.confidence > 70) { confidence_score_class = "high-score"; }
        else { confidence_score_class = "average-score"; }

        $(".results").append('<div class="result"><p class="sources-link light-grey">' + sourcesText(email_val.sources.length) + '<i class="fa fa-caret-down"></i></p><div class="email-address"><div class="email">' + email_val.value + '</div><div class="score ' + confidence_score_class + '" data-toggle="tooltip" data-placement="top" data-original-title="Confidence score: ' + email_val.confidence + '%"></div><span class="verify_email" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verify"><i class="fa fa-check"></i></span><span class="verification_result"></span></div><div class="sources-list"></div></div>');
        $('[data-toggle="tooltip"]').tooltip();

        // Each source
        $.each(email_val.sources, function(source_key, source_val) {

          if (source_val.uri.length > 60) { show_link = source_val.uri.substring(0, 50) + "..."; }
          else { show_link = source_val.uri; }

          $(".sources-list").last().append('<div class="source"><a href="' + source_val.uri + '" target="_blank">' + show_link + '</a></div>');
        });
      });

      if (json.meta.results > 10) {
        remaining_results = json.meta.results - 10;
        $(".results").append('<a class="see_more" target="_blank" href="https://emailhunter.co/search/' + window.domain + '?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup">See all the email addresses (' + numberWithCommas(remaining_results) + ' more)</a>');
      }

      // Complete Search button
      if (json.meta.results > 0) {
        $("#completeSearch").fadeIn();
      }

      // Verify an email address
      verifyEmailAddress();

      // Deploy sources
      $(".sources-link").click(function () {
        if ($(this).parent().find(".sources-list").is(":visible")) {
          $(this).parent().find(".sources-list").slideUp(300);
          $(this).find(".fa-caret-up").removeClass("fa-caret-up").addClass("fa-caret-down")
        }
        else {
          $(this).parent().find(".sources-list").slideDown(300);
          $(this).find(".fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-up")
        }
      });
    },
    error: function(xhr) {
      if (xhr.status == 400) {
        $(".error-message").text("Sorry, something went wrong on the query.");
        $(".error").slideDown(300);
        $(".loader").hide();
      }
      else if (xhr.status == 401) {
        $(".connect-again-container").slideDown(300);
        $(".loader").hide();
      }
      else if (xhr.status == 429) {
        if (typeof api_key == "undefined") {
          $(".connect-container").slideDown(300);
          $(".loader").hide();
        }
        else {
          $(".upgrade-container").slideDown(300);
          $(".loader").hide();
        }
      }
      else {
        $(".error-message").text("Something went wrong, please try again later.");
        $(".error").slideDown(300);
        $(".loader").hide();
      }
    }
  });
}


// Show the success message with the number of email addresses
//
function resultsMessage(results_number) {
  if (results_number == 0) {
    $("#results-number").text('No email address found.');
  }
  else if (results_number == 1) {
    $("#results-number").text('One email address found.');
  }
  else {
    $("#results-number").text(numberWithCommas(results_number) + ' email addresses found.');
  }
}


// Show the number of sources
//
function sourcesText(sources) {
  if (sources == 1) {
    sources = "1 source";
  }
  else if (sources < 20) {
    sources = sources + " sources";
  }
  else {
    sources = "20+ sources";
  }
  return sources;
}


// Show a notification to explain how to use EH on Linkedin if user is on Linkedin
//
function linkedinNotification() {
  if (window.domain == "linkedin.com") {
    $('.linkedin-notification').slideDown(300);
  }
}


// Add the tooltips to the pattern
//
function addPatternTitle(pattern) {
  pattern = pattern.replace("{first}", "<span data-toggle='tooltip' data-placement='top' title='First name'>{first}</span>")
                   .replace("{last}", "<span data-toggle='tooltip' data-placement='top' title='Last name'>{last}</span>")
                   .replace("{f}", "<span data-toggle='tooltip' data-placement='top' title='First name initial'>{f}</span>")
                   .replace("{l}", "<span data-toggle='tooltip' data-placement='top' title='Last name initial'>{l}</span>");

  return pattern;
}


// Show a notification to ask for feedback if user has made at leat 10 calls
//

function feedbackNotification() {
  chrome.storage.sync.get('calls_count', function(value){
    if (value['calls_count'] >= 10) {
      chrome.storage.sync.get('has_given_feedback', function(value){
        if (typeof value['has_given_feedback'] == "undefined") {
          $('.feedback-notification').slideDown(300);
        }
      });
    }
  });
}

// Ask to note the extension
$("#open-rate-notification").click(function() {
  $('.feedback-notification').slideUp(300);
  $(".rate-notification").slideDown(300);
});

// Ask to give use feedback
$("#open-contact-notification").click(function() {
  $('.feedback-notification').slideUp(300);
  $(".contact-notification").slideDown(300);
});

$(".feedback_link").click(function() {
  chrome.storage.sync.set({'has_given_feedback': true}, function() {
    // The notification won't be shown again
  });
});


// Get account information
//
function addAccountInformation() {
  getAccountInformation(function(json) {
    if (json == "none") {
      $(".account-information").html("Not logged in <div class='pull-right'><a target='_blank' href='https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup'>Sign in</a> or <a target='_blank' href='https://emailhunter.co/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup'>Create a free account</a></div>");
    }
    else {
      $(".account-information").html(""+json.data.email+"<div class='pull-right'>"+numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available)+" requests this month • <a target='_blank' href='https://emailhunter.co/subscriptions?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup'>Upgrade</a></div>");
    }
  })
}

// Verify an email address
//
function verifyEmailAddress() {
  $(".verify_email").click(function() {
    verification_link_tag = $(this);
    verification_link_tag.hide();
    verification_link_tag = $(this)
    verification_link_tag.hide()
    verification_result_tag = $(this).parent().find(".verification_result");
    verification_result_tag.html("<span class='light-grey'><i class='fa fa-spinner fa-spin'></i> Verifying...</span>");

    email = verification_result_tag.parent().find(".email").text();

    chrome.storage.sync.get('api_key', function(value){
      api_key = value["api_key"];

      if (typeof api_key == "undefined") {
        url = 'https://api.emailhunter.co/trial/v2/email-verifier?email=' + email;
      }
      else {
        url = 'https://api.emailhunter.co/v2/email-verifier?email=' + email + '&api_key=' + api_key;
      }

      $.ajax({
        url : url,
        headers: {"Email-Hunter-Origin": "chrome_extension"},
        type : 'GET',
        dataType : 'json',
        success : function(json){

          // Update the number of requests
          addAccountInformation();

          if (json.data.result == "deliverable") {
            verification_result_tag.html("<span class='green'><i class='fa fa-check'></i><a href='https://emailhunter.co/verify/" + email + "?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup' target='_blank' title='Click to see the complete check result'>Deliverable</a></span>");
          }
          else if (json.data.result == "risky") {
            verification_result_tag.html("<span class='dark-orange'><i class='fa fa-exclamation-triangle'></i><a href='https://emailhunter.co/verify/" + email + "?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup' target='_blank' title='Click to see the complete check result'>Risky</a></span>");
            }
          else
            verification_result_tag.html("<span class='red'><i class='fa fa-times'></i><a href='https://emailhunter.co/verify/" + email + "?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup' target='_blank' title='Click to see the complete check result'>Undeliverable</a></span>");
        },
        error: function(xhr) {
          if (xhr.status == 429) {
            if (typeof api_key == "undefined") {
              verification_result_tag.html("<span class='light-grey'>Please sign in</span>");
            }
            else {
              verification_result_tag.html("<span class='light-grey'>Please upgrade</span>");
            }
          }
          else {
            verification_result_tag.html("<span class='light-grey'>Error</span>");
          }
        }
      });
    });
  })
}
