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
    
    spu.consoleLog('Refreshed Moments.');
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
            businessName = setting.value;
        }
    });
    getGlobalSetting('BUS_VenueName', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            venueName = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Welcome', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            welcomeMessage = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Open', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            openMessage = setting.value;
        }
    });
    getGlobalSetting('BUS_MSG_Closed', function(ret) {
        var setting = ret;
        if (!setting.error && setting.value !=='') {
            closedMessage = setting.value;
        }
    });
};

spu.executeAutomationCommand = function(name,value) {
    window.external.ExecuteAutomationCommand(name,value);
};

function getUsers(callback) {
    var users = [];
    //getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters,function currentWP(report) {
    getCustomReport('PHP Users','Admin','','','','',function r(report){
        for (var t=0; t<report.tables.length; t++) {
            var cName = [];
            for (var col=0; col<report.tables[t].columns.length; col++) {
                var columnHeader = report.tables[t].columns[col].header;
                    columnHeader = (columnHeader===null ? '-' : columnHeader);
                    cName.push(columnHeader);
            }
            for (var row=0; row<report.tables[t].rows.length; row++) {
                var userData = {};
                for (var cell=0; cell<report.tables[t].rows[row].cells.length; cell++) {
                    var cellData = report.tables[t].rows[row].cells[cell];
                    userData[cName[cell]]=cellData;
                }
                //userData = userData.substr(0,(userData.length-1));
                users.push(userData);
            }
        }
        if (callback) {
            callback(users);
        }

    });
    //return users;
};

function session_id() {
    return /SESS\w*ID=([^;]+)/i.test(document.cookie) ? RegExp.$1 : false;
}

function updatePageTitle(modscreen) {
    var currentTitle = $(document).prop('title');
    var sepPos = currentTitle.indexOf(' ~ ') + 3;
    var newTitle = modscreen.replace(/_/,' ').toUpperCase() + ' ~ ' + currentTitle.substr(sepPos,currentTitle.length-sepPos);
    $(document).prop('title',newTitle);
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
    content += '<div class="closeButton" title="click to close" onclick="$(\'#helpMessage\').hide();">X</div>';
    $('#helpMessage').html(content);
    $('#helpMessage').show();
}
function showErrorMessage(content) {
    content = content.replace(/\\r\\n/g,'<br />');
    content = content.replace(/\\r/g,'<br />');
    content = content.replace(/\\n/g,'<br />');
    content += '<div class="closeButton" title="click to close" onclick="$(\'#errorMessage\').hide();">X</div>';
    $('#errorMessage').html(content);
    $('#errorMessage').show();
}

function clearTimers(fromWhere) {
    spu.consoleLog('Clearing Timers from ['+fromWhere+']');
    
    // Set a fake timeout to get the highest timeout id
    var highestIntervalId = setInterval(";");
    for (var i = 0 ; i <= highestIntervalId ; i++) {
        clearInterval(i); 
    }
    spu.consoleLog('Cleared all timers.  Restarting Clock...');
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
    if (hexColor.indexOf("#") == -1) {
        return hexColor;
    }
    decA = 1;
    hexNum = hexColor.substr(1);
    //echo 'hexFull:'.hexNum.' ';
    hexLen = hexNum.length;
    alphaChan = (hexLen==8 ? hexNum.substr(0,2) : '');
    if (alphaChan!='') {
        hexNum = hexNum.substr(2);
        //echo 'hexNoAlpha:'.hexNum.' ';
        decA = parseInt(alphaChan, 16);
        decA = decA/255;
    }
    hexR = hexNum.substr(0,2);
    hexG = hexNum.substr(2,2);
    hexB = hexNum.substr(4,2);
    //echo 'hex'.hexR.hexG.hexB;
    decR = parseInt(hexR, 16);
    decG = parseInt(hexG, 16);
    decB = parseInt(hexB, 16);
    //echo 'dec'.decR.decG.decB;
    
    brightness = (decR * 299) + (decG * 587) + (decB * 114);
    brightness = brightness / 255000;
    // anything greater than 0.5 should be bright enough for dark text
    if (brightness >= 0.5) {
      textColor = "#000000";
    } else {
      textColor = "#FFFFFF";
    }
  
    bgColor = 'rgba('+decR+','+decG+','+decB+ (alphaChan!='' ? ','+decA : '') +')';

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