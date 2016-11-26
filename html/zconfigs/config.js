////////////////////////////////
//
// config
//
////////////////////////////////

//
// Some code requires a certain version of SambaPOS
// this will let the code decide how certain functions are called
// For example, GQL Authorization was added in .61+ so if the version
// set here is less than that, the Auth function will be bypassed
// However, if the version set here is less than that and you
// are running .61+, all GQL functions will fail,
// because GQL REQUIRES Auth in .61+
//
// DEPRECATED as of 2016-11-23 : this variable no longer has any meaning
//
var SambaPOS = '5.1.61';

//
// If you have a PHP-enabed site, set this to true
// this will tell the code to try to use a Local IP lookup
// which is contained in the file: /zjs/lib/ipinfo.php
// Setting this to false will tell the code to use a Remote IP lookup service
// This applies to User Authorization Bypass by IP address
//
var PHP = true;


// derive Server information from Address Bar
var webHost  = location.hostname;  // myServer.com
var webPort  = location.port;      // blank assumes port 80
var webPath  = location.pathname;  // might be like /app/mysite/blah
var webParm  = location.search;    // things after '?', like ?module=customer_display
var webProto = location.protocol;  // usually http: or https:

var webUrl   = webProto + '//' + webHost + (location.port ? ':'+location.port : '') + webPath;

// Message Server
var msgsrv = webHost;

// GraphQL server
var GQLhost = msgsrv;
var GQLport = '9898'; // generally, this is the only parameter that might need to change
var GQLpath = '/api/graphql/';
var GQLurl  = webProto + '//' + GQLhost + ':' + GQLport + GQLpath;

// SIGNALR server
var SIGNALRhost = msgsrv;
var SIGNALRport = GQLport;
var SIGNALRpath = '/signalr';
var SIGNALRhubs = '/signalr/hubs/';
var SIGNALRurl  = webProto + '//' + SIGNALRhost + ':' + SIGNALRport + SIGNALRpath;
var SIGNALRhub  = webProto + '//' + SIGNALRhost + ':' + SIGNALRport + SIGNALRhubs;


// set default User and Terminal to use if Authentication is Bypassed
var defaultUser = 'Admin';
var defaultTerminal = 'Server';

// static settings for Terminal and User, will be overwritten if Authentication is activated
var currentUser     = defaultUser;
var currentTerminal = defaultTerminal;


// the Favorite icon, the icon in the top-left, and an animated spinner
var favico    = 'images/icons/favicon.ico';
var icon      = 'images/icons/favicon-blue.png';
var busyWheel = '<img src="images/progresswheel.gif" alt="please wait" />';


//
// Locale/Regional/Language Settings
//

// define your number thousands separator and decimal separator
// used as part of isNumeric detection, mainly for Reports Module
var sepThousand = ',';
var sepDecimal  = '.';

// Dates and Times
// allowable date/time formats to help the moment.js library
var dateFormats = [moment.ISO_8601,"YYYY-MM-DD","YYYY-MM-DD HH:mm","YYYY-MM-DD HH:mm:ss","MM/DD/YYYY","MM/DD/YYYY HH:mm","MM/DD/YYYY HH:mm:ss","DD/MM/YYYY","DD/MM/YYYY HH:mm","DD/MM/YYYY HH:mm:ss"];
// set Month and Day names
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
var myDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    myDays = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
