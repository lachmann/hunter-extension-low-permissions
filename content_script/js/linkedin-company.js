CompanyPage = {
  get: function() {
    // Old company pages
    if ($(".basic-info-about").length) {
      // In this case, we use the good old parser. In the future, this script
      // will disappear if LinkedIn decides to deploy the new company pages
      // everywhere!
      //
      html = $("html").html();
      website = LinkedinCompany.getWebsite(html);
      employees = LinkedinCompany.getEmployees(html);
      industry = LinkedinCompany.getIndustry(html);
      name = $("h1.name").text();
      id = window.location.href.match(/https?\:\/\/www\.linkedin\.com\/company\/([0-9a-z]*)/)[1]
    }
    // New company pages
    else if ($(".about-us-organization-description").length) {
      website = $(".company-page-url").text().trim();
      employees = $(".staff-count-range").text().trim();
      industry = $(".industry").text().trim();
      name = $("h1.company-main-info-company-name").text().trim();
      id = window.location.href.match(/https?\:\/\/www\.linkedin\.com\/company(-beta)?\/([0-9a-z]*)/)[2]
    }

    // We extract the domain name
    //
    domain = cleanDomain(website);
    if (withoutSubDomain(domain)) {
      domain = withoutSubDomain(domain);
    }

    // We check if the ID is actually found and that it looks like an integer
    // In some cases, a handle is in the URL instead of an ID. We don't save it.
    // Example: https://www.linkedin.com/company/firmapi
    //
    if (id != '' && !id.match(/[a-z]+/i)) {
      Account.getApiKey(function(api_key) {
        if (api_key != '') {
          $.ajax({
            url: 'https://api.hunter.io/v2/company-leads?linkedin_id=' + id + "&domain=" + encodeURIComponent(domain) + "&company_size=" + encodeURIComponent(employees) + "&industry=" + encodeURIComponent(industry) + "&name=" + encodeURIComponent(name) + "&api_key=" + api_key,
            type: 'POST'
          });
        }
      });
    }
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
