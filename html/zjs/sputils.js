////////////////////////////////
//
// sputils
//
////////////////////////////////

// define SambaPOS Utils Object
var spu = {};


spu.focused = function() {
    var focused = document.activeElement;
    if (!focused || focused == document.body) {
        focused = null;
    } else if (document.querySelector) {
    focused = document.querySelector(":focus");
    }
    return focused;
};

spu.consoleLog = function (msg, vals) {
    if (vals) {
    }
    //var when  = new Date();
    var when = '['+formatDateTime(new Date(),true)+'] ';
    console.log(when+msg);
};
spu.fi = function(args) {
    var arglist = '';
    for (var a=0; a<args.length; a++) {
        arglist += (a==0 ? '' : ',');
        arglist += (typeof args[a]=='string' ? "'"+args[a]+"'" : (typeof args[a]!=='undefined' ? args[a].toString().substr(0,20).replace(/\r\n/g,'') : 'error reading function'));
    }
    var retval = '___FUNC___: ' + args.callee.name + '('+arglist+') from ' + (args.callee.caller.name=='' ? '[anonFunc]' : args.callee.caller.name);
    spu.consoleLog(retval);
    return retval;
};
spu.debounce = function (func, wait, immediate) {
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};


spu.throttle = function (fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

spu.refreshMoments = function () {
    nowDate        = moment().format("YYYY-MM-DD");
    nowDateLessDay = moment().subtract(1,'days').format("YYYY-MM-DD");
    nowTime        = moment().format("HH:mm:ss");
    nowDateTime    = moment().format("YYYY-MM-DD HH:mm:ss");
    today          = moment().format("YYYY-MM-DD");
    tomorrow       = moment().add(1,'days').format("YYYY-MM-DD");
    todayStart     = moment().format("YYYY-MM-DD" + " 00:00:00");
    todayEnd       = moment().add(1,'days').format("YYYY-MM-DD" + " 00:00:00");
    yesterday      = moment().subtract(1,'days').format("YYYY-MM-DD");
    yesterdayStart = moment().subtract(1,'days').format("YYYY-MM-DD" + " 00:00:00");
    yesterdayEnd   = moment().format("YYYY-MM-DD" + " 00:00:00");
    weekStart      = moment().subtract(7,'days').format("YYYY-MM-DD");
    weekEnd        = moment().format("YYYY-MM-DD");
    weekPastStart  = moment().subtract(14,'days').format("YYYY-MM-DD");
    weekPastEnd    = moment().subtract(7,'days').format("YYYY-MM-DD");
    monthStart     = moment().startOf('month').format("YYYY-MM-DD");
    monthEnd       = moment().endOf('month').format("YYYY-MM-DD");
    monthPastStart = moment().startOf('month').subtract(1,'months').format("YYYY-MM-DD");
    monthPastEnd   = moment().endOf('month').subtract(1,'months').format("YYYY-MM-DD");
    yearStart      = moment().startOf('year').format("YYYY-MM-DD");
    yearEnd        = moment().endOf('year').format("YYYY-MM-DD");
    yearPastStart  = moment().startOf('year').subtract(1,'years').format("YYYY-MM-DD");
    yearPastEnd    = moment().endOf('year').subtract(1,'years').format("YYYY-MM-DD");

    date = new Date();
    day = date.getDate();
    month = date.getMonth();
    thisDay = date.getDay(),
    thisDay = myDays[thisDay];
    yy = date.getYear();
    year = (yy < 1000) ? yy + 1900 : yy;
    
    spu.consoleLog('TIMERS> Refreshed Moments.');
};

spu.hideHeader = function () {
    // if the page is running inside SambaPOS HTML Viewer Widget
    // get rid of Top and Bottom bars
    $( "#top" ).hide();
    $( "#containerMODULE" ).css({"padding-top":"0"});
    $( "#footer" ).hide();
    $( "#footer" ).css({"margin-top":"0"});
    // expand main section to full height
    $( "#containerMain" ).css({"height":"100%"});
    // reports don't need bottom margin
    $( "#REP_Report" ).css({"margin-bottom":"0px"});
    // command buttons can drop down
    $( "#TC_EntityCommands" ).css({"bottom":"0px"});
    $( "#TSK_Commands" ).css({"bottom":"0px"});
};

spu.getEmbeddedUserTerminal = function () {
    // these methods are only available if the page is running inside
    // the SambaPOS HTML Viewer Widget.  They are meant to grab the 
    // {:CURRENTTERMINAL} and {:CURRENTUSER} from within SambaPOS
    //window.external.ExecuteAutomationCommand('HUB Set Terminal and User','');
    currentTerminal = window.external.GetLocalSettingValue('currentTerminal');
    currentUser = window.external.GetLocalSettingValue('currentUser');
    //alert('T:'+currentTerminal+'\r\nU:'+currentUser);

};

spu.getBusinessSettings = function () {
    getGlobalSetting('BUS_BusinessName', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            CD_businessName = setting.value;
        }
    });
    getGlobalSetting('BUS_VenueName', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            CD_venueName = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Welcome', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            CD_welcomeMessage = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Open', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            CD_openMessage = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Closed', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            CD_closedMessage = setting.value;
        }
    });
};

spu.executeAutomationCommand = function(name,value) {
//    alert('execcmd3:'+name+'/'+value);
    window.external.ExecuteAutomationCommand(name,value);
};


