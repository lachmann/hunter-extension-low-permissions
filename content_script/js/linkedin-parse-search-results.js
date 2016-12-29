
LinkedInSearchResults = {
  parse: function(html, response) {
    var profiles = new Array;
    var outOfNetProfiles = new Array;



    if (LinkedinVersion.isSalesNavigator()) {
      // Sales Navigator
      $("#results-list .result").each(function(index) {
        if ($(this).find(".profile-link").attr("href").indexOf("OUT_OF_NETWORK") == -1 || ($(this).find(".degree-icon").length && $(this).find(".degree-icon").text() != "YOU")) {
          profile_path = $(this).find(".profile-link").attr("href");
          profile_name = $(this).find(".name a").text();
          profile_title = $(this).find(".company-name").text();
          if (typeof $(this).find(".entity-image").attr("data-li-src") == "undefined") { profile_pic = "https://www.gravatar.com/avatar/5e77b3f1a14972adadd3f32f5a0b217e?s=100&d=mm"; }
          else { profile_pic = "https://www.linkedin.com/"+$(this).find(".entity-image").attr("data-li-src"); }
          profile_id = profile_name.hashCode();
          profiles.push({ "profile_path":  profile_path,
                          "profile_name": profile_name,
                          "profile_title": profile_title,
                          "profile_pic": profile_pic,
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
        } else {
            var profile_title = $(this).find(".description").text();
            var profile_pic = $(this).find(".entity-img").attr("src");
            var google_qurl = "https://www.google.fr/search?q=" + profile_title + " site:linkedin.com";

            var profile = {
                "profile_title": profile_title,
                "google_qurl": google_qurl,
                "profile_pic": profile_pic,
            };
            console.log("Yeah yeah");
            outOfNetProfiles.push(profile);
        }
      });
    }

    response({'accessible': profiles, 'inaccessible': outOfNetProfiles});
  }
}
