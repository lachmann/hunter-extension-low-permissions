var LinkedinProfile = {

  // FULL NAME
  getFullName: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isRecruiter()) {
      var full_name = $html.find("title").text();
    }
    else if (LinkedinVersion.isSalesNavigator()) {
      if ($("html").find(".profile-actions").length != 0) {
        full_name = $html.find("title").text().split(" |")[0];
      }
      else {
        html = $html.find("code").last().html();
        if (typeof html == "undefined") { return undefined; }

        json = html.replace("<!--", "").replace("-->", "");
        full_name = JSON.parse(json)["profile"]["fullName"];
      }
    }
    else {
      var full_name = $html.find("title").text().substring(0, $html.find("title").text().indexOf(" |"));
    }

    return cleanName(full_name);
  },

  // LAST COMPANY NAME
  getLastCompany: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isSalesNavigator()) {
      if (typeof $html.find(".company-name").first().text() != "undefined" && $html.find(".company-name").first().text() != "") {
        last_company = $html.find(".company-name").first().text();
      }
      else {
        html = $html.find("code").last().html();
        if (typeof html == "undefined") { return undefined; }

        json = html.replace("<!--", "").replace("-->", "");
        if (typeof JSON.parse(json)["positionsView"]["positions"] == "undefined") { return undefined; }

        last_company = JSON.parse(json)["positionsView"]["positions"][0]["position"]["companyName"];
      }
    } else if (LinkedinVersion.isRecruiter()) {
      last_company = $html.find(".position-header h5").first().text();
    }
    else {
      last_company = $html.find(".current-position h5:last-child a").first().text();
    }

    return last_company;
  },

  // LAST COMPANY PATH
  getLastCompanyPath: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isSalesNavigator()) {
      if (typeof $html.find(".company-name a").first().attr("href") != "undefined" && $html.find(".company-name a").first().attr("href") != "") {
        last_company_path = $html.find(".company-name a").first().attr("href");
      }
      else {
        html = $html.find("code").last().html();
        if (typeof html == "undefined") { return undefined; }

        json = html.replace("<!--", "").replace("-->", "");
        if (typeof JSON.parse(json)["positionsView"]["positions"] == "undefined") { return undefined; }

        last_company_path = JSON.parse(json)["positionsView"]["positions"][0]["companyUrl"];

        if (typeof last_company_path != "undefined") { last_company_path = last_company_path.replace("http://", "https://"); }
      }
    } else if (LinkedinVersion.isRecruiter()) {
      if (typeof($html.find(".position-header h5 a").first().attr("href")) != "undefined" && $html.find(".position-header h5 a").first().attr("href").indexOf("search?") == -1) {
        last_company_path = $html.find(".position-header h5 a").first().attr("href");
      }
      else {
        last_company_path = undefined;
      }
    }
    else {
      last_company_path = $html.find(".current-position .new-miniprofile-container a").first().attr("href");
    }

    return last_company_path;
  },

  getLastCompanyID: function(company_path) {
    if (typeof company_path !== "undefined") {
      if (LinkedinVersion.isSalesNavigator()) {
        id = company_path.match(/sales\/accounts\/insights\?companyId=([0-9]*)/)[1];
      }
      else if (LinkedinVersion.isRecruiter()) {
        console.log(company_path);
        id = company_path.match(/recruiter\/company\/([0-9]*)/)[1];
      }
      else {
        id = company_path.match(/company(-beta)?\/([0-9]*)/)[2];
      }
    }
    else {
      id = undefined;
    }

    return id;
  },

  // LAST POSITION
  getPosition: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isSalesNavigator()) {
      if (typeof $html.find(".position-title").first().text() != "undefined" && $html.find(".position-title").first().text() != "") {
        position = $html.find(".position-title").first().text();
      }
      else {
        html = $html.find("code").last().html();
        if (typeof html == "undefined") { return undefined; }

        json = html.replace("<!--", "").replace("-->", "");
        if (typeof JSON.parse(json)["positionsView"]["positions"] == "undefined") { return undefined; }

        position = JSON.parse(json)["positionsView"]["positions"][0]["position"]["title"];
      }
    }
    else if (LinkedinVersion.isRecruiter()) {
      position = $html.find(".position-header h4 a").first().text();
    }
    else {
      position = $html.find(".current-position h4 a").first().text();
    }

    return position;
  },

  // LINKEDIN URL
  getLinkedinUrl: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isSalesNavigator()) {
      if (typeof $html.find(".linkedin-logo").next().find("a").text() != "undefined" && $html.find(".linkedin-logo").next().find("a").text() != "") {
        url = $html.find(".linkedin-logo").next().find("a").text();
      }
      else {
        html = $html.find("code").last().html();
        if (typeof html == "undefined") { return undefined; }

        json = html.replace("<!--", "").replace("-->", "");
        url = JSON.parse(json)["profile"]["publicLink"];
      }
    }
    else if (LinkedinVersion.isRecruiter()) {
      url = $html.find(".public-profile a").attr("href");
    }
    else {
      url = $html.find(".public-profile a").text();
    }

    return url;
  },

  // COUNTRY CODE
  getCountryCode: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isSalesNavigator()) {
      // TO DO
      country_code = "";
    }
    else if (LinkedinVersion.isRecruiter()) {
      // TO DO
      country_code = "";
    }
    else {
      path = $html.find(".locality a").attr("href");
      country_code = extractCountryCodeFromSearchPath(path);
    }

    return country_code;
  },

  // PROFILE MAIN CONTENT
  getMainProfileContent: function(html) {
    var $html = $('<div />',{html:html});

    if (LinkedinVersion.isRecruiter()) {
      profile_main_content = $html.find("#profile-ugc").html();
    } else {
      profile_main_content = $html.find("#background").html();
    }

    return profile_main_content;
  },

  // COMPLETE PARSING
  parse: function(html, callback) {
    parsed_profile = new Array;

    full_name_array = this.getFullName(html).split(" ");

    // First name
    parsed_profile['first_name'] = full_name_array[0];
    full_name_array.shift();

    // Last name
    parsed_profile['last_name'] = full_name_array.join(" ");

    // Position
    parsed_profile['position'] = this.getPosition(html);

    // Company name
    parsed_profile['last_company'] = this.getLastCompany(html);

    // Company path
    parsed_profile['last_company_path'] = this.getLastCompanyPath(html);

    // Company ID
    parsed_profile['last_company_id'] = this.getLastCompanyID(parsed_profile['last_company_path']);

    // Main content
    parsed_profile['profile_main_content'] = this.getMainProfileContent(html);

    // LinkedIn URL
    parsed_profile['linkedin_url'] = this.getLinkedinUrl(html);

    // Country code
    parsed_profile['country_code'] = this.getCountryCode(html);

    // Count the fact that a profile has been seen to display the warning at a
    // good moment and avoid to be blocked by LinkedIn
    if (parsed_profile['last_company'] != "") {
      LinkedinUsageWarning.countOneProfileView();
    }

    return callback(parsed_profile);
  }
}