spu.validateUser = function (user, pin, callback) {
    spu.consoleLog('USER Validating ...');
    
    //$('#numpad').append('<div class="info-message">Validating, please Wait...<br /><br />'+busyWheel+'</div>');
    getReportVars('GQLM Users','', function u(data){

        users = data;
            
        var userValidated = false;
        var bypassIPmatch = false;
        var bypasspasshash = false;
//        var userLogout = false;
        
        if (bypassAllAuth) {
            spu.consoleLog('USER ALL AUTHENTICATION IS BYPASSED!');
            $('#USER_Auth').hide();
            currentUser = currentUser=='' || currentUser=='undefined' || typeof currentUser==='undefined' ? defaultUser : currentUser;
            for (var u=0; u<users.length; u++) {
                if (currentUser == users[u].name) {
                    bypasspasshash = users[u].PIN.toUpperCase();
                    break;
                }
            }
        }
        
        getClientIP(true, function ipg(data) {

            clientIP = data;
            spu.consoleLog('USER CLIENT IP: ' +clientIP);

            for (var i=0; i<bypassIPs.length; i++) {
                if (clientIP == bypassIPs[i]) {
                    bypassIPmatch = (allowAuthBypass ? true : false);
                    spu.consoleLog('USER Validation Bypass for: ' + bypassIPs[i]);
                    $('#USER_Auth').hide();
                    break;
                }
            }
                
            if (bypassIPmatch && allowAuthBypass && !bypassAllAuth) {
                currentUser = currentUser=='' || currentUser=='undefined' || typeof currentUser==='undefined' ? defaultUser : currentUser;
                for (var u=0; u<users.length; u++) {
                    if (currentUser == users[u].name) {
                        bypasspasshash = users[u].PIN.toUpperCase();
                        break
                    }
                }
            }
            
            if (!currentUserData.validated || !currentUserData.name || !currentUserData.PIN || currentUserData.PIN == '') {
                
//                userLogout = true;
//                        spu.consoleLog('USER Prompting for PIN ...');
//                        var pin = prompt("Enter PIN:",'');

                var pincookie = clientSetting('phash','','get');
                
                var pin = document.getElementById('USER_inPIN').value;
                document.getElementById('USER_inPIN').value = '';
                var inPINhash = pin=='' ? false : CryptoJS.SHA512(pin).toString().toUpperCase();
                var pinhash  = (pincookie!='' ? pincookie : inPINhash);

                if (bypasspasshash) {
                    pinhash = bypasspasshash;
                }
                
                if (userLogout) {
                    pinhash = inPINhash;
                }
                
                for (var u=0; u<users.length; u++) {
                    var passhash = users[u].PIN.toUpperCase();
                    //spu.consoleLog('USER Checking against Hash: '+passhash);
                    if (pinhash == passhash) {
                        userValidated = true;
                        currentUserData = users[u];
                        $('#USER_Auth').hide();
                        break;
                    }
                }
                
                if (userValidated) {
                    currentUserData.validated = true;
                    currentUser = currentUserData.name;
                    currentUserRole = currentUserData.role;
                    $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
                    $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
                    spu.consoleLog('USER Validated: '+currentUserData.name);
                    clientSetting('userName',currentUserData.name,'set');
                    clientSetting('userRole',currentUserData.role,'set');
                    clientSetting('phash',pinhash,'set');
                    if (userLogout) {
                        // registerTerminal(terminal,department,ticketType,user,reRegister)
                        registerTerminal(POS_Terminal.name,departmentName,ticketTypeName,currentUser,true, function rereg(data) {
                            var term = data;
                            if (term.registered) {
                                spu.consoleLog('TERMINAL Re-registered ['+term.name+'] with Validated User ['+currentUser+']: '+term.id);
                                userLogout = false;
                                if (callback) {
                                    callback(currentUserData);
                                }
                            }
                        });
                    }
                    
                } else {
                    spu.consoleLog('USER Validation FAILED: '+currentUser);
                }
                
            } else {
                spu.consoleLog('USER Validated from Cache: '+currentUserData.name);
                $('#USER_Auth').hide();
            }

            if (callback) {
                callback(currentUserData);
            }

        });

    });
};

function logoutUser (validate, callback) {
    validate = typeof validate ==='undefined' ? false : validate;
    spu.consoleLog('USER Logging out (validate='+validate+') ...');
    
    userLogout = true;
    
    clientSetting('userName','','del');
    clientSetting('userRole','','del');
    clientSetting('phash','','del');
    
    $('#USER_Auth').show();
    document.getElementById('USER_inPIN').value = '';
    document.getElementById('USER_inPIN').focus();
    
    currentUserData = {};
    currentUserData.name = 'unknownUser';
    currentUserData.role = '';
    currentUserData.PIN = '';
    currentUserData.validated = false;
    
    currentUser = defaultUser;
    $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
    $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
    
    if (validate) {
        spu.validateUser();
    }
    
    if (callback) {
        callback();
    }
//    spu.getUsers(function u(data){
//        users = data;

//        spu.validateUser('','',function v(vdata){
//            var user = vdata;
//            spu.consoleLog(user.name+(user.validated ? '' : ' NOT')+' validated.');
//        });
        
//    });
}


function session_id_old() {
    return /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
}
function session_id(){
    var fn = spu.fi(arguments);
    return clientSetting('SESSIONID',randomString(32,'aA#'),'get');
}
function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}

function updatePageTitle(modscreen) {
    var currentTitle = $(document).prop('title');
    var sepPos = currentTitle.indexOf(' ~ ') + 3;
    var newTitle = modscreen.replace(/_/g,' ').toUpperCase() + ' ~ ' + currentTitle.substr(sepPos,currentTitle.length-sepPos);
    $(document).prop('title',newTitle);
}

