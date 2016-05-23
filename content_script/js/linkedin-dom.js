//
// --- linkedin-profile-dom.js ---
//
// Every element depending on Linkedin DOM on profiles is put in this file.
// This should be updated on regular basis to make sure it works in every cases.
// Linkedin DOM changes depending on the type of account (free or premium
// versions like Sales Navigator or Recruiting)
//
// The detection of the version is made in the file linkedin-verson.js.
//


//
// Get first name, last name
//

function getFullName(html) {
  var $html = $('<div />',{html:html});

  if (isRecruiter()) {
    var full_name = $html.find("title").text();
  }
  else {
    var full_name = $html.find("title").text().substring(0, $html.find("title").text().indexOf(" |"));
  }

  return cleanName(full_name);
}


//
// Get last company
//

function getLastCompany(html) {
  var $html = $('<div />',{html:html});

  if (isSalesNavigator()) {
    last_company = $html.find(".company-name").first().text();
  } else if (isRecruiter()) {
    last_company = $html.find(".position-header h5").first().text();
  }
  else {
    last_company = $html.find(".current-position h5:last-child a").first().text();
  }

  return last_company;
}

function getLastCompanyPath(html) {
  var $html = $('<div />',{html:html});

  if (isSalesNavigator()) {
    last_company_path = $html.find(".company-name a").first().attr("href");
  } else if (isRecruiter()) {
    if (typeof($html.find(".position-header h5 a").first().attr("href")) != "undefined" &&
        $html.find(".position-header h5 a").first().attr("href").indexOf("search?") == -1) {
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
}


//
// Get position
//

function getPosition(html) {
  var $html = $('<div />',{html:html});

  if (isSalesNavigator()) {
    position = $html.find(".position-title").first().text(); // TO DO
  }
  else if (isRecruiter()) {
    position = $html.find(".position-header h4 a").first().text();
  }
  else {
    position = $html.find(".current-position h4 a").first().text();
  }

  return position;
}

//
// Get LinkedIn URL
//

function getLinkedinUrl(html) {
  var $html = $('<div />',{html:html});

  if (isSalesNavigator()) {
    url = $html.find(".linkedin-logo").next().find("a").text();
  }
  else if (isRecruiter()) {
    url = "https://www.linkedin.com" + $html.find(".public-profile a").attr("href");
  }
  else {
    url = $html.find(".public-profile a").text();
  }

  return url;
}

//
// Get country code
//

function getCountryCode(html) {
  var $html = $('<div />',{html:html});

  if (isSalesNavigator()) {
    country_code = "";
  }
  else if (isRecruiter()) {
    country_code = "";
  }
  else {
    path = $html.find(".locality a").attr("href");
    country_code = extractCountryCodeFromSearchPath(path);
  }

  return country_code;
}


//
// Link to search by loacation have this form:
// /vsearch/p?countryCode=gb&trk=prof-0-ovw-location
//
// This function help to extract the country code. In this example: "GB".
//

function extractCountryCodeFromSearchPath(path) {
  if (typeof path != "undefined") {
    if (path.indexOf("countryCode=") != -1) {
      pos = path.indexOf("countryCode=");
      country_code = path.substring(pos + 12, pos + 14);
    }
    else if (path.indexOf("f_G=") != -1) {
      pos = path.indexOf("f_G=");
      country_code = path.substring(pos + 4, pos + 6);
    }
  }
  else {
    country_code = "";
  }

  return country_code.toUpperCase();
}


//
// Profile main content
// Used to find email addresses directly available on the profile.
//
// Recruiter : $("#profile-ugc")
// Sales Navigator : $("#background")
// Free LinkedIn : $("#background")
//

function getMainProfileContent(html) {
  var $html = $('<div />',{html:html});

  if (isRecruiter()) {
    profile_main_content = $html.find("#profile-ugc").html();
  } else {
    profile_main_content = $html.find("#background").html();
  }

  return profile_main_content;
}


//
// Website parse in company page
//

function websiteFromCompanyPage(html) {
  if (isSalesNavigator()) {
    html = $(html).find("code").last().html();
    json = html.replace("<!--", "").replace("-->", "");
    return JSON.parse(json)["account"]["website"];
  } else if(isRecruiter()) {
    html = $(html).find("#page-data").html();
    json = html.replace("<!--", "").replace("-->", "");
    return JSON.parse(json)["company"]["websiteUrl"];
  }
  else {
    if (typeof $(html).find(".website a").text() != "undefined" && $(html).find(".website a").text() != "") {
      return $(html).find(".website a").text();
    }
    else {
      html = $(html).find("code").last().html()
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["website"];
    }
  }
}


//
// Size parse in company page
//

function employeesFromCompanyPage(html) {
  if (isSalesNavigator()) {

  } else if(isRecruiter()) {

  }
  else {
    if (typeof $(html).find(".company-size p").text() != "undefined" && $(html).find(".company-size p").text() != "") {
      return $(html).find(".company-size p").text();
    }
    else {
      html = $(html).find("code").last().html()
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["size"];
    }
  }
}


//
// Clean the name by removing some titles
//

function cleanName(full_name) {
  String.prototype.allReplace = function(obj) {
      var retStr = this;
      for (var x in obj) {
          retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
      }
      return retStr;
  };

  return full_name.allReplace(
    {
      ',? Jr.?': '',
      ',? Sr.?': '',
      ',? MBA': '',
      ',? CPA': '',
      ',? PhD': '',
      ',? MD': '',
      ',? MHA': '',
      ',? CGA': '',
      ',? ACCA': '',
      ',? PMP': '',
      ',? MSc': ''
    }
  );
}


//
// Check if we are on a profile or the search
// Check our own tags (popups) to avoid more dependences with LinkedIn
//

function linkedinPageType() {
  if ($("#eh_popup").length) {
    return "profile";
  }
  else if ($("#eh_search_selection_popup").length) {
    return "search";
  }
  else {
    return "other";
  }
}



//
// Launch the parsing when everything is ready (in linkedin-button.js)
//

function parseLinkedinProfile(html, callback) {
  parsed_profile = new Array;

  full_name_array = getFullName(html).split(" ");

  // First name
  parsed_profile['first_name'] = full_name_array[0];
  full_name_array.shift();

  // Last name
  parsed_profile['last_name'] = full_name_array.join(" ");

  // Position
  parsed_profile['position'] = getPosition(html);

  // Company name
  parsed_profile['last_company'] = getLastCompany(html);

  // Company path
  parsed_profile['last_company_path'] = getLastCompanyPath(html);

  // Main content
  parsed_profile['profile_main_content'] = getMainProfileContent(html);

  // LinkedIn URL
  parsed_profile['linkedin_url'] = getLinkedinUrl(html);

  // Country code
  parsed_profile['country_code'] = getCountryCode(html);

  return callback(parsed_profile);
}
