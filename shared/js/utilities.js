//
// Find if a subdomain can be removed and do it
//
function withoutSubDomain(domain) {
  var subdomainsCount = (domain.match(/\./g) || []).length;
  if (subdomainsCount > 1) {
    newdomain = domain;
    newdomain = newdomain.substring(newdomain.indexOf(".") + 1);

    if (newdomain.length > 6) {
     return newdomain;
    }
    else {
      return false;
    }
  }
  return false;
}


//
// Add commas separating thousands
//
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


//
// Clean domain functions
//
function cleanDomain(website){
  domain = website.toLowerCase();
  domain = domain.allReplace({'https://': '', 'http://': '', 'www.': ''});
  domain = cleanUrlEnd(domain);

  return domain;
}

function cleanUrlEnd(str) {
  if (str.indexOf('/') != -1) {
    str = str.substring(0, str.indexOf('/'));
  }
  if (str.indexOf('?') != -1) {
    str = str.substring(0, str.indexOf('?'));
  }

  return str;
}


//
// Open in a new tab
//

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}


//
// Search and replace several elements in a string
//
String.prototype.allReplace = function(obj) {
  var retStr = this
  for (var x in obj) {
    retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
  }
  return retStr
}


//
// Generate a hash from a string
//

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


//
// Clean the name by removing some titles
//

function cleanName(full_name) {
  if (full_name.split(/\s+/).length > 2) {
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
  } else {
    return full_name;
  }
}


//
// Search the email addresses in a given string
//

function parseProfileEmailAddresses(string) {
  return string.match(/([a-zA-Z][\w+\-.]+@[a-zA-Z\d\-]+(\.[a-zA-Z]+)*\.[a-zA-Z]+)/gi);
}


//
// Date today in string
//

function weekTodayString() {
  date = new Date()
  return date.getFullYear() + "-" + date.getWeekNumber()
}


//
// Get the number of the week
//

Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
}


//
// Limit length of a string
//

function limitLength(string, length) {
  if(string.length > length) {
    string = string.substring(0, length - 1) + "...";
  }

  return string;
}
