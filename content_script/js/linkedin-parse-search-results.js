LinkedInSearchResults = {
  parse: function(html, response) {
    var profiles = new Array;

    if (LinkedinVersion.isSalesNavigator()) {
      // Sales Navigator
      $("#results-list .result").each(function(index) {
        if ($(this).find(".profile-link").attr("href").indexOf("OUT_OF_NETWORK") == -1 || ($(this).find(".degree-icon").length && $(this).find(".degree-icon").text() != "YOU")) {
          profile_path = $(this).find(".profile-link").attr("href");
          profile_name = $(this).find(".name a").text();
          profile_id = profile_name.hashCode();
          profiles.push({ "profile_path":  profile_path,
                          "profile_name": profile_name,
                          "profile_id": profile_id });
        }
      });
    } else if (LinkedinVersion.isRecruiter()) {
      // TO DO : compatibility with LinkedIn Recruiter
    }
    else {
      // Standard LinkedIn
      $(".result.people").each(function(index) {
        if ($(this).find(".result-image").attr("href").indexOf("OUT_OF_NETWORK") == -1 || ($(this).find(".degree-icon").length && $(this).find(".degree-icon").text() != "YOU")) {
          profile_path = $(this).find(".title").attr("href");
          profile_name = $(this).find(".main-headline").text();
          profile_title = $(this).find(".description").text();
          profile_pic = $(this).find(".entity-img").attr("src");
          profile_id = profile_name.hashCode();
          profiles.push({ "profile_path":  profile_path,
                          "profile_name": profile_name,
                          "profile_title": profile_title,
                          "profile_pic": profile_pic,
                          "profile_id": profile_id });
        }
      });
    }

    response(profiles);
  }
}