function getReportVars(reportName,reportParameters, callback) {
    var fn = spu.fi(arguments);
    var parmList = typeof reportParameters==='undefined' || reportParameters==='' ? '' : reportParameters;
    var parms = '';
    for (var p=0; p<parmList.length; p++) {
        parms += '{name:"'+(p+1)+'",value:"'+parmList[p]+'"}';
        parms += (p===parmList.length-1 ? '' : ',');
    }
    spu.consoleLog('Getting ReportVars ['+reportName+']...');
    
    var user = typeof currentUser==='undefined' || currentUser=='undefined' || currentUser=='' ? defaultUser : currentUser;
    //                           reportName,user,dateFilter,startDate,endDate,parameters
    gql.EXEC(gql.getCustomReport(reportName,user,'','','',parms), function rep(response){
        if (response.errors) {
            gql.handleError(fn+" gql.getCustomReport", response);
        } else {
            var report = response.data.report;
            var table = report.tables[0];
            var columns = table.columns;

            var rows = table.rows;
            var rowCount = rows.length;
            
            var dataArray = [];

            for (var r=0; r<rowCount; r++) {
                var row = rows[r];
                var cells = row.cells;
                var cellCount = cells.length;
                var dataRow = {};
                for (var c=0; c<cellCount; c++) {
                    var dataName = columns[c].header;
                    var dataValue = cells[c];

                    switch (dataName) {
                        case 'template':
                            var template = hex2string(dataValue);
                            template = template.replace(/\r\n/g,'LINEBREAK');
                            template = template.replace(/"/g,'\"');
                            // get columnCount and ColWidths
                            var headBeg = template.indexOf('[');
                            var headEnd = template.indexOf(']');
                            var head = template.substring(headBeg,headEnd+1);
                            var colStart = head.indexOf(':');
                            var cols = head.substr(colStart+1,(head.length-colStart-2));
                            var hasParms = (template.indexOf('$') > -1 ? '1' : '0');
                            dataRow.hasParms = hasParms;
                            dataRow.head = head;
                            dataRow.cols = cols;
                            dataRow.template = template;
                            break;
                        default:
                            dataRow[dataName] = dataValue;
                            break;
                    }
                }

                dataArray.push(dataRow);
            }

            spu.consoleLog('Got ReportVars ['+reportName+']: ' + dataArray.length);

            if (callback) {
                callback(dataArray);
            }
        }
    });
    
}

navigator.sayswho= (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

function getBatteryLevel() {
    if (isiDevice || navigator.sayswho.indexOf('IE ') > -1) {
        //
        $('#battery').html('');
        clearInterval(batteryTimer);
    } else {
        navigator.getBattery().then(function(battery) {

            var battLevel = battery.level * 100;
            $('#battery').html(battLevel.toFixed(0)+'%');

            return battLevel;
        });
    }
}

function doOnClick(elemID) {
    $('#'+elemID).click();
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function isNumericWithSep(n,sep) {
    var regex = new RegExp(sep, "g");
    n = n.replace(regex,'');
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function isPercent(n) {
  return n.indexOf('%')!==-1 ? true : false;
}
function isDate(val) {
    //var formats = [moment.ISO_8601,"YYYY-MM-DD","YYYY-MM-DD HH:mm","YYYY-MM-DD HH:mm:ss","MM/DD/YYYY","MM/DD/YYYY HH:mm","MM/DD/YYYY HH:mm:ss","DD/MM/YYYY","DD/MM/YYYY HH:mm","DD/MM/YYYY HH:mm:ss"];
    var formats = dateFormats;
    return moment(val, formats, true).isValid();
//    var d = new Date(val);
//    return !isNaN(d.valueOf());
}
function isTime(val) {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(val);
    return isValid;
}
function isBoolean(val) {
    if(typeof(val) === "boolean" || val.toLowerCase()=='true' || val.toLowerCase()=='false'){
      return true;
    }
    return false;
}

function showInfoMessage(content) {
    if (document.getElementById('infoMessage')) {
        document.getElementById('infoMessage').innerHTML = content;
        document.getElementById('infoMessage').style.display = 'flex';
    }
}
function showHelpMessage(content) {
    content += '<div class="closeButton" title="click to close" onclick="$(\'#helpMessage\').hide();return false;">X</div>';
    $('#helpMessage').html(content);
    $('#helpMessage').show();
}
function showWarningMessage(content) {
    content += '<div class="closeButton" title="click to close" onclick="$(\'#warningMessage\').hide();return false;">X</div>';
    $('#warningMessage').html(content);
    $('#warningMessage').show();
}
function showErrorMessage(content) {
    content = content.replace(/\\r\\n/g,'<br />');
    content = content.replace(/\\r/g,'<br />');
    content = content.replace(/\\n/g,'<br />');
    content += '<div class="closeButton" title="click to close" onclick="$(\'#errorMessage\').hide();return false;">X</div>';
    $('#errorMessage').html(content);
    $('#errorMessage').show();
}
function showTerminalInfo() {
    var fn = spu.fi(arguments);
    $('#TERM_Info').html('<div class="info-message">Fetching Terminals, please Wait...<br /><br />'+busyWheel+'</div>');
    $('#TERM_Info').show();
    getReportVars('GQLM Terminals','', function tm(data){
        terminals = data;
        
        var content = '';
            content += '<div style="text-align:left;">';

            content += '<div>';
            content += '<div class="TERM_InfoCell_Label">Current User:</div>';
            content += '<div class="TERM_InfoCell_Data">' + currentUser + '</div>';
            content += '<div class="TERM_InfoCell_Command" onClick="$(\'#TERM_Info\').hide();logoutUser();return false;">Logout</div>';
            content += '<div class="TERM_InfoCell_Label">User Role:</div>';
            content += '<div class="TERM_InfoCell_Data">' + currentUserRole + '</div>';
            content += '<div class="TERM_InfoCell_Label">Browser/Agent:</div>';
            content += '<div class="TERM_InfoCell_Data">' + currentTerminal;
//            content += '<div class="TERM_InfoCell_Command" style="text-align:left;font-size:22px;">(Browser/Agent)</div>';
            content += '</div>';

            content += '<div><br />';
            content += '<div class="TERM_InfoCell_Label"><u>Terminals</u></div>';
            content += '<div class="TERM_InfoCell_Data" style="color:#999999;font-size:22px;">(click a Name to register)</div>';
            content += '</div>';
        for (var t=0; t<terminals.length; t++) {
            var term = terminals[t];
            content += '<div>';
    //        content += '<div style="display:inline-block;">' + term.dbId + '</div>:';
            content += '<div class="TERM_TerminalName" onclick="registerTerminal('+"'"+term.name+"','','','',false,showTerminalInfo"+');">' + term.name + '</div>';
            content += '<div class="TERM_InfoCell_Data">' + (POS_Terminal.registered && term.name == POS_Terminal.name ? '['+POS_Terminal.user+']['+POS_Terminal.id.substr(0,5)+'...]' : '' )+ '</div>';
            content += '<div class="TERM_InfoCell_Command">' + (POS_Terminal.registered && term.name == POS_Terminal.name ? '<span onClick="unregisterTerminal(\''+POS_Terminal.id+'\',showTerminalInfo);">Unregister</span>' : '') + '</div>';
            content += '</div>';
        }

        content += '</div>';

        content += '<div class="closeButton" title="click to close" onclick="$(\'#TERM_Info\').hide();return false;">X</div>';
        $('#TERM_Info').html(content);
        //$('#TERM_Info').show();
    });
}

function clearTimers(fromWhere) {
    spu.consoleLog('TIMERS> Clearing Timers from ['+fromWhere+']');
    
    // Set a fake timeout to get the highest timeout id
    var highestIntervalId = setInterval(";");
    for (var i = 0 ; i <= highestIntervalId ; i++) {
        clearInterval(i); 
    }
    spu.consoleLog('TIMERS> Cleared all timers.  Restarting Clock...');
    clockTimer = setInterval(showTime, 500);
    getBatteryLevel();
    batteryTimer = setInterval(getBatteryLevel, 300000); // poll battery level every 5 minutes
}

function countTrafficBytes(payload,payloadType,direction,callback) {
    var pChars = payload;
    var pBytes = encodeURI(payload).split(/%..|./).length - 1;
        pBytes = pBytes / 1024;
    var payLoadPreview = payload.substr(0,70);
    
    switch (payloadType) {
        case 'gql':
            if (direction == 'sent') {
                GQLbytesSent += pBytes;
                GQLbytes += pBytes;
                spu.consoleLog('>>> GQL Payload (total '+GQLbytes.toFixed(2)+' KB), this message (SENT): '+pChars.length+' chars, '+pBytes.toFixed(2)+' KB' + ' ['+payLoadPreview+']');
            }
            if (direction == 'rcvd') {
                GQLbytesRcvd += pBytes;
                GQLbytes += pBytes;
                spu.consoleLog('<<< GQL Payload (total '+GQLbytes.toFixed(2)+' KB), this message (RCVD): '+pChars.length+' chars, '+pBytes.toFixed(2)+' KB' + ' ['+payLoadPreview+']');
            }
            break;
        case 'signalr':
            signalRbytes += pBytes;
            spu.consoleLog('<<< SIGNALR Payload (total '+signalRbytes.toFixed(2)+' KB), this message: '+pChars.length+' chars, '+pBytes.toFixed(2)+' KB' + ' ['+payLoadPreview+']');
            break;
    }

    $('#signalRbytes').html(signalRbytes.toFixed(2));
    $('#GQLbytes').html(GQLbytesSent.toFixed(2)+'/'+GQLbytesRcvd.toFixed(2)+'/'+GQLbytes.toFixed(2));
    
    if (callback) {
        callback();
    }
}

function clearTrafficBytes(bType){
    switch (bType) {
        case 'signalr':
            signalRbytes = 0;
            spu.consoleLog('SIGNALR Payload Counter CLEARED');
            break;
        case 'gql':
            GQLbytesSent = 0;
            GQLbytesRcvd = 0;
            GQLbytes = GQLbytesSent+GQLbytesRcvd;
            spu.consoleLog('GQL Payload Counter CLEARED');
            break;
        default: // clear all
            signalRbytes = 0;
            spu.consoleLog('SIGNALR Payload Counter CLEARED');
            GQLbytesSent = 0;
            GQLbytesRcvd = 0;
            GQLbytes = GQLbytesSent+GQLbytesRcvd;
            spu.consoleLog('GQL Payload Counter CLEARED');
            break;
    }

    $('#signalRbytes').html(signalRbytes.toFixed(2));
    $('#GQLbytes').html(GQLbytesSent.toFixed(2)+'/'+GQLbytesRcvd.toFixed(2)+'/'+GQLbytes.toFixed(2));
}


function sortJSON(jsonData, prop, asc) {
    jsonData = jsonData.sort(function(a, b) {
        if (asc) {
            return (a[prop] > b[prop]) ? 1 : ((a[prop] < b[prop]) ? -1 : 0);
        } else {
            return (b[prop] > a[prop]) ? 1 : ((b[prop] < a[prop]) ? -1 : 0);
        }
    });
    return jsonData;
    //showResults();
}

function showTime() {
    var a_p = "";
    var today = new Date();
    var curr_hour = today.getHours();
    var curr_minute = today.getMinutes();
    var curr_second = today.getSeconds();
    if (curr_hour < 12) {
        a_p = "<span>AM</span>";
    } else {
        a_p = "<span>PM</span>";
    }
    if (curr_hour == 0) {
        curr_hour = 12;
    }
    if (curr_hour > 12) {
        curr_hour = curr_hour - 12;
    }
    curr_hour = checkTime(curr_hour);
    curr_minute = checkTime(curr_minute);
    curr_second = checkTime(curr_second);
    //document.getElementById('clock_time').innerHTML=curr_hour + ":" + curr_minute + ":" + curr_second + " " + a_p;
    $( '#clock_time' ).html(curr_hour + ":" + curr_minute + ":" + curr_second + " " + a_p);

}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getClientGMToffset() {
  function z(n){return (n<10? '0' : '') + n}
  var offset = new Date().getTimezoneOffset();
  var sign = offset < 0? '+' : '-';
  offset = Math.abs(offset);
  return sign + z(offset/60 | 0) +':'+ z(offset%60);
}
if (!Date.now) {
    Date.now = function() {
        return new Date().getTime();
    };
}
function getDateTime(inDate, returnType) {
    var now = new Date().getTime();
    
    var utcMilliSeconds = (inDate ? inDate.getTime() : now);
    var utcSeconds = Math.round(utcMilliSeconds/1000);
    var utcMinutes = Math.round(utcMilliSeconds/1000/60);
    
    var returnType = (returnType ? returnType.toLowerCase() : 'ms');
    var ret = '';
    
    switch (returnType) {
        case 'm':
            ret = utcMinutes;
            break;
        case 's':
            ret = utcSeconds;
            break;
        case 'ms':
            ret = utcMilliSeconds;
            break;
        default:
            ret = utcMilliSeconds;
            break;
    }
    
    return ret;
}
    
function formatDateTime(when,showMilliseconds,iso) {
    showMilliseconds = (iso==true ? true : showMilliseconds);
    
    yr = when.getFullYear();
    mo = when.getMonth()+1;
    mo = (mo<10 ? '0'+mo : mo);
    dy = when.getDate();
    dy = (dy<10 ? '0'+dy : dy);
    hr = when.getHours();
    hr = (hr<10 ? '0'+hr : hr);
    mi = when.getMinutes();
    mi = (mi<10 ? '0'+mi : mi);
    ss = when.getSeconds();
    ss = (ss<10 ? '0'+ss : ss);
    ms = when.getMilliseconds();
    ms = (ms<10 && ms<100 ? '00'+ms : (ms>9 && ms<100 ? '0'+ms : ms) );
    
    when = yr + '-' + mo + '-' + dy;
    when = when + (iso ? 'T' : ' ');
    when = when + hr + ':' + mi + ':' + ss;
    when = when + (showMilliseconds===true ? '.'+ms : '');
    //when = when + (iso ? 'Z' : '');
    
    return when;
}

function datediff(d1,d2,x) {
  //var x='s';
  var diff=0;
  // 2015-03-01T23:17:45.000
  // 01234567890123456789012
  var t1 = new Date(d1.substr(0,4), d1.substr(5,2), d1.substr(8,2), d1.substr(11,2), d1.substr(14,2), d1.substr(17,2), 0);
  var t2 = new Date(d2.substr(0,4), d2.substr(5,2), d2.substr(8,2), d2.substr(11,2), d2.substr(14,2), d2.substr(17,2), 0);
  
  diff = t2.getTime() - t1.getTime();
  var days  = diff/1000 /60/60 /24; // days
  var hours = diff/1000 /60/60; // hours
  var mins  = diff/1000 /60; // minutes
  var secs  = diff/1000; // seconds
  var mils  = diff; // milliseconds
  
  switch (x) {
      case 'd':
          diff = days;
          break;
      case 'h':
          diff = hours;
          break;
      case 'm':
          diff = mins;
          break;
      case 's':
          diff = secs;
          break;
      case 'ms':
          diff = mils;
          break;
      default:
          diff = secs;
          break;
  }
  return diff;
}

function sleep(milliseconds)
{
   var currentTime = new Date().getTime();
   while (currentTime + milliseconds >= new Date().getTime()) {
     // do nothing
   }
   return milliseconds;
}

var darkOrLight = function(inColor) {
    inColor = (inColor.indexOf('#')==0 ? inColor.substr(1) : inColor);
  // convert Hex to Int - parseInt(hexString, 16);
  var red   = parseInt(inColor.substr(0,2), 16);
  var green = parseInt(inColor.substr(2,2), 16);
  var blue  = parseInt(inColor.substr(4,2), 16);
  var brightness;
  brightness = (red * 299) + (green * 587) + (blue * 114);
  brightness = brightness / 255000;
  //spu.consoleLog("IN:"+inColor+" BR:"+brightness);
  //
  // values range from 0 to 1
  // anything greater than 0.5 should be bright enough for dark text
  if (brightness >= 0.5) {
    return "dark-text";
  } else {
    return "light-text";
  }
};

function colourNameToHex(colour)
{
    var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};

    if (typeof colours[colour.toLowerCase()] != 'undefined')
        return colours[colour.toLowerCase()];

    return false;
}

function colorHexToDec(hexColor) {
    hexColor = (hexColor.indexOf("#")==-1 ? colourNameToHex(hexColor).toString() : hexColor);

    var decA = 1;
    var hexNum = hexColor.substr(1);
    //echo 'hexFull:'.hexNum.' ';
    var hexLen = hexNum.length;
    var alphaChan = (hexLen==8 ? hexNum.substr(0,2) : '');
    if (alphaChan!='') {
        hexNum = hexNum.substr(2);
        //echo 'hexNoAlpha:'.hexNum.' ';
        decA = parseInt(alphaChan, 16);
        decA = decA/255;
    }
    var hexR = hexNum.substr(0,2);
    var hexG = hexNum.substr(2,2);
    var hexB = hexNum.substr(4,2);
    //echo 'hex'.hexR.hexG.hexB;
    var decR = parseInt(hexR, 16);
    var decG = parseInt(hexG, 16);
    var decB = parseInt(hexB, 16);
    //echo 'dec'.decR.decG.decB;
    
    var brightness = (decR * 299) + (decG * 587) + (decB * 114);
    var brightness = brightness / 255000;
    // anything greater than 0.5 should be bright enough for dark text
    if (brightness >= 0.5) {
      var textColor = "#000000";
    } else {
      var textColor = "#FFFFFF";
    }
  
    var bgColor = 'rgba('+decR+','+decG+','+decB+ (alphaChan!='' ? ','+decA : '') +')';

    //return array("bgColor" => bgColor, "txtColor" => textColor);
    return {bgColor:bgColor,txtColor:textColor};
}


function ascii2string(asciiArray) {
  var result = "";
  var alist = asciiArray.split(',');
  for (var i = 1; i < alist.length; i++) {
    result += String.fromCharCode(parseInt(alist[i]));
  }
  return result;
}

function hex2string(instr) {
    var hex = instr.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 4) {
        var chunk = hex.substr(n, 2);
        var anInt = parseInt(chunk, 16);
        var char  = String.fromCharCode(anInt);
        str += String.fromCharCode(anInt);
    }
    return str;
}

function enterdigit(but,el) {
    if(document.getElementById(el)) {
        var fieldval=document.getElementById(el).value;
        if (but=='back') {
            fieldval=fieldval.substr(0,fieldval.length-1);
        } else if (but=='clear') {
            fieldval='';
        } else {
            fieldval+=but;
        }
        
        document.getElementById(el).value = fieldval;
    }
}

function getClientIP(fetchIP, callback) {
    fetchIP = typeof fetchIP === 'undefined' || fetchIP==='' ? true : fetchIP;
    spu.consoleLog('Getting Client IP (fetchIP='+fetchIP+') ...');
    
    if (fetchIP) {

        if (PHP) {

            spu.consoleLog('getClientIP Method: Server Call (local)');

            $.get(webUrl+"/zjs/lib/ipinfo.php", function(data){
                spu.consoleLog('UTIL:'+data);
                var d = JSON.parse(data);
                spu.consoleLog('UTILra:'+d.ra);
                spu.consoleLog('UTIL4:'+d.v4);
                spu.consoleLog('UTIL6:'+d.v6);
                if (callback) {
                    callback(d.v4);
                }
            });

        } else {

            if (isiDevice || navigator.sayswho.indexOf('IE ') > -1) {

                spu.consoleLog('getClientIP Method: Server Call (remote)');

                $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
                    clientIP = data.ip;
                    //spu.consoleLog('CLIENT IP:' +clientIP);
                    if (callback) {
                        callback(data.ip);
                    }
                    return data.ip;
                });

            } else {

                spu.consoleLog('getClientIP Method: WebRTC');

                window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
                var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
                pc.createDataChannel("");    //create a bogus data channel
                pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
                pc.onicecandidate = function(ice){  //listen for candidate events
                    if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
                    var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                    //console.log('my IP: ', myIP);
                    pc.onicecandidate = noop;

                    clientIP = myIP;

                    if (callback) {
                        callback(myIP);
                    }

                    return myIP;
                };
            }

        }
    } else {
        spu.consoleLog('Get Client IP BYPASSED: (fetchIP='+fetchIP+')');
        if (callback) {
            callback(false);
        }
    }
}

