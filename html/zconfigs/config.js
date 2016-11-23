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
var GQLport = '9000'; // generally, this is the only parameter that might need to change
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
    
// User PIN Authentication settings
// If allowBypass and bypassAllAuth or bypassIPs matched,
// then defaultUesr will be used to Authenticate,
// UNLESS the user EXPLICITLY Logs Out using the Logout link on the TerminalInfo screen.
// If the user EXPLICITLY Logs Out, then Authentication will validate against an entered PIN.
var allowAuthBypass = true;  // allow Bypass of Authentication
var bypassAllAuth = false;   // Bypass ALL Authentication.  If set to true then defaultUser will be used to Authenticate, UNLESS the user EXPLICITLY Logs Out.
var bypassIPs = [];          // if not Bypassing ALL Authentication, list the IPs that are allowed to bypass Authentication.
    // if one of listed IPs are matched, then defaultUser will be used to Authenticate, UNLESS the user EXPLICITLY Logs Out.
    bypassIPs.push('::1'); // localhost IPv6
    bypassIPs.push('127.0.0.1'); // localhost IPv4




//
// Module Settings
//

// you can change the location of the Modules and set this variabe to match
var modulePath = 'modules/';

// control which Modules are available, and the order in which they appear on the Main Menu
var availableModules = [];
    availableModules.push('Customer Display');
    availableModules.push('Kitchen Display');
    availableModules.push('Ticket Explorer');
    availableModules.push('CHAT');
    availableModules.push('Timeclock');
    availableModules.push('Timeclock Policies');
//    availableModules.push('Punch Editor');
    availableModules.push('Task Editor');
    availableModules.push('Reports');
    availableModules.push('POS');

// set default Module if no module is supplied in the URL
var module = 'main_menu';

// Customer Display
var CD_ChangeDueTimeOut = 15000; // milliseconds to display Change Due
// these defaults will be overwritten by values set in Server Terminal Rule Automation (BUS_ Rules) (if it is set up), and they are used only in the Customer Display Module
var CD_businessName   = 'My Awesome Restaurant'; // not currently used
var CD_venueName      = 'My Awesome Restaurant';
var CD_welcomeMessage = 'Welcome to';
var CD_openMessage    = 'We are Open!';
var CD_closedMessage  = 'We are Closed.';

// POS
var menuName        = 'Menu';
var departmentName  = 'Restaurant';
var ticketTypeName  = 'Ticket';
var POS_EntityTypes = ['Tables','Customers'];
var POS_EntityTypesAuto = false; // override static Entity Types above with automatic Ticket Type Entity Types
var POS_PrintJobs   = ['Print Bill','Print Orders to Kitchen Printer'];

// Kitchen Display
var KD_HTMLtaskType = 'KD Task - Food';     // the KD Module works with this Task Type
var KD_GUItaskType  = 'KD Task GUI - Food'; // optionally update the Task Type used in Custom Entity Screen using Task Editor Widgets
var KD_interop      = false;                // if you don't have a GUItaskType, set this to false

// Timeclock
var TC_EntityType           = 'Employees';
var TC_EntitySearch         = 'Active'; // checks Entity Custom Data Field called "Status" to display only "Active" Employees
var TC_PunchTaskType        = 'TC Punch Task';
var TC_PunchControlTaskType = 'TC Punch Control Task';
var TC_PolicyTaskType       = 'TC Policy Task';



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
