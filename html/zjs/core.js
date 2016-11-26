/* global spu, modulePath, inSambaPOS, availableModules, busyWheel, ticketTypeName, POS_Terminal, defaultTerminal, POS_EntityTypes, POS_EntityTypesAuto, TSK_TaskTypes, TC_PunchControlTaskType, gql, taskTypes, getClientGMToffset, dateFormats, moment */

////////////////////////////////
//
// core
//
////////////////////////////////

function loadMODULE(modscreen) {
    var fn = spu.fi(arguments);

    spu.refreshMoments();
    
    if (inSambaPOS) {
        // if the page is running inside SambaPOS HTML Viewer Widget
        // get rid of Top and Bottom bars
        spu.hideHeader();                
    }

    //URLmodule = urlParm["module"];
    //URLmodule = (URLmodule ? URLmodule.toString().toLower() : '');

    spu.consoleLog('loadMODULE(modscreen) ... modscreen:"'+modscreen + '" URLmodule:"'+URLmodule + '" current mod:"'+module+'"');
    
    modscreen = (URLmodule ? URLmodule : modscreen);
    
    spu.consoleLog('loadMODULE(modscreen) ... modscreen:"'+modscreen + '" URLmodule:"'+URLmodule + '" current mod:"'+module+'"');

    module = '';
    for (var m=0; m<availableModules.length; m++) {
        var mod = availableModules[m].replace(/ /g,'_').toLowerCase();
        if (mod == modscreen) {
            module = modscreen;
            break;
        }
        
    }
    module = (modscreen=='main_menu' ? modscreen : module);
    
    if (module != '') {
        spu.consoleLog('Navigation to: '+modscreen);
        
        clearTimers('loadMODULE');
        
        var hdrTitle = modscreen.replace(/_/,' ').toUpperCase();
        var hdr = '';
        hdr += '<img src="'+icon+'" title="'+hdrTitle+'" alt="'+hdrTitle+'" style="vertical-align:text-bottom;">';
        hdr += ' <span style="font-weight:bold;">'+hdrTitle+'</span>';
        $('#module').html(hdr);
        

        $( '#containerMODULE' ).html('<br /><br /><div class="info-message">Loading Module:<br /><br />[ '+hdrTitle+' ]<br /><br />... please wait ...<br /><br />'+busyWheel+'</div>');


        var moduleRoot = modulePath + modscreen + '/';
        
        var moduleHTML = moduleRoot + 'index.html';
        var moduleJS   = moduleRoot + 'module.js';
        
        // load HTML
        $( "#containerMODULE" ).load(moduleHTML, function(loadData,loadResponse) {
//            spu.consoleLog(loadResponse);
//            spu.consoleLog(loadData);
            spu.consoleLog('+++++ LOADED: ' + moduleHTML);
            

//            $( "#js_mod" ).load(moduleJS, function(loadData,loadResponse) {
            $.getScript(moduleJS, function(loadData,loadStatus) {
//                console.log(loadResponse);
//                console.log(loadData);
                spu.consoleLog('+++++ LOADED: ' + moduleJS);


                // perform initial functions pertaining to MODULE
                // each module.js file contains this function
                init_module();

                // update page Title
                updatePageTitle(modscreen);

                // broadcast MODULE to terminals
                sendMODULE(module);


            }); // module.js load
        }); // #containerModule HTML load

    } else {
        console.log('!!! ERROR: Module is not valid !!! '+modscreen);
    }

}


function navigateTo(moduleParm,moduleVal,navParm) {
    $('#loadMessage').hide();
    if (moduleParm && moduleVal) {
        //window.location.hash = updateQueryString(moduleParm,moduleVal) + '#' + moduleVal;
        //window.location.hash = moduleVal;
        URLmodule = moduleVal;
        if (history.pushState) {
            //var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?myNewUrlQuery=1';
            var newurl = updateQueryString(moduleParm,moduleVal);
            window.history.pushState({path:newurl},'',newurl);
        }
    }
    loadMODULE(navParm);
}

function sendMODULE(modscreen) {
    var fn = spu.fi(arguments);
    var msg = '{"eventName":"NAVIGATION","eventData":"'+'NAV_'+modscreen+'","sid":"'+sessionId+'"}';
    gql.EXEC(gql.postBroadcastMessage(msg), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.postBroadcastMessage", response);
        } else {
            
        }
    });
}





//////////////////////////////////////////////////////////////
//
// BEG $(document).ready(function(){
//
// when the page is fully loaded, these methods are fired
//  
//////////////////////////////////////////////////////////////

