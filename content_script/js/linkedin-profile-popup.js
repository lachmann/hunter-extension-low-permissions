// Launch popup
//
function launchPopup() {
  appendOverlay(function() {
    openPopup(function() {
      launchSearch();

      // Add account information in the popup
      addAccountInformation();

      // Display the lists of leads
      appendListSelector();

      // Analytics
      eventTrack("Open LinkedIn popup");
    });
  });

  // Drag popup
  $("#hio_popup").draggable({ handle: ".hio_popup_drag" });

  // Close popup
  $("#hio_overlay, .hio_popup_close").click(function() {
    closePopup();
  });
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      closePopup();
    }
  });
}


// Destroy popup and overlay
//
function closePopup() {
  $("#hio_popup").remove();
  $("#hio_overlay").remove();
}


// Append overlay on the page
//
function appendOverlay(callback) {
  var docHeight = $(document).height();

  $("body").append('<div id="hio_overlay"></div>');

  $("#hio_overlay")
    .height(docHeight)
    .css({
      'opacity' : 0.4,
      'position': 'absolute',
      'top': 0,
      'left': 0,
      'background-color': 'black',
      'width': '100%',
      'z-index': 11000
  });

  callback();
}


// Show account information
//
function addAccountInformation() {
  getAccountInformation(function(json) {
    if (json == "none") {
      $("#hio_popup_requests").html('Not logged in. <a target="_blank" href="https://emailhunter.co/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup">Sign in</a> or <a target="_blank" href="https://emailhunter.co/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup">Create a free account</a>');
    }
    else {
      $("#hio_popup_requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available)+" requests");
    }
  })
}


// Open popup
//
function openPopup(callback) {
  var windowHeight = $(window).height();
  var windowWidth = $(window).width();

  $("body").append('<div id="hio_popup"><a href="https://emailhunter.co/chrome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup#faq" target="_blank"><i class="fa fa-question-circle hio_popup_question"></i></a><i class="fa fa-ellipsis-v hio_popup_drag"></i><div class="hio_popup_close">&times;</div><div class="hio_popup_name">' + window.profile["first_name"] + ' ' + window.profile["last_name"] + '</div><div id="hio_popup_error"></div><form id="hio_popup_ask_domain"><div id="hio_popup_ask_domain_message"></div><input placeholder="company.com" id="hio_popup_ask_domain_field" type="text" name="domain"><button class="orange-btn" type="submit">Find</button></form><div id="hio_popup_content_container"><div id="hio_popup_content"></div><div id="hio_email_action_message"></div></div><div class="hio_popup_confidence_score"></div><div id="hio_popup_results_link_container"></div><div id="hio_popup_results_show"><div class="hio_popup_found_email_addresses"></div><div class="hio_popup_parsed_email_addresses"></div></div><div id="hio_popup_account"><div class="pull-right" id="hio_popup_requests"></div><div class="hio_list_select_container"></div></div></div>');

  $("#hio_popup")
    .css({
      'position': 'fixed',
      'top': windowHeight / 2 - 200,
      'left': windowWidth / 2 - 300,
      'width': '560px',
      'z-index': 11001
  });

  callback();
}


// Launch email search
//
function launchSearch() {
  if (typeof window.profile["last_company"] != "undefined" || window.profile["last_company"] != "") {

    // Looking for domain name
    mainMessagePopup('Looking for ' + window.profile["first_name"] + '\'s email address...', true);
    getCompanyPage(window.profile, function(company_data) {
      if (company_data != "none") {
        window.profile["domain"] = cleanDomain(company_data.website);
        window.profile["company_size"] = company_data.company_size;
        window.profile["company_industry"] = company_data.company_industry;

        $('#hio_popup_results_link_container').html('<div class="hio_popup_results_message">Looking for ' + window.profile["domain"] + ' email addresses...</div>');

        // Use or not API key
        chrome.storage.sync.get('api_key', function(value){
          if (typeof value["api_key"] !== "undefined" && value["api_key"] !== "") {
            api_key = value["api_key"];
          }
          else { api_key = ''; }

          // Generate the email
          generate_email_endpoint = 'https://api.emailhunter.co/v2/email-finder?domain=' + encodeURIComponent(window.profile["domain"]) + '&first_name=' + encodeURIComponent(window.profile["first_name"]) + '&last_name=' + encodeURIComponent(window.profile["last_name"]) + '&position=' + encodeURIComponent(window.profile["position"]) + '&company=' + encodeURIComponent(window.profile["last_company"]);
          apiCall(api_key, generate_email_endpoint, function(email_json) {

            // We count call to measure use
            countCall();

            // Count how much email addresses there is on the domain
            count_endpoint = 'https://api.emailhunter.co/v2/email-count?domain=' + encodeURIComponent(window.profile["domain"]);
            apiCall(api_key, count_endpoint, function(count_json) {

              // If email addresses has NOT been found
              if (email_json.data.email == null) {

                // Maybe try to remove a subdomain if there is one
                if (withoutSubDomain(window.profile["domain"])) {
                  window.profile["domain"] = withoutSubDomain(window.profile["domain"]);
                  launchSearch();
                }
                else {
                  mainMessagePopup("No result.");
                  showResultsCountMessage(count_json.data.total);
                  $("#hio_popup_results_show").slideDown(300);

                  // If we have at least one email on the domain, we show it to help
                  if (count_json.data.total > 0) {
                    showEmailList();
                  }

                  // Maybe there are email addresses directly on the profile! Let's show them :)
                  showParsedEmailAddresses();
                }
              }

              // If email has been found
              else {
                showFoundEmailAddress(email_json, count_json);
                showParsedEmailAddresses();
                addAccountInformation();
                $("#hio_popup_results_show").slideDown(300);
              }

            askNewDomainListener();
            });
          });
        });
      }
      else {
        askDomainName();
      }
    });
  }
  else {
    if (typeof window.profile["profile_main_content"] == "undefined") {
      showError("You don't have access to this profile.");
      $(".hio_popup_name").text("No access");
    } else {
      showError(window.profile["first_name"] + ' has no current professional experience.');
    }
  }
}


// Show the main email address found
//
function showFoundEmailAddress(email_json, count_json) {
  mainMessagePopup(email_json.data.email);
  addCopyButton(email_json.data.email);
  showConfidence(email_json.data.score);
  addSaveButton(email_json.data.email);

  window.profile["email"] = email_json.data.email;
  window.profile["confidence_score"] = email_json.data.score;

  if (count_json.count > 1) { es = 'es' }
  else { es = '' }
  $('#hio_popup_results_link_container').html('<a class="hio_popup_results_link" href="https://emailhunter.co/search/' + window.profile["domain"] + '?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" target="_blank">' + count_json.data.total + ' email address' + es + ' for ' + window.profile["domain"] + '<i class="fa fa-external-link"></i></a> <span class="hio_popup_separator">•</span> <span class="hio_popup_ask_domain">Try with an other domain name</span>');

  $('#hio_popup_results_link_container').slideDown(300);
}

// Add a copy button to copy the email address
//
function addCopyButton(email) {
  $("<div id='hio_copy_email_button' class='fa fa-files-o' data-toggle='tooltip' data-placement='top' title='Copy'></div>").insertBefore( "#hio_email_action_message" );
  $('#hio_copy_email_button').tooltip();

  $("#hio_copy_email_button").click(function() {
    executeCopy(email);
    displayActionMessage("Copied!");
    console.log("\""+email+"\" copied in the clipboard!");
  })
}


// Add a copy button to copy the email address
//
function addSaveButton() {
  $("<div id='hio_save_email_button' class='fa fa-floppy-o' data-toggle='tooltip' data-placement='top' title='Save the lead'></div>").insertBefore( "#hio_email_action_message" );
  $('#hio_save_email_button').tooltip();

  $("#hio_save_email_button").click(function() {
    $('#hio_save_email_button').tooltip("hide");
    $(this).remove();
    $("<div class='fa fa-spinner fa-spin hio_save_lead_loader'></div>").insertBefore("#hio_email_action_message");

    saveLead(window.profile, function(response) {
      if (typeof response.status != "undefined" && response.status == "success") {
        displayActionMessage("Saved!");
        console.log("Saved in leads!");
      }
      else if (response == "please_sign_in") {
        displayActionMessage("Please sign in!");
      }
      else {
        displayActionMessage("Error. Please try again later.");
      }
      $(".hio_save_lead_loader").removeClass("fa-spinner fa-spin").addClass("fa-floppy-o");
    });
  })
}


// Message displayed near actions
//
function displayActionMessage(message) {
  $("#hio_email_action_message").text(message);

  setTimeout(function(){
    $("#hio_email_action_message").text("");
  }, 3000);
}


// Show the number of email addresses found on a domain name
//
function showResultsCountMessage(results_number) {
  if (results_number == 0) {
    $(".hio_popup_found_email_addresses").append('<p>Nothing found with the domain <strong>' + window.profile["domain"] + '</strong>. Maybe <span class="hio_popup_ask_domain">try another domain name</span>?</p>');
  } else if (results_number == 1) {
    $(".hio_popup_found_email_addresses").append('<p>One email address using the domain <strong>' + window.profile["domain"] + '</strong> found:</p>');
  } else {
    $(".hio_popup_found_email_addresses").append('<p>' + results_number + ' email addresses using the domain <strong>' + window.profile["domain"] + '</strong> found:</p>');
  }
}


// Search for email addresses on a string (in this case, the page body)
//
function parseProfileEmailAddresses(string) {
  return string.match(/([a-zA-Z][\w+\-.]+@[a-zA-Z\d\-]+(\.[a-zA-Z]+)*\.[a-zA-Z]+)/gi);
}


// Display the list of email addresses directly found on the profile
//
function showParsedEmailAddresses() {
  if (typeof window.profile["profile_main_content"] != "undefined") {
    email_addresses = parseProfileEmailAddresses(window.profile["profile_main_content"]);
    if (email_addresses != null && email_addresses.length > 0) {
      var unique_email_addresses = [];
      $.each(email_addresses, function(i, el){
        if($.inArray(el, unique_email_addresses) === -1) unique_email_addresses.push(el);
      });

      $(".hio_popup_parsed_email_addresses").append("<hr>");
      if (unique_email_addresses.length == 1) {
        $(".hio_popup_parsed_email_addresses").append('<p>One email address found on the profile of ' + window.profile["first_name"] + ':</p>');
      }
      else {
        $(".hio_popup_parsed_email_addresses").append('<p>' + unique_email_addresses.length + ' email addresses found on this profile:</p>');
      }

      $.each(unique_email_addresses.slice(0,5), function(email_key, email_val) {
        $(".hio_popup_parsed_email_addresses").append('<div class="hio_popup_email_list">' + email_val + '<i class="fa fa-floppy-o hio_save_other_email" data-toggle="tooltip" data-placement="top" data-email="' + email_val + '" title="Save the lead with this email address"></i></div>');
      });

      saveOtherEmailAddress();
    }
  }
}

// Save the lead with an other email address
//
function saveOtherEmailAddress() {
  $(".hio_save_other_email").tooltip();

  $(".hio_save_other_email").click(function() {
    container = $(this).parent();
    container.append("<i class='hio_save_other_email_icon fa fa-spinner fa-spin'></i>");

    $(this).tooltip("hide");
    $(this).remove();

    window.profile["email"] = $(this).attr("data-email");

    saveLead(window.profile, function(response) {
      container.find(".fa-spinner").remove();
      container.append("<i class='hio_save_other_email_icon fa fa-floppy-o'></i>");

      if (typeof response.status != "undefined" && response.status == "success") {
        container.append("<span class='hio_save_other_email_status'>Saved!</span>");
        console.log("Saved in leads!");
      }
      else if (response == "please_sign_in") {
        container.append("<span class='hio_save_other_email_status'>Please sign in!</span>");
      }
      else {
        container.append("<span class='hio_save_other_email_status'>Error. Please try again later.</span>");
      }

      $(".hio_save_other_email_status").delay(3000).queue(function() {
        $(this).remove();
      })
    });
  })
}

// Show a list of email addresses found on the domain name
//
function showEmailList() {
  domain_search_endpoint = 'https://api.emailhunter.co/v2/domain-search?domain=' + window.profile["domain"];
  apiCall(api_key, domain_search_endpoint, function(domain_json) {
    $.each(domain_json.data.emails.slice(0,5), function(email_key, email_val) {
      $(".hio_popup_found_email_addresses").append('<div class="hio_popup_email_list">' + email_val.value + '<i class="fa fa-floppy-o hio_save_other_email" data-toggle="tooltip" data-placement="top" data-email="' + email_val.value + '" title="Save the lead with this email address"></i></div>');
    });
    saveOtherEmailAddress();

    $(".hio_popup_found_email_addresses").append('<div class="hio_popup_email_list"><a class="hio_popup_results_link" href="https://emailhunter.co/search/' + window.profile["domain"] + '?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" target="_blank">See results for ' + window.profile["domain"] + '<i class="fa fa-external-link"></i></a> <span class="hio_popup_separator">•</span> <span class="hio_popup_ask_domain">Try with another domain name</span></div>');
    askNewDomainListener();
  });

  $("#hio_popup_results_show").slideDown(300);
}


// Ask a new domain on click
//
function askNewDomainListener() {
  $(".hio_popup_ask_domain").click(function () {
    $("#hio_popup_results_link_container").hide();
    $("#hio_popup_results_show").hide();
    $(".hio_popup_found_email_addresses").html("");
    askDomainName();
  });
}


// Show the main message in popup on LinkedIn
//
function mainMessagePopup(message, loader) {
  console.log(message);
  loader = loader || false;
  if (loader == true) {
    loader_html = '<i class="fa fa-spinner fa-spin loader"></i>';
  }
  else { loader_html = ''; }

  $("#hio_popup_content").html(loader_html + message);
}


// Show confidence score
//
function showConfidence(score) {
  $(".hio_popup_confidence_score").html('<div class="hio_popup_confidence">' + score + '% confidence</div><div class="hio_popup_confidence_bar"><div class="hio_popup_confidence_level" style="width: ' + score + '%;"></div></div>');
  $(".hio_popup_confidence_score").show();
}


// Ask for the domain name
// Appends in three cases :
// - no domain name has been found
// - a domain has been found but gives no result
// - it gave result but the user still want to try with another domain name
//
function askDomainName(showMessage) {
  $(".hio_popup_confidence_score").slideUp(300);

  $("#hio_popup_content_container").slideUp(300, function() {
    $("#hio_popup_ask_domain").slideDown(300, function() {
      $("#hio_popup_ask_domain_field").focus();
    });

    if (typeof window.profile["email"] != "undefined") {
      $("#hio_popup_ask_domain_message").html('You already found <strong>' + window.profile["email"] + '</strong>. Would you like to find the email address using another domain name?');
    }
    else if (typeof window.profile["domain"] != "undefined") {
      $("#hio_popup_ask_domain_message").html('No email found with <strong>' + window.profile["domain"] + '</strong>. Maybe try another domain name?');
    }
    else {
      $("#hio_popup_ask_domain_message").html('We couldn\'t find <strong>' + window.profile["last_company"] + '</strong> website. Please enter the domain name to launch the search. <a href="https://google.com/search?q= ' + window.profile["last_company"] + '" target="_blank">Search the website on Google &#187;</a>');
    }

    $("#hio_popup_ask_domain").submit(function() {
      $("#hio_popup_ask_domain button").prop("disabled", true);
      $("#hio_popup_ask_domain").delay(500).slideUp(300, function() {
        $("#hio_popup_ask_domain button").prop("disabled", false);
        $("#hio_popup_content_container").slideDown(300);

        $(".hio_popup_parsed_email_addresses").html("");
        $("#hio_save_email_button, #hio_copy_email_button").remove();

        window.profile["domain"] = $("#hio_popup_ask_domain_field").val();
        launchSearch();
      });

      return false;
    });
  });
}


// Throw an error
//
function showError(error) {
  if (linkedinPageType() == "profile") {
    $("#hio_popup_content_container").slideUp(300);
    $("#hio_popup_error").html(error).slideDown(300);
  }
  else if (linkedinPageType() == "search") {
    $("#hio_search_popup_content_container").slideUp(300);
    $("#hio_search_popup_error").html(error).slideDown(300);
  }
}


// Copy in email in LinkedIn popup
//
function executeCopy(text) {
    var input = document.createElement('textarea');
    $("#hio_popup").prepend(input);
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
}
