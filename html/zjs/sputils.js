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
