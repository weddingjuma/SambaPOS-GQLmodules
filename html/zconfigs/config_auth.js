////////////////////////////////
//
// config_auth
//
////////////////////////////////

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
    bypassIPs.push('192.168.1.190');
    bypassIPs.push('192.168.0.4');
    bypassIPs.push('192.168.0.5');
    //bypassIPs.push('192.168.0.72');
    bypassIPs.push('192.168.1.197');
