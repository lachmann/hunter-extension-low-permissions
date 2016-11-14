var LinkedinCompany = {

  // WEBSITE
  getWebsite: function(html) {
    if (LinkedinVersion.isSalesNavigator()) {
      html = $(html).find("code").last().html();
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["account"]["website"];
    } else if(LinkedinVersion.isRecruiter()) {
      html = $(html).find("#page-data").html();
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["company"]["websiteUrl"];
    }
    else {
      if (typeof $(html).find(".website a").text() != "undefined" && $(html).find(".website a").text() != "") {
        return $(html).find(".website a").text();
      }
      else if (typeof $(html).find("code").last().html() != "undefined") {
        html = $(html).find("code").last().html()
        json = html.replace("<!--", "").replace("-->", "");

        try { return JSON.parse(json)["website"]; }
        catch(e) { return ""; }
      }
      else {
        return "";
      }
    }
  },

  // EMPLOYEES
  getEmployees: function(html) {
    if (LinkedinVersion.isSalesNavigator()) {
      html = $(html).find("code").last().html();
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["account"]["fmtSize"];
    } else if(LinkedinVersion.isRecruiter()) {
      // TO DO
      return "";
    }
    else {
      if (typeof $(html).find(".company-size p").text() != "undefined" && $(html).find(".company-size p").text() != "") {
        return $(html).find(".company-size p").text();
      }
      else if (typeof $(html).find("code").last().html() != "undefined") {
        html = $(html).find("code").last().html()
        json = html.replace("<!--", "").replace("-->", "");

        try { return JSON.parse(json)["size"]; }
        catch(e) { return ""; }
      }
      else {
        return "";
      }
    }
  },

  // INDUSTRY
  getIndustry: function(html) {
    if (LinkedinVersion.isSalesNavigator()) {
      html = $(html).find("code").last().html();
      json = html.replace("<!--", "").replace("-->", "");
      return JSON.parse(json)["account"]["industry"];
    } else if(LinkedinVersion.isRecruiter()) {
      // TO DO
      return "";
    }
    else {
      if (typeof $(html).find(".industry p").text() != "undefined" && $(html).find(".industry p").text() != "") {
        return $(html).find(".industry p").text();
      }
      else if (typeof $(html).find("code").last().html() != "undefined") {
        html = $(html).find("code").last().html()
        json = html.replace("<!--", "").replace("-->", "");

        try { return JSON.parse(json)["industry"]; }
        catch(e) { return ""; }
      }
      else {
        return "";
      }
    }
  },

  // Access the company page and parse it
  get: function(profile, callback) {
    this_company = this
    if (typeof profile["domain"] == "undefined") {
      if (typeof profile["last_company"] != "undefined" && typeof profile["last_company_path"] != "undefined") {
        if (profile["last_company_path"].indexOf("linkedin.com") > -1) {
          linkedin_company_page = profile["last_company_path"];
        } else {
          linkedin_company_page = "https://www.linkedin.com" + profile["last_company_path"];
        }
        $.ajax({
          url : linkedin_company_page,
          type : 'GET',
          success : function(response){
            website = this_company.getWebsite(response);
            company_size = this_company.getEmployees(response);
            company_industry = this_company.getIndustry(response);
            if (typeof website == "undefined" || website == "http://" || website == "http://N/A" || website == false) {
              $.ajax({
                url : "https://autocomplete.clearbit.com/v1/companies/suggest?query="+profile.last_company,
                type : 'GET',
                success : function(response){
                  if (typeof response[0] != "undefined" && typeof response[0].domain != "undefined") {
                    website = "http://" + response[0].domain;
                    callback({website: website, company_size: company_size, company_industry: company_industry});
                  }
                  else {
                    callback("none");
                  }
                },
                error : function() {
                  callback("none");
                }
              });
            }
            else {
              callback({website: website, company_size: company_size, company_industry: company_industry});
            }
          },
          error : function() {
            callback("none");
          }
        });
      }
      else {
        callback("none");
      }
    }
    else {
      callback({website: profile["domain"], company_size: profile["company_size"], company_industry: profile["company_industry"]});
    }
  }
}


//
// Link to search by location have this form:
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
