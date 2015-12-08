// Counts the main actions made with the extension to know which features
// are the most successful
//
// Analytics are made with StatHat
//

function eventTrack(eventName) {
  url = "https://api.stathat.com/ez?ezkey=antoine@emailhunter.co&stat="+eventName;
  $.ajax({
    url : url,
    type : 'GET',
    dataType : 'json',
    success : function(json){
      // Done!
    }
  });
}