function setCookie(cName,cValue,exp,path,dom) {
    var dt = new Date();
    exp = (exp!='' ? exp : 1);
    dt.setTime(dt.getTime() + (exp*24*60*60*1000));
    exp = dt.toUTCString();
    path = (path ? path : webPath);
    dom = (dom ? dom : webHost);
    var c = cName+'="'+cValue+'"';
    document.cookie = cName+'='+cValue+';expires='+exp+';path=/';
}
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

function clientSetting(sName,sValue,sOp,sType) {
    sOp = (typeof sOp==='undefined' ? '' : sOp).toLowerCase();
    var op = '';
    switch (sOp) {
        case 'get':
        case 'set':
        case 'del':
            op = sOp;
            break;
        default:
            op = 'get';
    }
    sType = (typeof sType==='undefined' ? '' : sType).toLowerCase();
    var type = '';
    switch(sType) {
        case 'session':
            type = sType;
            break;
        default:
            type = 'local';
    }
    
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.

        // sessionStorage is cleared when Tab is closed.
        // localStorage is NEVER cleared.

        // Store
        //localStorage.setItem("SESSIONID", sidgen);
        // Retrieve
        //localStorage.getItem("SESSIONID")
        // Remove
        //localStorage.removeItem("SESSIONID");

        if (type=='local') {
            var valstore = localStorage.getItem(sName)===null ? '' : localStorage.getItem(sName);
        } else {
            var valstore = sessionStorage.getItem(sName)===null ? '' : sessionStorage.getItem(sName);
        }
        
        if (valstore==='' || op=='set') {
            if (type=='local') {
                localStorage.setItem(sName, sValue);
            } else {
                sessionStorage.setItem(sName, sValue);
            }
        }
        
        if (op=='del') {
            if (type=='local') {
                localStorage.removeItem(sName);
            } else {
                sessionStorage.removeItem(sName);
            }
        }
        
        if (type=='local') {
            valstore = localStorage.getItem(sName)===null ? '' : localStorage.getItem(sName);
        } else {
            valstore = sessionStorage.getItem(sName)===null ? '' : sessionStorage.getItem(sName);
        }
        
        return valstore;


    } else {
        // No Web Storage support... use Cookie
        
        var valstore = getCookie(sName)===null ? '' : getCookie(sName);
        
        if (valstore==='' || op=='set') {
            setCookie(sName, sValue, 365);
        }
        
        if (op=='del') {
            setCookie(sName, sValue, -1);
        }
        
        valstore = getCookie(sName)===null ? '' : getCookie(sName);
        
        return valstore;
    } 
}

