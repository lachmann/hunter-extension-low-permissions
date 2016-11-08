var LinkedinProfile = {

  // When the LinkedIn Profile is opened, we have to parse the profile before
  // displaying the content

  launch: function() {
    this_popup = this;

    var readyStateCheckInterval = setInterval(function() {
      chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {subject: "get_linkedin_profile"}, function(response) {
          if (typeof response.first_name != "undefined") {
            clearInterval(readyStateCheckInterval);

            window.profile = response;

            this_popup.open(function() {
              this_popup.launchSearch();

              // Add account information in the popup
              this_popup.addAccountInformation();

              // Display the lists of leads
              ListSelection.appendSelector();

              // Analytics
              Analytics.trackEvent("Open LinkedIn popup");
            });
          }
        });
      });
    }, 200);
  },


  // Open the popup
  open: function(callback) {
    $("#linkedin-profile").html('\n\
      <div id="ehunter_popup">\n\
        <div class="ehunter_popup_name">\n\
          ' + window.profile["first_name"] + ' ' + window.profile["last_name"] + '</div>\n\
          <div id="ehunter_popup_error"></div>\n\
          <form id="ehunter_popup_ask_domain">\n\
            <div id="ehunter_popup_ask_domain_message"></div>\n\
            <input placeholder="company.com" id="ehunter_popup_ask_domain_field" type="text" name="domain">\n\
            <button class="orange-btn" type="submit">Find</button>\n\
          </form>\n\
          <div id="ehunter_popup_content_container">\n\
            <div id="ehunter_popup_content"></div>\n\
            <div id="ehunter_email_action_message"></div>\n\
          </div>\n\
          <div class="ehunter_popup_confidence_score"></div>\n\
          <div id="ehunter_popup_results_link_container"></div>\n\
          <div id="ehunter_popup_results_show">\n\
            <div class="ehunter_popup_found_email_addresses"></div>\n\
            <div class="ehunter_popup_parsed_email_addresses"></div>\n\
          </div>\n\
          <div id="ehunter_popup_account">\n\
          <div class="pull-right" id="ehunter_popup_requests"></div>\n\
          <div class="ehunter_list_select_container"></div>\n\
        </div>\n\
      </div>\n\
    ');

    callback();
  },

  launchSearch: function() {
    this_popup = this;

    if (typeof window.profile["last_company"] != "undefined" || window.profile["last_company"] != "") {

      // Looking for domain name
      this_popup.mainMessage('Looking for ' + window.profile["first_name"] + '\'s email address...', true);

      // Use or not API key
      Account.getApiKey(function(api_key) {

        if (typeof window.profile["domain"] !== "undefined") {
          company_param = 'domain=' + encodeURIComponent(window.profile["domain"]);
        }
        else if (typeof window.profile["last_company_id"] !== "undefined") {
          company_param = 'linkedin_id=' + encodeURIComponent(window.profile["last_company_id"]);
        }

        if (typeof company_param !== "undefined") {

          //$('#ehunter_popup_results_link_container').html('<div class="ehunter_popup_results_message">Looking for ' + window.profile["domain"] + ' email addresses...</div>');

          // Generate the email
          email_finder_endpoint = 'https://api.hunter.io/v2/email-finder?' + company_param + '&first_name=' + encodeURIComponent(window.profile["first_name"]) + '&last_name=' + encodeURIComponent(window.profile["last_name"]) + '&position=' + encodeURIComponent(window.profile["position"]) + '&company=' + encodeURIComponent(window.profile["last_company"]);
          apiCall(api_key, email_finder_endpoint, function(email_json) {

            console.log(email_json);

            if (email_json.data.domain != null) {
              window.profile["domain"] = email_json.data.domain;

              // We count call to measure use
              countCall();

              // Count how much email addresses there is on the domain
              count_endpoint = 'https://api.hunter.io/v2/email-count?domain=' + encodeURIComponent(window.profile["domain"]);
              apiCall("", count_endpoint, function(count_json) {

                // If email addresses has NOT been found
                if (email_json.data.email == null) {

                  // Maybe try to remove a subdomain if there is one
                  if (withoutSubDomain(window.profile["domain"])) {
                    window.profile["domain"] = withoutSubDomain(window.profile["domain"]);
                    this_popup.launchSearch();
                  }
                  else {
                    this_popup.mainMessage("No result.");
                    this_popup.showResultsCountMessage(count_json.data.total);
                    $("#ehunter_popup_results_show").slideDown(300);

                    // If we have at least one email on the domain, we show it to help
                    if (count_json.data.total > 0) {
                      this_popup.showEmailList();
                    }

                    // Maybe there are email addresses directly on the profile! Let's show them :)
                    this_popup.showParsedEmailAddresses();
                  }
                }

                // If email has been found
                else {
                  this_popup.showFoundEmailAddress(email_json, count_json);
                  this_popup.showParsedEmailAddresses();
                  this_popup.addAccountInformation();
                  $("#ehunter_popup_results_show").slideDown(300);
                }

              this_popup.askNewDomainListener();
              });
            }
            else {
              this_popup.askDomainName();
            }
          });
        }
        else {
          this_popup.askDomainName();
        }
      });
    }
    else {
      if (typeof window.profile["profile_main_content"] == "undefined") {
        showError("You don't have access to this profile.");
        $(".ehunter_popup_name").text("No access");
      } else {
        showError(window.profile["first_name"] + ' has no current professional experience.');
      }
    }
  },


  showFoundEmailAddress: function(email_json, count_json) {
    this.mainMessage(email_json.data.email);
    this.addCopyButton(email_json.data.email);
    this.showConfidence(email_json.data.score);
    this.addSaveButton(email_json.data.email);

    window.profile["email"] = email_json.data.email;
    window.profile["confidence_score"] = email_json.data.score;

    if (count_json.count > 1) { es = 'es' }
    else { es = '' }
    $('#ehunter_popup_results_link_container').html('<a class="ehunter_popup_results_link" href="https://hunter.io/search/' + window.profile["domain"] + '?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" target="_blank">' + count_json.data.total + ' email address' + es + ' for ' + window.profile["domain"] + '<i class="fa fa-external-link"></i></a> <span class="ehunter_popup_separator">•</span> <span class="ehunter_popup_ask_domain">Try with an other domain name</span>');

    $('#ehunter_popup_results_link_container').slideDown(300);
  },


  addCopyButton: function(email) {
    this_popup = this;

    $("<div id='ehunter_copy_email_button' class='fa fa-files-o' data-toggle='tooltip' data-placement='top' title='Copy'></div>").insertBefore( "#ehunter_email_action_message" );
    $('#ehunter_copy_email_button').tooltip();

    $("#ehunter_copy_email_button").click(function() {
      this_popup.executeCopy(email);
      this_popup.displayActionMessage("Copied!");
      console.log("\""+email+"\" copied in the clipboard!");
    })
  },


  // Add account information at the bottom of the popup
  addAccountInformation: function() {
    Account.get(function(json) {
      if (json == "none") {
        $("#ehunter_popup_requests").html('\n\
          Not logged in.\n\
          <a target="_blank" href="https://hunter.io/chrome/welcome?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup">Sign in</a>\n\
          or <a target="_blank" href="https://hunter.io/users/sign_up?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=browser_popup">Create a free account</a>\n\
        ');
      }
      else {
        $("#ehunter_popup_requests").html(numberWithCommas(json.data.calls.used)+" / "+numberWithCommas(json.data.calls.available)+" requests");
      }
    })
  },


  // Add a copy button to copy the email address
  addSaveButton: function() {
    this_popup = this;
    $("<div id='ehunter_save_email_button' class='fa fa-floppy-o' data-toggle='tooltip' data-placement='top' title='Save the lead'></div>").insertBefore( "#ehunter_email_action_message" );
    $('#ehunter_save_email_button').tooltip();

    $("#ehunter_save_email_button").click(function() {
      $('#ehunter_save_email_button').tooltip("hide");
      $(this).remove();
      $("<div class='fa fa-spinner fa-spin ehunter_save_lead_loader'></div>").insertBefore("#ehunter_email_action_message");

      saveLead(window.profile, function(response) {
        if (response == "please_sign_in") {
          this_popup.displayActionMessage("Please sign in!");
        }
        else if (response == "duplicated_entry") {
          this_popup.displayActionMessage("Lead already saved!");
        }
        else if (response == "error") {
          this_popup.displayActionMessage("Error. Please try again later.");
        }
        else {
          this_popup.displayActionMessage("Saved!");
          console.log("Saved in leads!");
        }
        $(".ehunter_save_lead_loader").removeClass("fa-spinner fa-spin").addClass("fa-floppy-o");
      });
    })
  },


  displayActionMessage: function(message) {
    $("#ehunter_email_action_message").text(message);

    setTimeout(function(){
      $("#ehunter_email_action_message").text("");
    }, 3000);
  },


  showResultsCountMessage: function(results_number) {
    if (results_number == 0) {
      $(".ehunter_popup_found_email_addresses").append('<p>Nothing found with the domain <strong>' + window.profile["domain"] + '</strong>. Maybe <span class="ehunter_popup_ask_domain">try another domain name</span>?</p>');
    } else if (results_number == 1) {
      $(".ehunter_popup_found_email_addresses").append('<p>One email address using the domain <strong>' + window.profile["domain"] + '</strong> found:</p>');
    } else {
      $(".ehunter_popup_found_email_addresses").append('<p>' + results_number + ' email addresses using the domain <strong>' + window.profile["domain"] + '</strong> found:</p>');
    }
  },


  showParsedEmailAddresses: function() {
    this_popup = this;

    if (typeof window.profile["profile_main_content"] != "undefined") {
      email_addresses = parseProfileEmailAddresses(window.profile["profile_main_content"]);
      if (email_addresses != null && email_addresses.length > 0) {
        var unique_email_addresses = [];
        $.each(email_addresses, function(i, el){
          if($.inArray(el, unique_email_addresses) === -1) unique_email_addresses.push(el);
        });

        $(".ehunter_popup_parsed_email_addresses").append("<hr>");
        if (unique_email_addresses.length == 1) {
          $(".ehunter_popup_parsed_email_addresses").append('<p>One email address found on the profile of ' + window.profile["first_name"] + ':</p>');
        }
        else {
          $(".ehunter_popup_parsed_email_addresses").append('<p>' + unique_email_addresses.length + ' email addresses found on this profile:</p>');
        }

        $.each(unique_email_addresses.slice(0,5), function(email_key, email_val) {
          $(".ehunter_popup_parsed_email_addresses").append('<div class="ehunter_popup_email_list">' + email_val + '<i class="fa fa-floppy-o ehunter_save_other_email" data-toggle="tooltip" data-placement="top" data-email="' + email_val + '" title="Save the lead with this email address"></i></div>');
        });

        this_popup.saveOtherEmailAddress();
      }
    }
  },


  saveOtherEmailAddress: function() {
    $(".ehunter_save_other_email").tooltip();

    $(".ehunter_save_other_email").click(function() {
      container = $(this).parent();
      container.append("<i class='ehunter_save_other_email_icon fa fa-spinner fa-spin'></i>");

      $(this).tooltip("hide");
      $(this).remove();

      window.profile["email"] = $(this).attr("data-email");
      window.profile["confidence_score"] = "";

      saveLead(window.profile, function(response) {
        container.find(".fa-spinner").remove();
        container.append("<i class='ehunter_save_other_email_icon fa fa-floppy-o'></i>");

        if (response == "please_sign_in") {
          container.append("<span class='ehunter_save_other_email_status'>Please sign in!</span>");
        }
        else if (response == "duplicated_entry") {
          container.append("<span class='ehunter_save_other_email_status'>Lead already saved!</span>");
        }
        else if (response == "error") {
          container.append("<span class='ehunter_save_other_email_status'>Error. Please try again later.</span>");
        }
        else {
          container.append("<span class='ehunter_save_other_email_status'>Saved!</span>");
          console.log("Saved in leads!");
        }

        $(".ehunter_save_other_email_status").delay(3000).queue(function() {
          $(this).remove();
        })
      });
    })
  },


  showEmailList: function() {
    this_popup = this;

    domain_search_endpoint = 'https://api.hunter.io/v2/domain-search?domain=' + window.profile["domain"];
    apiCall(api_key, domain_search_endpoint, function(domain_json) {
      $.each(domain_json.data.emails.slice(0,5), function(email_key, email_val) {
        $(".ehunter_popup_found_email_addresses").append('<div class="ehunter_popup_email_list">' + email_val.value + '<i class="fa fa-floppy-o ehunter_save_other_email" data-toggle="tooltip" data-placement="top" data-email="' + email_val.value + '" title="Save the lead with this email address"></i></div>');
      });
      this_popup.saveOtherEmailAddress();

      $(".ehunter_popup_found_email_addresses").append('<div class="ehunter_popup_email_list"><a class="ehunter_popup_results_link" href="https://hunter.io/search/' + window.profile["domain"] + '?utm_source=chrome_extension&utm_medium=extension&utm_campaign=extension&utm_content=linkedin_popup" target="_blank">See results for ' + window.profile["domain"] + '<i class="fa fa-external-link"></i></a> <span class="ehunter_popup_separator">•</span> <span class="ehunter_popup_ask_domain">Try with another domain name</span></div>');
      this_popup.askNewDomainListener();
    });

    $("#ehunter_popup_results_show").slideDown(300);
  },

  askNewDomainListener: function() {
    this_popup = this

    $(".ehunter_popup_ask_domain").click(function () {
      $("#ehunter_popup_results_link_container").hide();
      $("#ehunter_popup_results_show").hide();
      $(".ehunter_popup_found_email_addresses").html("");
      this_popup.askDomainName();
    });
  },


  mainMessage: function(message, loader = false) {
    console.log(message);
    loader = loader || false;

    if (loader == true) { loader_html = '<i class="fa fa-spinner fa-spin ehunter_popup_loader"></i>'; }
    else { loader_html = ''; }

    $("#ehunter_popup_content").html(loader_html + message);
  },


  showConfidence: function(score) {
    $(".ehunter_popup_confidence_score").html('<div class="ehunter_popup_confidence">' + score + '% confidence</div><div class="ehunter_popup_confidence_bar"><div class="ehunter_popup_confidence_level" style="width: ' + score + '%;"></div></div>');
    $(".ehunter_popup_confidence_score").show();
  },


  // Ask for the domain name
  // Appends in three cases :
  // - no domain name has been found
  // - a domain has been found but gives no result
  // - it gave result but the user still want to try with another domain name
  //
  askDomainName: function(showMessage) {
    this_popup = this
    $(".ehunter_popup_confidence_score").slideUp(300);

    $("#ehunter_popup_content_container").slideUp(300, function() {
      $("#ehunter_popup_ask_domain").slideDown(300, function() {
        $("#ehunter_popup_ask_domain_field").focus();
      });

      if (typeof window.profile["email"] != "undefined") {
        $("#ehunter_popup_ask_domain_message").html('You already found <strong>' + window.profile["email"] + '</strong>. Would you like to find the email address using another domain name?');
      }
      else if (typeof window.profile["domain"] != "undefined") {
        $("#ehunter_popup_ask_domain_message").html('No email found with <strong>' + window.profile["domain"] + '</strong>. Maybe try another domain name?');
      }
      else {
        $("#ehunter_popup_ask_domain_message").html('We couldn\'t find <strong>' + window.profile["last_company"] + '</strong> website. Please enter the domain name to launch the search. <a href="https://google.com/search?q= ' + window.profile["last_company"] + '" target="_blank">Search the website on Google &#187;</a>');
      }

      $("#ehunter_popup_ask_domain").submit(function() {
        $("#ehunter_popup_ask_domain button").prop("disabled", true);
        $("#ehunter_popup_ask_domain").delay(500).slideUp(300, function() {
          $("#ehunter_popup_ask_domain button").prop("disabled", false);
          $("#ehunter_popup_content_container").slideDown(300);

          $(".ehunter_popup_parsed_email_addresses").html("");
          $("#ehunter_save_email_button, #ehunter_copy_email_button").remove();

          window.profile["domain"] = $("#ehunter_popup_ask_domain_field").val();
          this_popup.launchSearch();
        });

        return false;
      });
    });
  },

  executeCopy: function(text) {
    var input = document.createElement('textarea');
    $("#ehunter_popup").prepend(input);
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
  }
}
