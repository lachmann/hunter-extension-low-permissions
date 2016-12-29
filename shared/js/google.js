// Parse google search result page and get the first profile result
// We're only interested in the link and the name of the person here
//
//


function parseResultsPage(html) {

    var search = $(html).find('#search');
    var firstResult = $(search).find('.g');  // '#search'));
    var firstLink = $(firstResult).find('a');  // , firstResult)
    var profileUrl = firstLink.getAttribute('data-href');
    var title = firstLink.text;
    var splitTitle = title.split(' | ');
    if ((splitTitle.length > 1) && (splitTitle[1] == "LinkedIn")) {
        var profileName = splitTitle[0];
    } else {
        var profileName = "Not Found";
    }

    profileId = profileName.hashCode();
    profile = {
        "profile_path":  profileUrl,
        "profile_name": profileName,
        "profile_id": profileId 
    };
    return profile;

}