function cloneData(data) {
    // Use the JSON parse to clone the data.
    // Convert the data into a string first
    var jsonString = JSON.stringify(data);

    //  Parse the string to create a new instance of the data
    return JSON.parse(jsonString);
}

// shim for iPad scrollbars for Task Editor
function jumpTop() {
    if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {           
        window.scrollTo(200,100); // first value for left offset, second value for top offset
        window.setTimeout(function() {window.scrollTo(0,0);}, 300);
        window.scrollTo(0, 0);
        window.scroll(0, 1);
    } else {
        $('html,body').animate({
            scrollTop: 0,
            scrollLeft: 0
        }, 300, function(){
            $('html,body').clearQueue();
        });
    }
}
// shim for iPad scrollbars for Task Editor
function jumpBottom(inDiv) {
    var inDiv = inDiv ? inDiv : 'html,body';
    if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {           
        window.scrollTo(200,100); // first value for left offset, second value for top offset
        window.setTimeout(function() {window.scrollTo(0,3000);}, 300);
        window.scrollTo(0, 3000);
        window.scroll(0, 3000);
    } else {
        $(inDiv).animate({
            scrollTop: 3000,
            scrollLeft: 0
        }, 300, function(){
            $(inDiv).clearQueue();
        });
    }
}



function broadcastMessage(msg) {
    var fn = spu.fi(arguments);
    spu.consoleLog('Broadcasting Message:'+msg);
    gql.EXEC(gql.postBroadcastMessage(msg), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.postBroadcastMessage", response);
        } else {
            spu.consoleLog('Message Broadcasted:'+response.data.postBroadcastMessage.message);
        }
    });
}


