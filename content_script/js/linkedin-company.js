CompanyPage = {
  get: function() {
    // Old company pages
    if ($(".basic-info-about").length) {
      // In this case, we use the good old parser. In the future, this script
      // will disappear if LinkedIn decides to deploy the new company pages
      // everywhere!
      html = $("html").html();
      website = LinkedinCompany.getWebsite(html);
      employees = LinkedinCompany.getEmployees(html);
      industry = LinkedinCompany.getIndustry(html);
      name = $("h1.name").text();
      id = window.location.href.match(/https\:\/\/www\.linkedin\.com\/company\/([0-9]*)/)[1]
    }
    // New company pages
    else if ($(".about-us-organization-description").length) {
      website = $(".company-page-url").text().trim();
      employees = $(".staff-count-range").text().trim();
      industry = $(".industry").text().trim();
      name = $("h1.company-main-info-company-name").text().trim();
      id = window.location.href.match(/https\:\/\/www\.linkedin\.com\/company(-beta)?\/([0-9]*)/)[2]
    }

    Account.getApiKey(function(api_key) {
      if (api_key != '') {
        $.ajax({
          url: 'https://api.hunter.io/v2/company-leads?linkedin_id=' + id + "&website=" + encodeURIComponent(website) + "&employees=" + encodeURIComponent(employees) + "&industry=" + encodeURIComponent(industry) + "&name=" + encodeURIComponent(name) + "&api_key=" + api_key,
          type: 'POST'
        });
      }
    });
  }
}

// >> Start JS injection when the extension loads
//
chrome.extension.sendMessage({}, function(response) {
  var readyStateCheckInterval = setInterval(function() {
    if ($(".basic-info-about").length || $(".about-us-organization-description").length) {
      clearInterval(readyStateCheckInterval);
      CompanyPage.get();
    }
  }, 1000);
});
