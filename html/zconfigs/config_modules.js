////////////////////////////////
//
// config_modules
//
////////////////////////////////

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
var CD_enableFeedback = false;
var CD_feedbackQuestion = 'How would you describe your experience with us?';
var CD_feedbackThanks   = 'Thank you for your valued Feedback!';
var CD_feedbackButtons = [];
    CD_feedbackButtons.push({positive:"GOOD",tag:"good"});
    CD_feedbackButtons.push({neutral:"Ok",tag:"ok"});
    CD_feedbackButtons.push({negative:"Bad",tag:"bad"});
    CD_feedbackButtons.push({none:"None",tag:"none"});
//var CD_feedbackButton_Positive = 'GOOD';
//var CD_feedbackButton_Negative = 'Bad';
//var CD_feedbackButton_Neutral  = 'Ok';
//var CD_feedbackButton_None     = 'None';


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