function getLocalSetting(settingName, callback) {
    var fn = spu.fi(arguments);
    gql.EXEC(gql.getLocalSetting(settingName), function(response) {
        var sName='';
        var sValu='';
        if (response.errors) {
            gql.handleError(fn+" gql.getLocalSetting", response);
            callback('ERROR');
        } else {
            sName = response.data.setting.name;
            sValu = response.data.setting.value;
            if (callback) {
                callback(sValu);
            }
        }
    });
}
function getGlobalSetting(settingName, callback) {
    var fn = spu.fi(arguments);
    gql.EXEC(gql.getGlobalSetting(settingName), function(response) {

        var setting = {};
            setting.error = '';

        if (response.errors) {
            gql.handleError(fn+" gql.getGlobalSetting", response);
            setting.error = '!!! ERROR retrieving Global Setting ['+settingName+']';
            spu.consoleLog(setting.error);
//            callback('ERROR');
        } else {
            spu.consoleLog('Retrieved Global Setting ['+settingName+']: '+response.data.setting.value);
            
            setting.name = response.data.setting.name;
            setting.value = response.data.setting.value;
            setting.value = (setting.value===null ? '' : setting.value);
            globalSettings[setting.name] = setting.value;
            
        }
        if (callback) {
            callback(setting);
        }
    });
}