$(document).ready(function(){

    $('#inputGo').on('click', function(){
        inputValue = $('#inputValue').val();
        $('#inputDialog').hide();
        spu.consoleLog('GO clicked!: '+inputValue);
    });
    $('#inputClear').on('click', function(){
        inputValue = 'ERASEINPUTVALUE';
        $('#inputDialog').hide();
        spu.consoleLog('CLEAR clicked!: '+inputValue);
    });
    $('#inputCancel').on('click', function(){
        inputValue = 'CANCELINPUTVALUE';
        $('#inputDialog').hide();
        spu.consoleLog('CANCEL clicked!: '+inputValue);
    });



    gql.Authorize('','',function gqlAuth(authresp){
    

    sessionId = session_id();
    currentTerminal = navigator.sayswho;

    POS_Terminal.id = clientSetting('terminalId','','get');
    POS_Terminal.name = clientSetting('terminalName','','get');
    POS_Terminal.department = clientSetting('terminalDepartment','','get');
    POS_Terminal.ticketType = clientSetting('terminalTicketType','','get');
    POS_Terminal.user = clientSetting('terminalUser','','get');
    POS_Terminal.registered = (POS_Terminal.id!='' && POS_Terminal.id!=null ? true : false);

    if (inSambaPOS){
        spu.getEmbeddedUserTerminal();
    }
    
    if(!inSambaPOS) {
        currentUserData.name = clientSetting('userName');
        currentUserData.role = clientSetting('userRole');
        currentUserData.PIN = clientSetting('phash');
        currentUserData.validated = true;
        currentUser = currentUserData.name;
        currentUserRole = currentUserData.role;
        if (currentUser=='' || currentUser=='undefined' || typeof currentUser==='undefined') {
            currentUserData = {};
            currentUserData.validated = false;
            clientSetting('phash','','set');
        }
        $('#USER_Auth').show();
        document.getElementById('USER_inPIN').focus();
        spu.validateUser();
    }
    

    spu.getBusinessSettings();


    $('#module').html('???');
    $('#currentUser').html('['+POS_Terminal.name+'] '+currentUser);
    $('#currentUser').attr('title',currentTerminal+' ['+POS_Terminal.id+'] ('+currentUserRole+')');
    $('#connection').html(isConnected==true ? '<div class="CON_Indicator CON_Connected"></div>' : '<div class="CON_Indicator CON_Disconnected"></div>');
    
    loadMODULE(module);

    $('#infoMessage').click(function () {
        workperiodCheck('',function wpo(workperiod){
            WPisOpen = workperiod.isOpen;
            if (!workperiod.isOpen) {
                spu.consoleLog('POS NOT ready.  Workperiod is CLOSED.');
                navigateTo('module','main_menu','main_menu');
                $('#infoMessage').hide();
            } else {
                $('#infoMessage').hide();
            }
        });
    });

    if (module=='pos') {
        workperiodCheck('',function wpo(workperiod){
            WPisOpen = workperiod.isOpen;
            if (!workperiod.isOpen) {
                spu.consoleLog('POS NOT ready.  Workperiod is CLOSED.');
                showInfoMessage('Workperiod is CLOSED.<br /><br />Click to Retry.');
            } else {
                $('#infoMessage').hide();
            }
        });
    }
    
  


    var connection = $.hubConnection(SIGNALRurl, { useDefaultPath: false });
        connection.logging = false;
    
    var proxy = connection.createHubProxy('default');
    proxy.on('update', function(message) {
//        spu.consoleLog('*** MSG RCVD:'+message);
        var msgparsed = HUB_parseMessage(message);
        var containsJSON = (msgparsed.indexOf('{')>-1 && msgparsed.indexOf('}')>-1 ? true :false);
        
        if (!containsJSON) {
            spu.consoleLog(msgparsed);
        }
        
        if (containsJSON) {
            var jsonData = JSON.parse(msgparsed);
            var handledHubEvent = HUB_handleEvent(jsonData);
        }
        
        if (
               msgparsed.indexOf('WORKPERIOD_REFRESH')>-1
            || msgparsed.indexOf('TASK_REFRESH')      >-1
            || msgparsed.indexOf('WIDGET_REFRESH')    >-1
            || msgparsed.indexOf('TICKET_REFRESH')    >-1
            ) {
            var parts = msgparsed.split('...');
            var eventName = parts[0].replace('<<<[ INCOMING ]<<< ','');
            var eventData = parts[1];
            var jsonObj = { };
            jsonObj.eventName = eventName;
            jsonObj.eventData = eventData;
            var ev = [];
            ev.push(jsonObj);
            var handledHubEvent = HUB_handleEvent(ev);
        }

    }); // proxy.on('update'
    

    connection.start()
        .done(function(){
            isConnected=true;
            updateConnectionStatus();
        })
	.fail(function(){
            spu.consoleLog('Failed to connect to signalr.  Retry in 5 seconds...');
            isConnected=false;
            updateConnectionStatus();
            setTimeout(function() {
                spu.consoleLog('Attempting Connect...');
                connection.start();
            }, 5000); // Restart connection after 5 seconds.
        });

    connection.stateChanged(function connectionStateChanged(state) {
        var stateConversion = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
        spu.consoleLog('SignalR state changed from: ' + stateConversion[state.oldState] +'('+state.oldState+')'
                                        + ' to: ' + stateConversion[state.newState] +'('+state.newState+')');

        var newConnState = stateConversion[state.newState];

        if (newConnState=='disconnected') {
//            tryingToReconnect = false;
            isConnected=false;
        }
        if (newConnState=='connecting') {
            tryingToReconnect = false;
            isConnected=false;
        }
        if (newConnState=='reconnecting') {
            tryingToReconnect = true;
//            isConnected=false;
        }
        if (newConnState=='connected') {
            tryingToReconnect = false;
            isConnected=true;
        }
        updateConnectionStatus();
    });


    connection.connectionSlow(function() {
        //notifyUserOfConnectionProblem(); // Your function to notify user.
        spu.consoleLog('WARNING: Looks like we are having a connection problem...');
    });

//    connection.reconnecting(function() {
//        tryingToReconnect = true;
//        updateConnectionStatus();
//    });
//
//    connection.reconnected(function() {
//        tryingToReconnect = false;
//        isConnected=true;
//        updateConnectionStatus();
//    });

    connection.disconnected(function() {
        var disconReason = '';
        if ($.connection.lastError) {
            disconReason = $.connection.lastError.message;
        }
        
        spu.consoleLog('Disconnected from signalr'+(disconReason ? ' ('+disconReason+')' : '')+'.  Reconnection attempt in 5 seconds...');
        isConnected=false;
        updateConnectionStatus();
        
        setTimeout(function() {
            spu.consoleLog('Attempting Reconnect...');
            connection.start();
        }, 5000); // Restart connection after 5 seconds.
     });


    $('#connection').on('click', function(){
        connection.start(function(){
            var t = this._.initHandler;
            spu.consoleLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'+t.startCompleted);

            connectionReady();
        });
    });




    //document.addEventListener('keypress', function(event) {
    document.addEventListener('keydown', function(event) {
        var kc = event.keyCode;
        var ch = (KEYCODES[kc] ? KEYCODES[kc] : kc);
        spu.consoleLog('Key Pressed:'+kc+' ('+ch+')');

        // find the element with focus
        var hasFocus = spu.focused() || 'nothing';

        // check for BB button Numeric Keys or Enter Key or chars r,s,c
        if ((Number(ch)>=0 && Number(ch)<=9) || ch=='enter' || ch=='r' || ch=='s' || ch=='c' || ch=='esc') {
            if (document.getElementById('CHAT_Input')) {
                var msgInputID = document.getElementById('CHAT_Input');
                var sendBtn = document.getElementById('CHAT_Send');
            }
            if (document.getElementById('MSG_FS_Input')) {
                var msgInputID_FS = document.getElementById('MSG_FS_Input');
                var sendBtn_FS = document.getElementById('MSG_FS_Send');
            }
            if (document.getElementById('REP_Parms')) {
                var repParmsID = document.getElementById('REP_Parms');
            }
            if (document.getElementById('USER_inPIN')) {
                var userinPinId = document.getElementById('USER_inPIN');
            }
            if (document.getElementById('TERM_Info')) {
                var termInfo = document.getElementById('TERM_Info');
            }
            if (document.getElementById('inputValue')) {
                var inputValueId = document.getElementById('inputValue');
            }
            // if the CHAT input box has focus, we're done
            if (msgInputID == hasFocus || msgInputID_FS == hasFocus) {
                if (kc==13 && msgInputID == hasFocus) {
                    //spu.consoleLog('FOCUS:inputbox has focus');
                    // JS function
                    //sendBtn.click();
                    chatSendClick('CHAT');
                    // JQuery function
                    //$('#'+'MSG_Send').click();
                    // call other function containing JQuery
                    //doOnClick('MSG_Send');
                }
                if (msgInputID_FS == hasFocus) {
                    if (kc==13) {
                        //sendBtn_FS.click();
                        chatSendClick('MSG_FS');
                    }
                    if (kc==27) {
                        chatShowFull('hide');
                    }
                }
            }
            // if the Report Parameter Input box has focus, we can submit it by hitting ENTER
            if (repParmsID == hasFocus) {
                if (kc==13) {
                    changeReportPeriod('ignore',false);
                }
            }
            // if the Auth PIN Input box has focus, we can submit it by hitting ENTER
            if (userinPinId == hasFocus) {
                if (kc==13) {
                    spu.validateUser('',userinPinId.value);
                }
            }
            // if the input box has focus, we can submit it by hitting ENTER
            if (inputValueId == hasFocus) {
                if (kc==13) {
                    $('#inputGo').click();
                }
            }
            // if the Help Message has focus, we can close it by hitting ESC
//            if (helpMessageID == hasFocus) {
                if (kc==27) {
                    $('#helpMessage').hide();
                    $('#errorMessage').hide();
                    $('#TERM_Info').hide();
                }
//            }
            // if CHAT input box does not have focus and the Report Parameter Input does not have focus
            // and we are on the Kitchen Display having numeric Bump Bar buttons,
            // we can complete tasks by Card number, select all Cards, complete Selected Cards, or Refresh the Cards
            if (msgInputID != hasFocus && msgInputID_FS != hasFocus) {
                if (isNumeric(ch) && document.getElementById('KD_Task_'+ch) && document.getElementById('BB_'+ch)) {
                    spu.consoleLog('numeric key');
                    var tCard = document.getElementById('KD_Task_'+ch);
                    var bbKey = document.getElementById('BB_'+ch);
                    bbKey.click();
                } else {
                    //spu.consoleLog('non-numeric key');
                    switch (ch) {
                        case 'r':
                            // BB_Refresh
                            if (document.getElementById('BB_Refresh')) {
                                var bbKey = document.getElementById('BB_Refresh');
                                bbKey.click();
                            }
                            break;
                        case 's':
                            // BB_SelectAll
                            if (document.getElementById('BB_SelectAll')) {
                                var bbKey = document.getElementById('BB_SelectAll');
                                bbKey.click();
                            }
                            break;
                        case 'c':
                            // BB_MarkCompleted
                            if (document.getElementById('BB_MarkCompleted')) {
                                var bbKey = document.getElementById('BB_MarkCompleted');
                                bbKey.click();
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    });



    clockTimer = setInterval(showTime, 500);
    //document.getElementById('clock_date').innerHTML="<b>" + thisDay + "</b>, " + day + " " + months[month] + " " + year;
    $( '#clock_date' ).html("<b>" + thisDay + "</b>, " + day + " " + months[month] + " " + year);
//    $( '#clock_date' ).html("<b>" + thisDay + "</b>, " + day + " " + months[month]);

    if(!inSambaPOS) {
//      logoutUser(true);
//        spu.validateUser();
    }
});
});

//////////////////////////////////////////////////////////////
//
// END OF $(document).ready(function(){
// 
//////////////////////////////////////////////////////////////




///////////////////////
//
// HUB (signalR)
//
///////////////////////

function updateConnectionStatus(connState,opState) {
    var connState = (connState ? connState : isConnected);
    var opState   = (opState   ? opState   : tryingToReconnect);
    
    var cState = (connState ? 'Connected' : 'Disconnected');
        cState = (opState ? 'Reconnecting' : cState);
    
    spu.consoleLog('CONNECTION >>> connected:'+connState+' tryingRecon:'+opState+' state:'+cState);
//    '<div class="CON_Indicator CON_Connected></div>'
//    '<div class="CON_Indicator CON_Reconnecting"></div>'
//    '<div class="CON_Indicator CON_Disconnected"></div>'
    //$('#connection').html('<div class="CON_Indicator CON_Connecting"></div>');
    $('#connection').html('<div class="CON_Indicator CON_'+cState+'"></div>');
    
    if (cState=='Connected') {
        spu.consoleLog('Now connected !!!');
    
        workperiodCheck('',function wp(){
            if (module=='kitchen_display') {
                KD_refreshTaskList();
            }
            if (module=='customer_display') {
                //CD_clearDisplay();
                loadMODULE('customer_display');
            }
        });

    }
}

function HUB_parseMessage(message) {
    
    var msgStart = message.indexOf(':');
    var msgtoken = message.substr(0,msgStart+1);
    var msgcontent = message.substr(msgStart+1);
    
    countTrafficBytes(msgcontent,'signalr','rcvd');
    
    var msgParts = msgcontent.split(">");
    var msgType = msgParts[0]+">";
    var msgData  = msgParts[1];
    
    msgType = msgType.replace(/</,'');
    msgType = msgType.replace(/>/,'');

    var containsJSON = (msgData.indexOf('{')>-1 && msgData.indexOf('}')>-1 ? true :false);
    var msgJson = (containsJSON ? '['+msgData+']' : 'NOJSON');

    if (msgType == 'DELAYED_METHOD_REFRESH') {
        var removeFirst = msgData.replace(/AC_/,'');
        var pos = removeFirst.indexOf('_');
        var msgDataNew = removeFirst.substr(pos+1);
        //msgData = msgDataNew;
        return '<<<[ INCOMING ]<<< ' + msgType +'...'+ 'data_removed' +'...'+ 'NOJSON';
    }

    if (containsJSON) {
        return msgJson;
    }
    
    //return '['+when+' INCOMING] ' + msgEvent +'...'+ msgData +'...'+ msgJson;
    return '<<<[ INCOMING ]<<< ' + msgType +'...'+ msgData +'...'+ msgJson;
}

function HUB_handleEvent(ev) {
    var evContent  = ev[0];
    var evData = [];
//        eventData.push(JSON.stringify(evContent));
    
    if (ev[0]['eventName']) {
        var eventName = ev[0]['eventName'];
    }
    // seems there is a new message in .61+ called "event"
    if (ev[0]['event']) {
        var eventName = ev[0]['event'];
    }
    if (ev[0]['eventData']) {
        var eventData = ev[0]['eventData'];
    }
    if (ev[0]['sid']) {
        var sid = ev[0]['sid'];
    }
    if (ev[0]['userName']) {
        var userName = ev[0]['userName'];
    }
    if (ev[0]['terminal']) {
        var terminal = ev[0]['terminal'];
    }
    if (ev[0]['message']) {
        var message = ev[0]['message'];
    }
    if (ev[0]['ticketData']) {
        var ticketData = ev[0]['ticketData'][0]['data']['getCurrentTicket'];
    }
    
    spu.consoleLog('/////////////////////////// '+eventName+' /////////////////////////////////////');
    spu.consoleLog('... ... JSON ... ... ... ...');

    for(var i=0;i<ev.length;i++){
        var obj = ev[i];
        var subObj = {};
        
        for(var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            subObj[attrName] = attrValue;
            spu.consoleLog(attrName+':>'+attrValue);
            
            if (eventName == 'PAYMENT_PROCESSED' || eventName == 'TICKET_DISPLAYED') {
                switch (attrName) {
                    case 'totalAmount':
                        totalAmount = Number(attrValue).toFixed(2);
                        break;
                    case 'tenderedAmount':
                        tenderedAmount = Number(attrValue).toFixed(2);
                        break;
                    case 'processedAmount':
                        processedAmount = Number(attrValue).toFixed(2);
                        break;
                    case 'remainingAmount':
                        remainingAmount = Number(attrValue).toFixed(2);
                        break;
                    case 'balance':
                        balance = Number(attrValue).toFixed(2);
                        break;
                    case 'changeAmount':
                        changeAmount = Number(attrValue).toFixed(2);
                        break;
                    case 'paymentTypeName':
                        paymentTypeName = attrValue;
                        break;
                    case 'paymentDescription':
                        paymentDescription = attrValue;
                        break;
                }
            }
        }
        var subObjJSON = JSON.stringify(subObj);
        evData.push(subObj);
    }
    spu.consoleLog('... ... .... ... ... ... ...');


    switch (eventName) {
        case 'TICKET_DISPLAYED':
            if (module=='customer_display') {
                var tid = ticketData ? ticketData.id : 0;
                var ra  = ticketData ? ticketData.remainingAmount : 1;
                var ta  = ticketData ? ticketData.totalAmount : 0;
                CD_updateDisplay(ticketData);
                if (CD_enableFeedback) {
                    CD_showFeedbackScreen(tid,ra,ta);
                    if (tid===0 || ra>0) {
                        $('#CD_feedback').hide();
                    }
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'CLOSE_TICKET_NOW':
            if (module=='customer_display') {
                var tid = evData[0].ticketId;
                var ra  = evData[0] ? evData[0].remainingAmount : 1;
                var ta  = evData[0] ? evData[0].totalAmount : 0;
                CD_clearDisplay(tid);
                if (CD_enableFeedback) {
                    CD_showFeedbackScreen(tid,ra,ta);
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'CLOSE_TICKET_DELAYED':
            if (module=='customer_display') {
                spu.consoleLog(eventName+'> '+'Calling: CD_clearDisplay_delayed ...');
                var tid = evData[0].ticketId;
                CD_clearDisplay_delayed();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'PAYMENT_PROCESSED':
            if (module=='customer_display') {
                var tid = ticketData ? ticketData.id : 0;
                var ra  = ticketData ? ticketData.remainingAmount : 1;
                var ta  = ticketData ? ticketData.totalAmount : 0;
                CD_updateDisplay(ticketData);
                if (CD_enableFeedback) {
                    CD_showFeedbackScreen(tid,ra,ta);
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'GET_FEEDBACK':
            if (module=='customer_display') {
                var tid = evData[0].ticketId;
                var ra  = evData[0] ? evData[0].remainingAmount : 1;
                var ta  = evData[0] ? evData[0].totalAmount : 0;
                if (CD_enableFeedback) {
                    CD_showFeedbackScreen(tid,ra,ta);
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TASK_COMPLETED':
        case 'TASK_PRINTED':
            if (module=='kitchen_display') {
                spu.consoleLog(eventName+'> '+'Calling: KD_refreshTaskList_debounced ...');
                KD_refreshTaskList_debounced();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TASKS_COMPLETED_HTML':
            if (module=='kitchen_display' && sid!='' && sid!=sessionId) {
                spu.consoleLog(eventName+'> '+'Calling: KD_refreshTaskList_debounced ...');
                KD_refreshTaskList_debounced();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TASK_REFRESH':
            if (module=='kitchen_display') {
                spu.consoleLog(eventName+'> '+'Calling: KD_refreshTaskList_debounced ...');
                KD_refreshTaskList_debounced();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TIMECLOCK_REFRESH':
            if (module=='timeclock' && sid!='' && sid!=sessionId) {
                spu.consoleLog(eventName+'> '+'Calling: TC_refreshTimeclockDisplay ...');
                TC_refreshTimeclockDisplay(TC_EntityType,TC_EntitySearch);
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'CHAT':
            processChatMessage(evContent);
            break;
        case 'WORKPERIOD_REFRESH':
        case 'WORKPERIOD_STATUS':
            spu.consoleLog(eventName+'> '+'Calling: workperiodCheck ...');
            workperiodCheck('',function wpo(workperiod){
                //WPisOpen = (eventData=='0' ? false : true);
                //spu.consoleLog('WPID:'+workperiod.id +' Open:'+workperiod.isOpen);
                if (workperiod.isOpen) {
                    spu.consoleLog(eventName+'> '+'Workperiod is OPEN ('+workperiod.id+').');
                } else {
                    spu.consoleLog(eventName+'> '+'Workperiod is CLOSED ('+workperiod.id+').');
                }
                if (module=='customer_display') {
//                    CD_clearDisplay(function gct(){
                        loadMODULE('customer_display');
//                    });
                }
                if (module=='pos' && !workperiod.isOpen) {
                    showInfoMessage('Workperiod is CLOSED.<br /><br />Click to Retry.');
                }
                if (module=='pos' && workperiod.isOpen) {
                    $('#infoMessage').hide();
                }
            });
            break;
        case 'TICKETS_MERGED':
            if (module=='pos' && sid==sessionId) {
                if (POS_TicketAreaContent=='TicketList') {
                    var ticketIds = evData[0].ticketIds;
                    var ticketId = evData[0].ticketId;
                    if (ticketIds.indexOf(',')>-1) {
                        spu.consoleLog(eventName+'> '+'Calling: POS_refreshTicketList('+ticketIds+') ...');
                        POS_fillEntityGrids();
                        POS_refreshTicketList();
                        POS_loadTerminalTicket(POS_Terminal.id,ticketId);
                    } else {
                        spu.consoleLog('ticketIds is empty, skipping POS_refreshTicketList.');
                    }
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TICKET_CLOSED':
            if (module=='pos') {
                if (POS_TicketAreaContent=='TicketList') {
                    var tid = evData[0].ticketId;
                    if (tid>0) {
                        spu.consoleLog(eventName+'> '+'Calling: POS_refreshTicketList('+evData[0]['ticketId']+') ...');
                        POS_fillEntityGrids();
                        POS_refreshTicketList(tid);
                    } else {
                        spu.consoleLog('ticketId is 0, skipping POS_refreshTicketList.');
                    }
                }
            } else if (module=='customer_display') {
                var tid = evData[0].ticketId;
                var ra  = evData[0] ? evData[0].remainingAmount : 1;
                var ta  = evData[0] ? evData[0].totalAmount : 0;
                CD_clearDisplay(tid);
                if (CD_enableFeedback) {
                    CD_showFeedbackScreen(tid,ra,ta);
                }
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'TICKET_REFRESH':
            if (module=='pos') {
                var tid = evData[0].eventData;
                if (POS_TicketAreaContent=='Orders') {
                    if (tid>0) {
                        spu.consoleLog(eventName+'> '+'Calling: POS_getTerminalTicket('+evData[0]['ticketId']+') ...');
                        POS_loadTerminalTicket(POS_Terminal.id,tid);
//                        POS_getTerminalTicket(POS_Terminal.id);
                    } else {
                        spu.consoleLog('ticketId is 0, skipping POS_getTerminalTicket.');
                    }
                }
                if (POS_TicketAreaContent=='TicketList') {
                    spu.consoleLog(eventName+'> '+'Calling: POS_refreshTicketList('+evData[0]['ticketId']+') ...');
                    POS_refreshTicketList();
                }

            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'MERGE_TICKETS':
        case 'TICKET_OPENED':
//        case 'TICKET_REFRESH':
        case 'WIDGET_REFRESH':
        case 'NAVIGATION':
        case 'WORKPERIOD_CHECK':
            spu.consoleLog(eventName+'> '+'[ NO ACTIONS FOR THIS EVENT ]');
            break;
        default:
            spu.consoleLog(eventName+'> '+'!!! UNHANDLED EVENT !!! ');
    }

    spu.consoleLog('--------------------------- // -------------------------------------');
}



////////////////////////////
//
// REPORTS
//
////////////////////////////

function getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters,callback) {
    var fn = spu.fi(arguments);
    user = typeof user==='undefined' || user=='undefined' || user=='' ? defaultUser : user;
    
    spu.consoleLog('Getting Custom Report ('+reportName+')...');
    gql.EXEC(gql.getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getCustomReport", response);
        } else {
            var report = response.data.report;
            spu.consoleLog('getCustomReport:'+reportName+' (tables:'+report.tables.length+')');
        }
        if (callback) {
            callback(report);
        }
    });
    //return report;
}

function setReportFilterDefaults(callback) {
    $('#REP_DateStart').val(monthStart);
    $('#REP_DateEnd').val(monthEnd);
    if (callback) {
        callback();
    }
}
function refreshReportDisplay() {
    $('#REP_Reports').html('<div class="info-message">Fetching Reports, please Wait...<br /><br />'+busyWheel+'</div>');
    var replist = '';
    if (customReports.length>0) {
        for (var r=0; r<customReports.length; r++) {
            var rep = customReports[r];
            if (rep["displayInExplorer"]=='True') {
                replist += '<div id="Reports_'+rep["name"].replace(/ /g,'_')+'" class="REP_Report" isSelected="0" hasParms="'+rep["hasParms"]+'">' + rep["name"] + (rep["hasParms"]==='1' ? ' <span style="color:#55FFBB;" title="Report contains parameters which may be required to produce output.">*</span>' : '') + '</div>';
            }
        }
        $('#REP_Reports').empty();
        $('#REP_Reports').append(replist);
        $('#REP_Reports').append('<div style="height:80px;"> </div>');
    } else {
        $('#REP_Reports').html('<div class="info-message">No Reports found.</div>');
    }
}

function changeReportPeriod(period,parm) {
    switch (period) {
        case 'Yesterday':
            $('#REP_DateStart').val(yesterday);
            $('#REP_DateEnd').val(yesterday);
            //$('#REP_PeriodPicker').val('ignore');
            break;
        case 'This Month':
            $('#REP_DateStart').val(monthStart);
            $('#REP_DateEnd').val(monthEnd);
            //$('#REP_PeriodPicker').val('ignore');
            break;
        case 'Past Month':
            $('#REP_DateStart').val(monthPastStart);
            $('#REP_DateEnd').val(monthPastEnd);
            //$('#REP_PeriodPicker').val('ignore');
            break;
        case 'This Year':
            $('#REP_DateStart').val(yearStart);
            $('#REP_DateEnd').val(yearEnd);
            //$('#REP_PeriodPicker').val('ignore');
            break;
        case 'Past Year':
            $('#REP_DateStart').val(yearPastStart);
            $('#REP_DateEnd').val(yearPastEnd);
            //$('#REP_PeriodPicker').val('ignore');
            break;
        case 'ignore':
            $('#REP_PeriodPicker').val('ignore');
            break;
    }

    if (parm=='TC_Entities') {
        rb = TC_selectedEntities[0];
        if (document.getElementById(rb)) {
            var isSel = document.getElementById(rb).getAttribute('isSelected');
            if (isSel=='1') {
                document.getElementById(rb).click();
            }
        }
    } else {
        for (var e=0; e<customReports.length; e++) {
            var rb = 'Reports_' + customReports[e]["name"].replace(/ /g,'_');
            if (document.getElementById(rb)) {
                var isSel = document.getElementById(rb).getAttribute('isSelected');
                if (isSel=='1') {
                    document.getElementById(rb).click();
                    break;
                }
            }
        }
    }

}
function parseReportHeaderRows(customReportTemplate) {
    var rt = customReportTemplate;
    var dh = rt.split('>>');
    var sh = rt.split('>');

    for (var x=1; x<dh.length; x++) {
        var dbl = dh[x].split('|');
            dbl = dbl[0];
        if (dbl!='') {
            reportHeadersD.push(dbl);
            reportHeaders.push(dbl);
        }
    }
    for (var x=1; x<sh.length; x++) {
        var sng = sh[x].split('|');
            sng = sng[0];
        if (sng!='') {
            reportHeadersS.push(sng);
            reportHeaders.push(sng);
        }
    }
//    reportHeadersD.push('$1');
//    reportHeadersS.push('$1');
}
function parseReportColumns(cols) {
    var widthList = cols.replace(/ /g,'');
    var widths = widthList.split(',');
    var colCount = widths.length;
    var totalWidth = 0;
    
    for (var w=0; w<colCount; w++) {
        totalWidth+=Number(widths[w]);
    }
    reportColumnWidthTotal = totalWidth;
    
    reportColumnWidths = [];
    
    for (var w=0; w<colCount; w++) {
        var colWidth = (widths[w]/ totalWidth) * 100;
        reportColumnWidths.push(colWidth);
    }
}
   
function displayReport(report) {
    spu.consoleLog('Showing Report: '+report.name+' ...');
    
    var regexSep = new RegExp(sepThousand, "g");
    
    // {name,header,startDate,endDate,tables{name,maxHeight,columns{header},rows{cells}}}
    
    $('#REP_Report').empty();
    
    var repstuff = '';

    repstuff += '<div class="REPORT">';

    repstuff += '<div id="reportName" class="REPORT_name">' + report.name + '</div>';
    repstuff += '<div id="reportHeader" class="REPORT_header">' + report.header + '</div>';
    repstuff += '<div id="reportDate" class="REPORT_date">' + moment(report.startDate,"MM/DD/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + ' - ' + moment(report.endDate,"MM/DD/YYYY HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + '</div>';
    
    // start the loop for the report Tables
    for (var t=0; t<report.tables.length; t++) {
        if (report.tables[t].rows.length > 0) {

            repstuff += '<div id="reportTable_'+t+'" class="REPORT_table">';
            repstuff += '<div id="tableName_'+t+'" class="REPORT_tableName">' + report.tables[t].name + '</div>';

            // this colWidth calculation uses evenly-spaced columns
            var colCount = report.tables[t].columns.length;
            var colWidth = ((100/colCount) - 0);
                colWidth = colWidth + '%';

            repstuff += '<div class="REPORT_row">';

            // this colWidth assignment overrides the above
            // using a pre-populated array
            // that contains report template information
            // about the column widths, for example:
            // [ReportName:5, 3,2, 1, 1]
            // if we want evenly-spaced columns, then 
            // comment out the colWidth assignment
            // this loop is still required to display the column Headers
            // start the loop for report Header columns
            var columnHeaders = [];
            for (var col=0; col<report.tables[t].columns.length; col++) {
                var columnHeader = report.tables[t].columns[col].header;
                    columnHeader = (columnHeader===null ? '-' : columnHeader);
                    columnHeaders.push(columnHeader);
                var colWidth = reportColumnWidths[col] + '%';
                
                repstuff += '<div id="columnHeader_'+col+'" class="REPORT_columnHeader" style="width:'+colWidth+';">' + columnHeader + '</div>';
            }

            repstuff += '</div>';

            // this loops through a pre-populated array
            // that contains report template information
            // to determine if a row is prefixed with > or >>
            // reportHeadersS is for >
            // reportHeadersD is for >>
            // if we don't have these arrays, we can comment out this section
            var reportRowTypes = [];
            for (var row=0; row<report.tables[t].rows.length; row++) {
                var cell = report.tables[t].rows[row].cells[0];
                var rowType = 'normal';
                for (var rh=0; rh<reportHeadersS.length; rh++) {
                    if (cell==reportHeadersS[rh]) {
                        rowType = 'single';
                        break;
                    }
                }
                for (var rh=0; rh<reportHeadersD.length; rh++) {
                    if (cell==reportHeadersD[rh]) {
                        rowType = 'double';
                        break;
                    }
                }
                reportRowTypes.push(rowType);
            }
            
            // start the Row loop
            for (var row=0; row<report.tables[t].rows.length; row++) {
                repstuff += '<div id="row_'+row+'" class="REPORT_row"';
                repstuff += (reportRowTypes[row]=='double' ? ' style="font-weight:bold;background-color:#555577;color:#EEEEFF;"' : '');
                repstuff += (reportRowTypes[row]=='single' ? ' style="font-weight:bold;color:#EEEEFF;"' : '');
                repstuff += '>';
                
                // here we look at data in each cell and try to determine what  
                // type of data it is, like number, date, time, precent, etc.
                // once that is determined, we justify it left, center, or right
                // and optionally apply other formatting
                // start the Cell loop for the row
                for (var cell=0; cell<report.tables[t].rows[row].cells.length; cell++) {
                    var colWidth = reportColumnWidths[cell] + '%';
                    var cellData = report.tables[t].rows[row].cells[cell];
                    var isTemplate = columnHeaders[cell]=='Template' ? true : false;
                    var isNum  = isNumericWithSep(cellData,sepThousand);
                    var isPerc = isPercent(cellData);
                    var isDT   = isDate(cellData);
                    var isTM   = isTime(cellData);
                    var isBool = isBoolean(cellData);
                    var textAlign = 'left';
                        textAlign = (isPerc ? 'right'  : textAlign);
                        textAlign = (isNum  ? 'right'  : textAlign);
                        textAlign = (isDT   ? 'right'  : textAlign);
                        textAlign = (isTM   ? 'right'  : textAlign);
                        textAlign = (isBool ? 'center' : textAlign);
                    cellData = (cellData=='' ? '&nbsp;' : cellData);
                    cellData = (isNum ? cellData.replace(regexSep,'') : cellData);
                    cellData = (isNum && cellData.indexOf(sepDecimal)!==-1 && cellData.indexOf(sepDecimal)!==cellData.length-1 ? Number(cellData).toFixed(2) : cellData);
//                    var DT = (isDT && !isNum ? new Date(Date.parse(cellData)) : false);
//                        DT = (isDT && !isNum ? formatDateTime(DT,false,false).substr(0,10) : false);
                    var DT = (isDT ? moment(cellData,dateFormats).format("YYYY-MM-DD HH:mm:ss") : false);
                    cellData = (isDT && !isNum ? DT : cellData);
                    cellData = (isTemplate ? hex2string(cellData) : cellData);
                    
                    repstuff += '<div id="cell_'+row+'_'+cell+'" class="REPORT_cell" style="width:'+colWidth+';text-align:'+textAlign+';">' + cellData + '</div>';
                } // cell loop
                repstuff += '</div>';
            } // row loop

            repstuff += '</div>'; // table
            repstuff += ((t+1)==report.tables.length ? '' : '<div>&nbsp;</div>'); // add space between tables

        } // if table contains rows
    } // table loop
    
    repstuff += '</div>'; // report
    
    $('#REP_Report').append(repstuff);

    if (inSambaPOS) {
        document.getElementById('REP_Report').style.marginBottom = '0px';
    }
}



////////////////////////////
//
// TASKS
//
////////////////////////////

function getTasks(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback) {
    var fn = spu.fi(arguments);
    var startTime='';
    gql.EXEC(gql.getTasks2(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getTasks2", response);
            callback('ERROR');
        } else {
            var tasks = response.data.tasks;
            spu.consoleLog('Got Tasks: '+tasks.length);
        }
        if (callback) {
            callback(tasks);
        }
    });
}

function addTasks(taskTypes,taskNames,content,isCompleted,userName,customData,state, confirm, callback) {
    var fn = spu.fi(arguments);
    if (confirm !== false) {
        gql.EXEC(gql.addTasks(taskTypes,taskNames,content,isCompleted,userName,customData,state), function (response) {
            if (response.errors) {
                gql.handleError(fn+" gql.addTasks", response);
            } else {
                spu.consoleLog("addTasks Type("+taskTypes+') Name['+taskNames+'] State('+state+') Completed('+isCompleted+')');
            }
            if (callback) {
                //callback(TC_Tasks);
                callback(response);
            }
        });
    } else {
        if (callback) {
            callback(TC_Tasks);
        }
    }
}
function updateTasks(taskTypes, taskIDs, taskIdents, isCompleted, state, customData, content, name, confirm, callback) {
    var fn = spu.fi(arguments);
    if (confirm !== false) {
        gql.EXEC(gql.updateTask(taskTypes, taskIDs, taskIdents, isCompleted, state, customData, content, name), function (response) {
            if (response.errors) {
                gql.handleError(fn+" gql.updateTask", response);
            } else {
                spu.consoleLog("updateTasks Type("+taskTypes+') id['+taskIDs+'] ident['+taskIdents+'] State('+state+') Completed('+isCompleted+')');
            }
            if (callback) {
                callback(response);
            }
        });
    } else {
        if (callback) {
            callback();
        }
    }
}

function updateTasksByIdentifier(taskTypes, taskIdents, isCompleted, state, customData, content, confirm, callback) {
    var fn = spu.fi(arguments);
    if (confirm !== false) {
        gql.EXEC(gql.updateTaskByIdentifier(taskTypes, taskIdents, isCompleted, state, customData, content), function (response) {
            if (response.errors) {
                gql.handleError(fn+" gql.updateTaskByIdentifier", response);
            } else {
                spu.consoleLog("updateTasksByIdentifier Type("+taskTypes+') ident['+taskIdents+'] State('+state+') Completed('+isCompleted+')');
            }
            if (callback) {
                callback(TC_Tasks);
            }
        });
    } else {
        if (callback) {
            callback(TC_Tasks);
        }
    }
}
function updateTaskStateByIdentifier(taskTypes, taskIdents, state, stateDate, callback) {
    var fn = spu.fi(arguments);
    gql.EXEC(gql.updateTaskStateByIdentifier(taskTypes, taskIdents, state, stateDate), function (response) {
        if (response.errors) {
            gql.handleError(fn+" gql.updateTaskStateByIdentifier", response);
        } else {
        }
        if (callback) {
            callback(TC_Tasks);
        }
    });
}
function deleteTasks(taskIDs, confirm, callback) {
    var fn = spu.fi(arguments);
    if (confirm !== false) {
        gql.EXEC(gql.deleteTask(taskIDs), function (response) {
            if (response.errors) {
                gql.handleError(fn+" gql.deleteTask", response);
            } else {
                spu.consoleLog('deleteTasks id['+taskIDs+']');
            }
            if (callback) {
                callback(response);
            }
        });
    } else {
        if (callback) {
            callback();
        }
    }
}

function postTaskRefreshMessage(taskIDs, callback) {
    spu.consoleLog('Posting Task Refresh Message...');
    gql.EXEC(gql.postTaskRefreshMessage(taskIDs), callback);
}

function calculateTaskDuration() {
    var start = document.getElementById('taskStart').value;
    var end   = document.getElementById('taskEnd').value;
    
    var hours = datediff(start,end,'h').toFixed(2);
    var mins  = datediff(start,end,'m').toFixed(2);
    var secs  = datediff(start,end,'s').toFixed(2);

    var out = hours+' h / ' + mins+' m / ' + secs+' s';
    
    document.getElementById('taskDuration').value = out;
    return out;
}

function updateTaskMessage(msg) {
    $('#TSK_MSG').html(msg);
    jumpTop();
}

function loadTaskTypeList(callback) {
    if (document.getElementById('TSK_TaskTypePicker')) {
        TSK_TaskTypes = [];
        var ttypesstuff = '';
        getReportVars('GQLM Task Types','', function tt(data){
            taskTypes = data;
            
            getReportVars('GQLM Task Type Custom Fields','', function cf(cfdata){
                var ttcf = cfdata;
                
                for (var t=0; t<taskTypes.length; t++) {
                    var taskType = taskTypes[t].name;
                    
                    var customFields = [];
                    for (var c=0; c<ttcf.length; c++) {
                        var customField = ttcf[c];
                        if (customField.taskTypeId == taskTypes[t].id) {
                            customFields.push({name:customField.name,fieldType:customField.fieldType,displayFormat:customField.displayFormat,editingFormat:customField.editingFomat});
                        }
                    }
                    taskTypes[t].customFields = customFields;
                    
                    TSK_TaskTypes.push(taskType);
                    ttypesstuff += '<OPTION VALUE="'+taskType+'">'+taskType+'</OPTION>';
                }

                $('#TSK_TaskTypePicker').empty();
                $('#TSK_TaskTypePicker').append(ttypesstuff);
                
                if (callback) {
                    callback(taskTypes);
                }
            });
            
        });
    }
}

function getTaskEditorTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state, callback) {
    var fn = spu.fi(arguments);
    var timeOffset = getClientGMToffset().split(':');
    var offsetHours = Number(timeOffset[0]);
        offsetHours = offsetHours + Number(timeOffset[1])/60;

    gql.EXEC(gql.getTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getTasks", response);
            callback('ERROR');
        } else {
            TSK_Tasks = [];
            var tasks = response.data.tasks;
            spu.consoleLog('Got Task Editor Tasks: '+tasks.length);
            for (var t=0; t<tasks.length; t++) {
                
                // GQL getTasks returns start/end dates with the client TZ-offset already applied, 
                // not the actual dates as found in the DB, so we need to backout the offset
                var beg = tasks[t].startDate.replace(/Z/g,'');
                var end = tasks[t].endDate.replace(/Z/g,'');

                beg = moment(beg, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                end = moment(end, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
                
                tasks[t].startDate = beg;
                tasks[t].endDate =  end;
            }
            TSK_Tasks = tasks;
        }
        if (callback) {
            callback(TSK_Tasks);
        }
    });
    return TSK_Tasks;
}

function refreshTaskEditorDisplay(taskType,isCompleted,callback) {
    if (taskType=='') {
        taskType = $('#TSK_TaskTypePicker').val();
    }
    if (isCompleted=='') {
        isCompleted = $('#TSK_TaskCompletePicker').val();
    }
    
    $('#TSK_Detail').empty();
    $('#TSK_Tasks').html('<div class="info-message">Fetching Tasks, please Wait...<br /><br />'+busyWheel+'</div>');
    updateTaskMessage('');
    
    getTaskEditorTasks(taskType,isCompleted,'','','',''
        , function showTaskEditorTasks() {
            
            var tasks = TSK_Tasks;
            var taskCount = tasks.length;
            var taskstuff = '';
            
            for (var t=0; t<taskCount; t++) {
                var task = tasks[t];
                //TSK_Tasks.push('Tasks_' + task.id);
                
                taskstuff += '<div class="TSK_Task"';
                taskstuff += ' id="Tasks_' + task.id + '"';
                taskstuff += ' ident="' + task.identifier + '"';
                taskstuff += ' name="' + task.name + '"';
                taskstuff += ' isSelected="0"';
                taskstuff += '>';
                taskstuff += '<span style="font-weight:bold;color:#FFBB00;">' + task.name + '</span>';
                taskstuff += '<br /><span style="font-size:14px;">' + task.contentText + '</span>';
                taskstuff += '<br /><span style="font-size:14px;">(' + task.id + ') [' + task.identifier + ']</span>';
                taskstuff += '</div>';
            }
            
            spu.consoleLog('Displaying Task Editor Tasks: '+taskCount);
            
            $('#TSK_Tasks').empty();
            $('#TSK_Tasks').append(taskstuff);
            
            // shim for iPad scrolling
            //touchScroll('TSK_Tasks');
            $('#TSK_Tasks').append('<div style="height:80px;"> </div>');
            
            $('#TSK_Detail').empty();

            if (taskCount>0) {
                updateTaskMessage('Select a Task to display details.');
            } else {
                updateTaskMessage('');
                $('#TSK_Tasks').html('<div class="info-message" style="text-align:left;">No Tasks of selected Type/Completion.<br /><br />Select a different Type/Completion, or<br /><br />Click New to add a new Task.</div>');
            }


            if (callback) {
                callback();
            }
        });
}