function workperiodCheck(wpid,callback) {
    spu.consoleLog('Checking Workperiod Status...');
    //getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters,function currentWP(report) {
//    var repUser = currentUser ? currentUser : defaultUser;
    getCustomReport('Workperiod Status',currentUser,'','','','',function currentWP(report) {
        WPID = report.tables[0].rows[0].cells[0];
        WPisOpen = report.tables[0].rows[0].cells[1]=='YES' ? true : false;
        spu.consoleLog('Last WPID:'+WPID+' open:'+WPisOpen);
        workperiod.id = WPID;
        workperiod.isOpen = WPisOpen;
        $( '#workperiod' ).html('<span class="'+(workperiod.isOpen ? 'WP_Open' : 'WP_Closed')+'">' + workperiod.id + '</span>');
        if (callback) {
            callback(workperiod);
        }
    });
}


//////////////////////////////////////////////
// 
// TERMINAL
//
//////////////////////////////////////////////

function isTerminalExists(terminalId,callback) {
    var fn = spu.fi(arguments);
    spu.consoleLog('TERMINAL Checking Exists ['+terminalId+'] ...');
    
    gql.EXEC(gql.getTerminalExists(terminalId), function t(response){
        if (response.errors) {
            gql.handleError(fn+' gql.getTerminalExists',response);
        } else {
            var exists = response.data.isTerminalExists;
            var term = {};
                term.exists = exists;
                term.id = (exists ? terminalId : '');
                term.name = clientSetting('terminalName');
                term.department = clientSetting('terminalDepartment');
                term.ticketType = clientSetting('terminalTicketType');
                term.user = clientSetting('terminalUser');
            //POS_Terminal.registered = term.exists;
            
            spu.consoleLog('TERMINAL Exists ['+terminalId+']: '+exists);
            
            if (callback) {
                callback(term);
            }
        }
    });
}
function registerTerminal(terminal,department,ticketType,user,reRegister,callback) {
    var fn = spu.fi(arguments);
    //terminal = terminal ? terminal : currentTerminal;
    terminal = terminal ? terminal : defaultTerminal;
    department = department ? department : departmentName;
    ticketType = ticketType ? ticketType : ticketTypeName;
    user = user ? user : currentUser;
    reRegister = reRegister=='' ? false : true;
    
    spu.consoleLog('TERMINAL Registering (reReg='+reRegister+'): '+terminal);
    
    isTerminalExists(POS_Terminal.id,function e(data){
        var term = {};
            term.exists = data.exists;
            term.id = data.id;
        
        POS_Terminal.registered = term.exists;

        var alreadyRegistered = (POS_Terminal.registered && POS_Terminal.id==term.id && POS_Terminal.name==terminal ? true : false);

        if (!POS_Terminal.registered || reRegister || POS_Terminal.name!=terminal) {
            gql.EXEC(gql.registerTerminal(terminal,department,ticketType,user), function t(response){
                if (response.errors) {
                    gql.handleError(fn+" gql.registerTerminal", response);
                    if (callback) {
                        callback('ERROR');
                    }
                } else {
                    POS_Terminal.id = response.data.terminalId;
                    POS_Terminal.registered = (POS_Terminal.id!='' && POS_Terminal.id!=null ? true : false);
                    if (POS_Terminal.registered) {
                        POS_Terminal.name = terminal;
                        POS_Terminal.department = department;
                        POS_Terminal.ticketType = ticketType;
                        POS_Terminal.user = user;
                        clientSetting('terminalId',POS_Terminal.id,'set');
                        clientSetting('terminalName',POS_Terminal.name,'set');
                        clientSetting('terminalDepartment',POS_Terminal.department,'set');
                        clientSetting('terminalTicketType',POS_Terminal.ticketType,'set');
                        clientSetting('terminalUser',POS_Terminal.user,'set');
                        spu.consoleLog('TERMINAL Registered ['+terminal+'] ('+POS_Terminal.registered+'): '+POS_Terminal.id);
                    } else {
                        clientSetting('terminalId','','del');
                        clientSetting('terminalName','','del');
                        clientSetting('terminalDepartment','','del');
                        clientSetting('terminalTicketType','','del');
                        clientSetting('terminalUser','','del');
                        spu.consoleLog('TERMINAL NOT Registered ['+terminal+'] ('+POS_Terminal.registered+'): '+POS_Terminal.id);
                    }

                    $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
                    $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
    
                    if (module=='pos') {
                        navigateTo('module','pos','pos');
                    }
                    
                    if (callback) {
                        callback(POS_Terminal);
                    }
                }
            });
        } else {
            spu.consoleLog('TERMINAL Registered ['+terminal+'] (already registered): '+POS_Terminal.id);
            clientSetting('terminalId',POS_Terminal.id,'set');
            clientSetting('terminalName',POS_Terminal.name,'set');
            POS_Terminal.department = clientSetting('terminalDepartment');
            POS_Terminal.ticketType = clientSetting('terminalTicketType');
            POS_Terminal.user = clientSetting('terminalUser');
                        
            $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
            $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
            
            if (callback) {
                callback(POS_Terminal);
            }
        }

    });
}
function unregisterTerminal(terminalId,callback) {
    var fn = spu.fi(arguments);
    terminalId = terminalId ? terminalId : POS_Terminal.id;
    spu.consoleLog('TERMINAL Unregistering: '+terminalId);
    
    isTerminalExists(terminalId,function e(data){
        var exists = data.exists;
        
        if (exists) {
            gql.EXEC(gql.unregisterTerminal(terminalId), function t(response){
                if (response.errors) {
                    gql.handleError(fn+" gql.unregisterTerminal", response);
                    if (callback) {
                        callback('ERROR');
                    }
                } else {
                    var unreg = response.data.isTerminalUnregistered;
                    if (unreg) {
                        POS_Terminal.registered = !unreg;
                        POS_Terminal.id = '';
                        POS_Terminal.name = '';
                        POS_Terminal.department = '';
                        POS_Terminal.ticketType = '';
                        POS_Terminal.user = '';
                        clientSetting('terminalId','','del');
                        clientSetting('terminalName','','del');
                        clientSetting('terminalDepartment','','del');
                        clientSetting('terminalTicketType','','del');
                        clientSetting('terminalUser','','del');
                        spu.consoleLog('TERMINAL Unregister (success): '+terminalId);
                    } else {
                        spu.consoleLog('TERMINAL Unregister (fail), terminal not found: '+terminalId);
                    }
                    if (callback) {
                        callback(unreg);
                    }
                }    
            });
        } else {
            spu.consoleLog('TERMINAL Unregister (skipped), terminal not registered: '+terminalId);
            if (callback) {
                callback(false);
            }
        }
        
        $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
        $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
    });
    
}
