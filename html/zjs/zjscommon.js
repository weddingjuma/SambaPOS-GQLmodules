////////////////////////////////
//
// zjscommon
//
////////////////////////////////
function loadMODULE(modscreen) {
    
    spu.refreshMoments();
    
//    var users;
//    getUsers(function u(stuff){
//        users = stuff;
//        spu.consoleLog(users[0].PIN);
//    });
//    var passhash = CryptoJS.SHA512('1234').toString();
//    spu.consoleLog(passhash);
    
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
        
        $( "#containerMODULE" ).empty();
        $( '#containerMODULE' ).append('<br /><br /><div class="info-message">Loading Module:<br /><br />[ '+hdrTitle+' ]<br /><br />... please wait ...<br /><br />'+busyWheel+'</div>');

        // load HTML
        $( "#containerMODULE" ).load( modulePath + modscreen + '/index.html', function() {
            
            var tdStamp = new Date();
                tdStamp = tdStamp.getFullYear()+'-'+tdStamp.getMonth()+'-'+tdStamp.getDay()+'-'+tdStamp.getHours()+'.'+tdStamp.getMinutes()+'.'+tdStamp.getSeconds();
            
            // set the JS file to use for MODULE
            var moduleJS = modulePath + modscreen + '/module.js';
                //moduleJS+= '?ts='+tdStamp; // prevents caching
                
            // load JS
            var s = document.createElement("script");
                s.type = "text/javascript";
                s.src = moduleJS;
                s.innerHTML = null;
                s.id = "js_"+modscreen;
                document.getElementById("js_mod").innerHTML = "";
                document.getElementById("js_mod").appendChild(s);
            
            spu.consoleLog( '+++++ LOADED: ' + moduleJS );


            // perform initial functions pertaining to MODULE

            if (modscreen=='pos') {
                workperiodCheck('',function wpo(workperiod){
                    WPisOpen = workperiod.isOpen;
                    if (!workperiod.isOpen) {
                        spu.consoleLog('POS NOT ready.  Workperiod is CLOSED.');
                        showInfoMessage('Workperiod is CLOSED.<br /><br />Click to Retry.');
                    }
                    POS_refreshPOSDisplay();
                });
            }
            
            if (modscreen=='kitchen_display') {
                KD_refreshTaskList();
            }
            if (modscreen=='customer_display') {
                CD_clearDisplay();
            }
            if (modscreen=='timeclock') {
                TC_refreshTimeclockDisplay(TC_EntityType,TC_EntitySearch);
                setReportFilterDefaults();
            }
            if (modscreen=='reports') {
                refreshReportDisplay();
                setReportFilterDefaults();
            }
            if (modscreen=='ticket_explorer') {
                $('#TE_DisplayTicket').hide();
                TE_changeTicketExplorerFilters('REP_PeriodPicker');
            }
            if (modscreen=='timeclock_policies') {
                TSK_TaskTypes = [];
                TSK_TaskTypes.push(TC_PolicyTaskType);
                $('#TSK_TaskTypePicker').empty();
                $('#TSK_TaskTypePicker').append('<OPTION VALUE="'+TSK_TaskTypes[0]+'">'+TSK_TaskTypes[0]+'</OPTION>');
                refreshTaskEditorDisplay(TSK_TaskTypes[0],'false');
            }
            if (modscreen=='punch_editor') {
                TSK_TaskTypes = [];
                TSK_TaskTypes.push(TC_PunchControlTaskType);
                $('#TSK_TaskTypePicker').empty();
                $('#TSK_TaskTypePicker').append('<OPTION VALUE="'+TSK_TaskTypes[0]+'">'+TSK_TaskTypes[0]+'</OPTION>');
                refreshTaskEditorDisplay(TSK_TaskTypes[0],'true');
            }
            if (modscreen=='task_editor') {
                loadTaskTypeList(function tedisp(){
                    refreshTaskEditorDisplay(TSK_TaskTypes[0],'false');
                });
            }
            if (modscreen=='chat') {
                getChatMessages();
                document.getElementById('CHAT_Input').focus();
            }
            
            // update page Title
            updatePageTitle(modscreen);
            
            // broadcast MODULE to terminals
            sendMODULE(module);
            
        });

    } else {
        console.log('!!! ERROR: Module is not valid !!! '+modscreen);
    }

}


function navigateTo(moduleParm,moduleVal,navParm) {
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




//////////////////////////////////////////////////////////////
//
// BEG $(document).ready(function(){
//
// when the page is fully loaded, these methods are fired
//  
//////////////////////////////////////////////////////////////

$(document).ready(function(){

    sessionId = session_id();
    currentTerminal = navigator.sayswho;
    
    if (inSambaPOS){
        spu.getEmbeddedUserTerminal();
    }


//    users = getReportVars('PHP Users');
//    taskTypes = getReportVars('PHP Task Types');
    //customReports = getReportVars('PHP Custom Reports');

    spu.getBusinessSettings();

    $('#module').html('???');
    $('#currentUser').html('['+currentTerminal+'] '+currentUser);
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
        //spu.consoleLog('*** MSG RCVD:'+message);
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
            // if the Help Message has focus, we can close it by hitting ESC
//            if (helpMessageID == hasFocus) {
                if (kc==27) {
                    $('#helpMessage').hide();
                    $('#errorMessage').hide();
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

});

//////////////////////////////////////////////////////////////
//
// END OF $(document).ready(function(){
// 
//////////////////////////////////////////////////////////////


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



function workperiodCheck(wpid,callback) {
    spu.consoleLog('Checking Workperiod Status...');
    //getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters,function currentWP(report) {
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
    


function sendMODULE(modscreen) {
    var msg = '{"eventName":"NAVIGATION","eventData":"'+'NAV_'+modscreen+'","sid":"'+sessionId+'"}';
    gql.EXEC(gql.postBroadcastMessage(msg), function(response) {
        if (response.errors) {
            gql.handleError("postBroadcastMessage", response.errors);
        } else {
            
        }
    });
}

function getLocalSetting(settingName, callback) {
    gql.EXEC(gql.getLocalSetting(settingName), function(response) {
        var sName='';
        var sValu='';
        if (response.errors) {
            gql.handleError("getLocalSetting", response.errors);
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
    gql.EXEC(gql.getGlobalSetting(settingName), function(response) {

        var setting = {};
            setting.error = '';

        if (response.errors) {
            gql.handleError("getGlobalSetting", response.errors);
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

function getTickets(startDate,endDate,isClosed,orderBy,take,skip, callback) {
    gql.EXEC(gql.getTickets(startDate,endDate,isClosed,orderBy,take,skip), function(response) {
        if (response.errors) {
            gql.handleError("getTickets", response.errors);
            if (callback) {
                callback('ERROR');
            }
        } else {
            var tickets = response.data.tickets;
            spu.consoleLog('Got Tickets: '+tickets.length);
            if (callback) {
                callback(tickets);
            }
        }

    });
}

function getTasks(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback) {
    var startTime='';
    gql.EXEC(gql.getTasks2(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter), function(response) {
        if (response.errors) {
            gql.handleError("getTasks2", response.errors);
            callback('ERROR');
        } else {
            var tasks = response.data.tasks;
            spu.consoleLog('Got Tasks: '+tasks.length);
        }
        if (callback) {
            callback(tasks);
        }
    });
    //return tasks;
}

function TC_getTimeclockTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state, callback) {
    var startTime='';
    gql.EXEC(gql.getTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state), function(response) {
        if (response.errors) {
            gql.handleError("TC_getTimeclockTasks", response.errors);
            callback('ERROR');
        } else {
            TC_Tasks = [];
            var tasks = response.data.tasks;
            spu.consoleLog('Got Timeclock Tasks: '+tasks.length);
            TC_Tasks = tasks;
        }
        if (callback) {
            callback(TC_Tasks);
        }
    });
    return TC_Tasks;
}

function getTaskEditorTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state, callback) {
    var startTime='';
    gql.EXEC(gql.getTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state), function(response) {
        if (response.errors) {
            gql.handleError("getTaskEditorTasks", response.errors);
            callback('ERROR');
        } else {
            TSK_Tasks = [];
            var tasks = response.data.tasks;
            spu.consoleLog('Got Task Editor Tasks: '+tasks.length);
            TSK_Tasks = tasks;
        }
        if (callback) {
            callback(TSK_Tasks);
        }
    });
    return TSK_Tasks;
}

function KD_completeTasks(taskIDs, taskIdents, isCompleted, callback) {
    spu.consoleLog('Marking KD Tasks Complete...');
    $('#KD_Food').html('<div class="info-message">Completing Tasks, please Wait...<br /><br />'+busyWheel+'</div>');

    var taskTypes = [];
    for (var t=0; t<taskIDs.length; t++) {
        taskTypes.push(KD_HTMLtaskType);
    }

  //updateTasks(taskTypes, taskIDs, taskIdents, isCompleted, state, customData, content, name, confirm, callback)
    updateTasks(taskTypes, taskIDs, taskIdents, isCompleted, ''   , ''        , ''     , ''  , true   , function updTskId(){
        
        spu.consoleLog("Completed KD HTML Tasks!");

        if (KD_interop) {
            var taskTypes = [];
            for (var t=0; t<taskIdents.length; t++) {
                taskTypes.push(KD_GUItaskType);
            }

          //updateTasksByIdentifier(taskTypes, taskIdents, isCompleted, state, customData, content, confirm, callback)
            updateTasksByIdentifier(taskTypes, taskIdents, isCompleted, ''   , ''        , ''     , true   , function updTskIdent(){

                spu.consoleLog("Completed KD GUI Tasks!");
                
                var msg = '{"eventName":"TASKS_COMPLETED_HTML","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
                broadcastMessage(msg);
                if(callback) {
                    callback(updatedTasks);
                }
            });
            
        } else {

            var msg = '{"eventName":"TASKS_COMPLETED_HTML","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
            broadcastMessage(msg);
            if(callback) {
                callback(updatedTasks);
            }
        }
    });
}
function addTasks(taskTypes,taskNames,content,isCompleted,userName,customData,state, confirm, callback) {
    if (confirm !== false) {
        gql.EXEC(gql.addTasks(taskTypes,taskNames,content,isCompleted,userName,customData,state), function (response) {
            if (response.errors) {
                gql.handleError("addTasks", response.errors);
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
    if (confirm !== false) {
        gql.EXEC(gql.updateTask(taskTypes, taskIDs, taskIdents, isCompleted, state, customData, content, name), function (response) {
            if (response.errors) {
                gql.handleError("updateTasks", response.errors);
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
    if (confirm !== false) {
        gql.EXEC(gql.updateTaskByIdentifier(taskTypes, taskIdents, isCompleted, state, customData, content), function (response) {
            if (response.errors) {
                gql.handleError("updateTasksByIdentifier", response.errors);
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
    gql.EXEC(gql.updateTaskStateByIdentifier(taskTypes, taskIdents, state, stateDate), function (response) {
        if (response.errors) {
            gql.handleError("updateTaskStateByIdentifier", response.errors);
        } else {
        }
        if (callback) {
            callback(TC_Tasks);
        }
    });
}
function deleteTasks(taskIDs, confirm, callback) {
    if (confirm !== false) {
        gql.EXEC(gql.deleteTask(taskIDs), function (response) {
            if (response.errors) {
                gql.handleError("deleteTasks", response.errors);
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

function broadcastMessage(msg) {
    spu.consoleLog('Broadcasting Message:'+msg);
    gql.EXEC(gql.postBroadcastMessage(msg), function(response) {
        if (response.errors) {
            gql.handleError("broadcastMessage", response.errors);
        } else {
            spu.consoleLog('Message Broadcasted:'+response.data.postBroadcastMessage.message);
        }
    });
}

function getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters,callback) {
    spu.consoleLog('Getting Custom Report ('+reportName+')...');
    gql.EXEC(gql.getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters), function(response) {
        if (response.errors) {
            gql.handleError("getCustomReport", response.errors);
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

function updateEntityState(entityType,entityName,stateName,state,callback) {
    gql.EXEC(gql.updateEntityState(entityType,entityName,stateName,state), function(response) {
        if (response.errors) {
            gql.handleError("updateEntityState", response.errors);
        } else {
            var ent = response.data.updateEntityState;
        }
        if (callback){
            callback(ent);
        }
    });
}

function KD_formatTaskStatus() {
        var refreshedTaskCards = '';
        for (var t=1; t<=taskCount; t++) {
            if (document.getElementById('KD_Task_Status_'+t)) {
                var taskCard = document.getElementById('KD_Task_Status_'+t);
                var taskDTstart = taskCard.getAttribute('taskDTstart');
                var taskDT = taskDTstart.split('T');
                var taskDateStart = taskDT[0];
                var taskTimeStart = taskDT[1].substr(0,5);
                var when = new Date();
                when = formatDateTime(when);
                var elapsedMinutes = datediff(taskDTstart,when,'m').toFixed(3);
                var orderAge = 'new';
                var orderStatusBGcolor = '#004400';
                var orderStatusText = 'New Order';
                var orderStatusColor = '#55FF55';
                if (elapsedMinutes < 15) {
                    orderAge = 'new';
                    orderStatusBGcolor = '#002200';
                    orderStatusColor = '#55FF55';
                    orderStatusText = 'New Order ('+Number(elapsedMinutes).toFixed(0)+' min)';
                }
                if (elapsedMinutes >= 15 && elapsedMinutes < 25) {
                    orderAge = 'medium';
                    orderStatusBGcolor = '#FFDD00';
                    orderStatusColor = '#000000';
                    orderStatusText = Number(elapsedMinutes).toFixed(0)+' minutes old';
                }
                if (elapsedMinutes >= 25 && elapsedMinutes < 45) {
                    orderAge = 'old';
                    orderStatusBGcolor = '#FF0000';
                    orderStatusColor = '#FFFFFF';
                    orderStatusText = Number(elapsedMinutes).toFixed(0)+' minutes old';
                }
                if (elapsedMinutes >= 45) {
                    orderAge = 'stale';
                    orderStatusBGcolor = '#001177';
                    orderStatusColor = '#55BBFF';
                    orderStatusText = 'STALE ('+Number(elapsedMinutes).toFixed(0)+' min)';
                }

                taskCard.style.color = orderStatusColor;
                taskCard.style.backgroundColor = orderStatusBGcolor;
                taskCard.innerHTML = ' ['+taskTimeStart+'] '+orderStatusText+' ';

                refreshedTaskCards += t+',';
            }
        }
        if (refreshedTaskCards.length>0) {
            spu.consoleLog('Refreshed Task Card Statuses:'+refreshedTaskCards.substr(0,refreshedTaskCards.length-1));
        }
}
function KD_updateTaskCards() {
    var refreshedTaskCards = '';
    if (taskCount>0) {
        KD_formatTaskStatus();
    }
}
function KD_taskStatusTimer(op,rate) {
    if (op=='start') {
        taskCardTimer = setInterval(KD_updateTaskCards, rate);
        spu.consoleLog('Started Task Status Updater with refresh rate: '+rate+' ms.');
    } else {
        clearInterval(taskCardTimer);
        spu.consoleLog('Stopped Task Status Updater.');
    }
}
function KD_refreshTaskList(callback){
    $('#KD_Food').html('<div class="info-message">Fetching Tasks, please Wait...<br /><br />'+busyWheel+'</div>');

    gql.EXEC(gql.getTasks(KD_HTMLtaskType,'false'), function(response) {
        if (response.errors) {
            gql.handleError("KD_refreshTaskList", response.errors);
        } else {
            taskCount = 0;

            if (taskCount < 1) {
                KD_taskStatusTimer('stop');
            }

            taskCount = response.data.tasks.length;

            spu.consoleLog('Refreshing Task List... TASKS:'+taskCount);
            
            var cardsPerRow = 4;
            var cardCount = 0;
            
            var stuff = '';

            for (var t=0; t<taskCount; t++) {
                var taskNumber = t+1;
                cardCount++;
                var task = response.data.tasks[t];
                var taskName = (task.name ? task.name : '');
                var taskNameParts = taskName.split(' - ');
                var taskEntities = (taskNameParts[1] ? taskNameParts[1] : '...');
                var taskContent = task.content;

                spu.consoleLog('TASK (card:'+taskNumber+') (id:'+task.id+'):'+task.name+' ... content:'+task.contentText.substr(0,6));
                
                stuff += '<div id="KD_Task_'+taskNumber+'" taskID="'+task.id+'" cardNumber="'+taskNumber+'" ident="'+task.identifier+'" class="KD_TaskCard_Food" isSelected="0">';
                stuff += '<div class="KD_Task_Entities">' + taskEntities + '</div>';
                stuff += '<div class="KD_Task_CardNumber">' + taskNumber + '</div>';

                var timeOffset = getClientGMToffset().split(':');
                var offsetHours = Number(timeOffset[0]);
                    offsetHours = offsetHours + Number(timeOffset[1])/60;
                    offsetHours = offsetHours * -1;
                    offsetHours = 0;
                var elemDate = moment(task.startDate, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DDTHH:mm:ss');

                stuff += '<div id="KD_Task_Status_'+taskNumber+'" taskDTstart="'+elemDate+'" class="KD_Task_Status">';
                //stuff += ' ['+taskTimeStart+'] '+orderStatusText+' ';
                stuff += '</div>';
                
                stuff += taskContent;
                stuff += '</div>';
            }

            $("#KD_Food").empty();
            $('#KD_Food').append(stuff);

            if (taskCount > 0) {
                KD_formatTaskStatus();
                KD_taskStatusTimer('start',30000);
            }

            spu.consoleLog("Refreshed KD Tasks!");

            if (callback) {
                callback();
            }
        }
    });
}
//var KD_refreshTaskList_debounced = spu.debounce(KD_refreshTaskList,2500);
//var KD_refreshTaskList_debounced = spu.debounce(KD_refreshTaskList,1000);
var KD_refreshTaskList_debounced = spu.debounce(KD_refreshTaskList,1000);

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
    if (ev[0]['eventName']) {
        var eventName = ev[0]['eventName'];
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
        for(var key in obj){
            var attrName = key;
            var attrValue = obj[key];
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
    }
    spu.consoleLog('... ... .... ... ... ... ...');


    switch (eventName) {
        case 'TICKET_DISPLAYED':
            if (module=='customer_display') {
                CD_updateDisplay(ticketData);
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'CLOSE_TICKET_NOW':
            if (module=='customer_display') {
                CD_clearDisplay();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'CLOSE_TICKET_DELAYED':
            if (module=='customer_display') {
                spu.consoleLog(eventName+'> '+'Calling: CD_clearDisplay_delayed ...');
                CD_clearDisplay_delayed();
            } else {
                spu.consoleLog('[ NO ACTIONS FOR EVENT IN THIS CONTEXT ('+module+') ]');
            }
            break;
        case 'PAYMENT_PROCESSED':
            if (module=='customer_display') {
                CD_updateDisplay(ticketData);
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
        case 'TICKET_OPENED':
        case 'TICKET_CLOSED':
        case 'TICKET_REFRESH':
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

function getChatMessages(callback) {
    // getTasks(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback)
    getTasks('CHAT Message Task', nowDateLessDay, monthEnd, false, '', '', '', '', function gt(tasks){
        var chatMessages = '';
        for (var t=0; t<tasks.length; t++) {
            var task = tasks[t];
            var cd = {};
            for (var c=0; c<task.customData.length; c++) {
                var d = task.customData[c];
                cd[d.name] = d.value;
            }
            
            var msgDateTime = task.startDate.substr(0,16).replace(/T/g,' ');
            chatMessages += '<span style="color:#AAAAAA">' + msgDateTime + ' </span>';
            
            if (cd.sid == sessionId) {
                chatMessages += '<span style="color:Orange">[YOU] ';
            }
            
            chatMessages += '['+cd.terminal+'] (' + cd.user +'): '+ task.content + "<br/>";
            
            if (cd.sid == sessionId) {
                chatMessages += '</span>';
            }
        }
            
        $('#MSG_FS_messages').empty();
        $('#MSG_FS_messages').append(chatMessages);
        $("#MSG_FS_messages").scrollTop($("#MSG_FS_messages")[0].scrollHeight);

//            $('#MSG_FS_messages').append(post);
//            $("#MSG_FS_messages").scrollTop($("#MSG_FS_messages")[0].scrollHeight);

        if (document.getElementById('CHAT_messages')) {
            $('#CHAT_messages').html( $('#MSG_FS_messages').html() );
            $("#CHAT_messages").scrollTop($("#CHAT_messages")[0].scrollHeight);
        }

        if (callback) {
            callback(chatMessages);
        }
        return chatMessages;
    });
}

function processChatMessage(m) {
    var msg  = m.message;
    var term = m.terminal;
    var usr  = m.userName;
    var sid  = m.sid;
    var post = '['+term+'] '+usr+': '+msg+'<br />';
    spu.consoleLog('CHAT Message: '+post);
    if (sessionId == sid) {
        spu.consoleLog('CHAT message is from this client... skipping.');
    } else {
        $('#MSG_messaging').html('<div class="MSG_Indicator MSG_NewMessage">MSG</div>');
        // getTasks(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback)
        getChatMessages();
    }
}
function sendChatMessage (usr,term,sid,msg) {
    var dtNow = new Date();
    var utcMilliSeconds = getDateTime(dtNow,'ms');
    var taskTypes = ['CHAT Message Task'];
    var taskNames = [usr+'-'+sid];
    var customData = [];
        customData.push({name:"Id",value:utcMilliSeconds+'-'+usr});
        customData.push({name:"terminal",value:term});
        customData.push({name:"user",value:usr});
        customData.push({name:"sid",value:sid});
        customData.push({name:"message",value:msg});
        
    // addTasks(taskTypes,taskNames,content,isCompleted,userName,customData,state, confirm, callback)
    addTasks(taskTypes,taskNames,msg,false,usr,customData,'',true, function sm(){
        var bmsg = '{"eventName":"CHAT","userName":"'+usr+'","terminal":"'+term+'","sid":"'+sid+'","message":"'+msg+'"}';
        broadcastMessage(bmsg);
    });
}
function chatSendClick(btn) {
    var msg = '';
    if (document.getElementById(btn+'_Input')) {
        msg = document.getElementById(btn+'_Input').value;
        spu.consoleLog('MSG:'+msg);

        $('#MSG_messaging').html('<div class="MSG_Indicator MSG_NoMessage">MSG</div>');

        if (msg!='') {
            document.getElementById(btn+'_Input').value='';
            var usr = currentUser;
            var term = currentTerminal;
            var sid = sessionId;
            var post = '<span style="color:#AAAAAA">' + moment().format('YYYY-MM-DD HH:mm') + ' </span>';
                post+= '<span style="color:Orange">[YOU] ('+usr+'): '+msg+'</span><br />';
            sendChatMessage(usr,term,sid,msg);
            $('#'+btn+'_Input').focus();
            if (document.getElementById('MSG_FS_messages')) {
                $('#MSG_FS_messages').append(post);
                $("#MSG_FS_messages").scrollTop($("#MSG_FS_messages")[0].scrollHeight);
            }
            if (document.getElementById('CHAT_messages')) {
                $('#CHAT_messages').html( $('#MSG_FS_messages').html() );
                $("#CHAT_messages").scrollTop($("#CHAT_messages")[0].scrollHeight);
            }
        }
    }
}
function chatShowFull(hideShow) {
    if (hideShow=='hide') {
        $('#MSG_fullscreen').hide();
    } else {
        getChatMessages();
        $('#MSG_fullscreen').show();
        $('#MSG_FS_Input').focus();
        $('#MSG_messaging').html('<div class="MSG_Indicator MSG_OldMessage">MSG</div>');
    }
}





function CD_clearDisplay() {
    spu.consoleLog('Clearing Customer Display...');
    $("#CD_orders").empty();
    $('#CD_ticketTotalValue').empty();
    $('#CD_ticketDiscounts').empty();
    $('#CD_ticketHeader').empty();
    
    $('#CD_orders').hide();
    $('#CD_ticketTotalValue').hide();
    $('#CD_ticketDiscounts').hide();
    $('#CD_ticketHeader').hide();

    //$('#CD_idle').show();
    
    var idlestuff = '';
    idlestuff += welcomeMessage+'<br /><br /><span class="CD_venueName">'+venueName+'</span>';
    idlestuff += '<br /><br /><br />';
    idlestuff += (WPisOpen ? openMessage : closedMessage);
    $('#CD_idle').html(idlestuff);
    $('#CD_idle').show();
}
var CD_clearDisplay_delayed = spu.debounce(CD_clearDisplay,15000);

function CD_updateDisplay(ticketData) {
    spu.consoleLog('Updating Customer Display...');

    var timeOffset = getClientGMToffset().split(':');
    var offsetHours = Number(timeOffset[0]);
        offsetHours = offsetHours + Number(timeOffset[1])/60;
        //offsetHours = offsetHours * -1;
        offsetHours = 0;
    
    if (ticketData) {
        spu.consoleLog('Displaying Ticket, Number:'+ticketData.number+' (Id:'+ticketData.id+') Date:'+ticketData.date+' ...');

        var elemDate = moment(ticketData.date, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');

        var totalAmount = Number(ticketData.totalAmount).toFixed(2);
        var remainingAmount = Number(ticketData.remainingAmount).toFixed(2);

        var orderUID = 0;
        var cdttl = 0;
        var discountttl = 0;
        var giftttl = 0;
        var savingsttl = 0;

        $('#CD_idle').hide();

        $('#CD_orders').show();
        $('#CD_ticketTotalValue').show();
        $('#CD_ticketDiscounts').show();
        $('#CD_ticketHeader').show();

        var stuff = '';

        for (var o=0; o<ticketData.orders.length; o++) {
            var order = ticketData.orders[o];
            orderUID++;
            order.orderUID = orderUID;
            var price = Number(order.price).toFixed(2);
            order.priceTotal = (Number(order.quantity) * Number(order.price));
            var orderQuantity = Number(order.quantity).toFixed(0);

            var portion = (order.portion!='Normal' ? '<span style="color:#00AAEE;font-size:16px;"> ('+order.portion+')</span>' : '');

            stuff += '<div class="CD_order">';
            stuff += '<div class="CD_orderLine">';
            stuff += '      <div class="CD_orderQuantity">'+orderQuantity+'</div>';
            stuff += '      <div class="CD_orderName">'+order.name+portion+'</div>';
            stuff += '      <div class="CD_orderPrice">'+price+'</div>';

            for (var t=0; t<order.tags.length; t++) {
                var orderTag = order.tags[t];
                if (orderTag.price!=0) {
                    order.priceTotal = order.priceTotal + (orderTag.quantity * orderTag.price);
                }
                if (orderTag.price<0) {
                    discountttl = (Number(discountttl) + ((orderTag.quantity * orderTag.price) * -1));
                }
            }
            
            var oStates = '';
            for (var s=0; s<order.states.length; s++) {
                var orderState = order.states[s];
                oStates += orderState.state + (s!=(order.states.length-1) ? ', ' : '');
                
                if (orderState.state=='Void') {
                    order.priceTotal = 'VOID';
                } else if (orderState.state=='Gift') {
                    giftttl = (Number(giftttl) + Number(order.priceTotal));
                    order.priceTotal = 'FREE';
                } else {
                    cdttl = (Number(cdttl) + Number(order.priceTotal)).toFixed(2);
                }
            }
            
            order.priceTotal = (isNumeric(order.priceTotal) ? order.priceTotal.toFixed(2) : order.priceTotal);
            
            stuff += '<div id="orderPriceTotal" class="CD_orderPriceTotal'+(isNumeric(order.priceTotal) ? '' : ' CD_'+order.priceTotal)+'">'+order.priceTotal+'</div>';

            stuff += '</div>';

            // we don't need Order States on the Customer Display...
            //
            //stuff += '<div class="CD_orderState">'+oStates+'</div>';
            //
            //

            for (var t=0; t<order.tags.length; t++) {
                var orderTag = order.tags[t];
                var tagPrice = Number(orderTag.price).toFixed(2);
                var tagTotalPrice = (Number(order.quantity) * Number(orderTag.quantity) * Number(orderTag.price)).toFixed(2);

                stuff += '<div class="CD_orderTagValue">';
                stuff += (orderTag.quantity > 1 ? orderTag.quantity+'x' : '&nbsp;&nbsp;');
                stuff += '&nbsp;'+orderTag.tag;
                stuff += (tagPrice!=0 ? ' ... '+tagPrice+' ... '+tagTotalPrice : '');
                stuff += '</div>';
                cdttl = (Number(cdttl) + Number(tagTotalPrice)).toFixed(2);
            }
            //});

            stuff += '</div>';

            savingsttl = (Number(discountttl) + Number(giftttl));
        }
        //});

        $("#CD_orders").empty();
        $("#CD_orders").append(stuff);
        $("#CD_orders").scrollTop($("#CD_orders")[0].scrollHeight);

        var headerstuff = '';
        headerstuff += '<div style="display:flex;flex-direction:column;" id="ticket_'+ticketData.id+'">';
        headerstuff += '<div class="CD_paymentLine">';
        headerstuff += '<div class="CD_paymentLabel">TICKET:'+ticketData.number+' (Id:'+ticketData.id+') '+elemDate+'</div>';
        headerstuff += '<div class="CD_paymentAmt">';
        var entitystuff = '';

        var entCount = ticketData.entities.length;
        for (var e=0; e<entCount; e++) {
            var entity = ticketData.entities[e];
            entitystuff += entity.type.substr(0,(entity.type.length-1))+':<b>'+entity.name+'</b>';
            entitystuff += (e==entCount-1) ? '' : ' / ';
        }

        headerstuff += entitystuff+'</div></div>';
        headerstuff += '</div>';
        $("#CD_ticketHeader").html(headerstuff);


        var paystuff = '';
        paystuff += '<div style="display:flex;flex-direction:column;">';
        paystuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">TOTAL: </div><div class="CD_paymentAmt">'+totalAmount+'</div></div>';
        paystuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">Paid: </div><div class="CD_paymentAmt">'+(totalAmount-remainingAmount).toFixed(2)+'</div></div>';
        paystuff += (tenderedAmount>0 ? '<div class="CD_paymentLine"><div class="CD_paymentLabel">Tendered: </div><div class="CD_paymentAmt"><span class="CD_paymentType">('+paymentTypeName+')</span> '+tenderedAmount + '</div></div>' : '');
        paystuff += (processedAmount>0 ? '<div class="CD_paymentLine"><div class="CD_paymentLabel">Processed: </div><div class="CD_paymentAmt">'+processedAmount + '</div></div>' : '');
        paystuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">OWING: </div><div class="CD_paymentAmt">'+remainingAmount+'</div></div>';
        paystuff += (changeAmount>0 ? '<div class="CD_paymentLine"><div class="CD_paymentLabel">CHANGE: </div><div class="CD_paymentAmt">'+changeAmount+'</div></div>' : '');
        paystuff += '</div>';

        $('#CD_ticketTotalValue').html(paystuff);

        var savingstuff = '';
        savingstuff += '<div style="display:flex;flex-direction:column;">';
        savingstuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">FREE: </div><div class="CD_paymentAmt">'+giftttl.toFixed(2)+'</div></div>';
        savingstuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">Discounts: </div><div class="CD_paymentAmt">'+discountttl.toFixed(2)+'</div></div>';
        savingstuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">TOTAL SAVINGS: </div><div class="CD_paymentAmt">'+savingsttl.toFixed(2)+'</div></div>';
        savingstuff += '</div>';

        if (Number(savingsttl) != 0) {
            $('#CD_ticketDiscounts').html(savingstuff);
            $('#CD_ticketDiscounts').show();
        } else {
            $('#CD_ticketDiscounts').hide();
        }
        
        //spu.consoleLog(evContent);
        spu.consoleLog(ticketData);
    } else {
        spu.consoleLog('No ticketData to display !!!');
    }
}

function TC_refreshEmployeeEntities(entityType, search, stateFilter, tasks, callback){
    // singular name of entityType
    var eType = entityType.substr(0,entityType.length-1);
    
    var GMToffset = getClientGMToffset();
    
    gql.EXEC(gql.getEntities(entityType, search, stateFilter), function(response) {
        if (response.errors) {
            gql.handleError("TC_refreshEmployeeEntities", response.errors);
        } else {
            spu.consoleLog('TC_refreshEmployeeEntities:'+entityType+' ('+response.data.entities.length+')');
            
            var entities = response.data.entities;

            $('#TC_Entities').empty();

            jsonData = entities;
            jsonData = sortJSON(jsonData,"name",true);
            
            TC_Entities = [];

            for (var e=0; e<entities.length; e++) {
                
                var entity = entities[e];

                for (var s=0; s<entity.states.length; s++) {
                    var ST = entity.states[s];
                    if (ST.stateName=="TC Punch Status") {
                        entity.punchState = ST.state;
                        entity.punchStateClass = 'TC_' + ST.state.replace(/ /g,'_');
                        //spu.consoleLog(entity.type+":"+entity.name+" Status State:"+ST.state+entity.statusState);
                    }
                }
                
                var payRates = '';
                
                for (var c=0; c<entity.customData.length; c++) {
                    var cd = entity.customData[c];
                    if (cd.name.indexOf('Rate')>-1) {
                        payRates += (c>0 ? ',' : '');
                        payRates += cd.name + ':' + cd.value;
                    }
                }
                
                entity.payRates = payRates;
                
                entity.entityDivId = entityType.replace(/ /g,'_') + '_' + entity.name.replace(/ /g,'_');
                entity.entTimerId = 'TC_StateDuration_' + entity.name.replace(/ /g,'_');
                entity.clockState = entity.punchState.replace(/Punched/g,'Clocked');
                entity.taskStart = '';
                entity.taskStartUTC = '';
                entity.taskDatetimeISO = '';
                entity.taskId = '';
                entity.taskIdent = '';
                for (var t=0; t<tasks.length; t++) {
                    var task = tasks[t];
                    //spu.consoleLog('>>>>>>>>>>>>>>>>>>>>>>>>>>'+task.id+ ' '+task.identifier+' '+task.startDate);
                    if (task.name == entity.name) {
                        // if (task.state == entity.punchState) {
                        entity.taskId = task.id;
                        entity.taskIdent =  task.identifier;
                        var startDT = task.startDate.toString(); // 2016-07-30T13:37:44.587Z
                        var startMS = startDT.substr(20,4).replace(/Z/g,'');
                            startMS = (startMS<100 ? (startMS<10 ? '00'+startMS : '0'+startMS) : startMS);
                            startDT = startDT.substr(0,19) + '.' + startMS + GMToffset;
                            
                        entity.taskStart = startDT; // 2016-07-30T13:37:44.587
                        
                        var dtISO = startDT;// + GMToffset;   // 2016-07-30T13:37:44.587-06:00
                        entity.taskDatetimeISO = dtISO;
                        var tsUTC = Date.parse(dtISO).toString();                   // 1469907464587
                            tsUTC = (tsUTC.length>10 ? tsUTC.substr(0,10) : tsUTC); // 1469907464
                        entity.taskStartUTC = tsUTC;
                        //}
                    }
                }
                
                if (entity.taskIdent == '') {
                    entity.punchState = 'Punched Out';
                    entity.punchStateClass = 'TC_Punched_Out';
                    entity.clockState = entity.punchState.replace(/Punched/g,'Clocked');
                    spu.consoleLog('NO PUNCH DATA FOUND.  Setting initial Entity Punch State: ' + entity.punchState);
                    updateEntityState('Employees',entity.name,'TC Punch Status','Punched Out');
                }

                var estuff = '';
                
                estuff += '<div id="' + entity.entityDivId + '"';
                estuff += ' class="TC_Entity"';
                estuff += ' entityType="' + entityType + '"';
                estuff += ' entityId="' + entity.id + '"';
                estuff += ' entityName="' + entity.name+ '"';
                estuff += ' payRates="' + entity.payRates + '"';
                estuff += ' punchState="' + entity.punchState + '"';
                estuff += ' taskId="'+entity.taskId+'"';
                estuff += ' taskIdent="'+entity.taskIdent+'"';
                estuff += ' taskStart="'+entity.taskStart+'"';
                estuff += ' taskStartUTC="'+entity.taskStartUTC+'"';
                estuff += ' taskDatetimeISO="'+entity.taskDatetimeISO+'"';
                estuff += ' isSelected="0"';
                estuff += '>';
                estuff += '<div class="TC_EntityName">';
                estuff += entity.name;
                estuff += '</div>';
                estuff += '<div class="' + entity.punchStateClass + '">';
                estuff += entity.clockState;
                estuff += '</div>';
                
                //if (entity.punchState == 'Punched In') {
                    estuff += '<div id="' + entity.entTimerId + '" class="TC_StateDuration" timeStart="'+entity.taskStart+'">00:00:00</div>';
                //}
                estuff += '</div>';

                $('#TC_Entities').append(estuff);

                TC_Entities.push(entity);

            }
            $('#TC_Entities').append('<div style="height:50px;"> </div>');
        }
        if (callback) {
            callback(TC_Entities);
        }
    });

    return TC_Entities;
}

function TC_updateTimerDisplay(timerId, startTime) {
    if (document.getElementById(timerId)) {
        var t = document.getElementById(timerId);
        var tstart = t.getAttribute('timeStart');
            tstart = startTime;
            
        var tnow = new Date();
            tnow = formatDateTime(tnow);

        var tdiff = datediff(tstart,tnow,'s');
        
        var h = tdiff/60/60;
            h = (h<1 ? 0 : h);
            h = parseInt(h);
        var m = ( tdiff - (h*60*60) ) / 60;
            m = (m<1 ? 0 : m);
            m = parseInt(m);
        var s = tdiff - (h*60*60) - (m*60);
            s = parseInt(s);
        
        t.innerHTML = (h<10 ? '0'+h : h)+':'+(m<10 ? '0'+m : m)+':'+(s<10 ? '0'+s : s);
    }
}
function TC_entityTimer(timerId, startTime, op, rate) {
    if (op=='start') {
        var intervalId = setInterval(function() {
            TC_updateTimerDisplay(timerId, startTime);
        }, rate);
        spu.consoleLog('Started Entity Timer ('+timerId+') with refresh rate: '+rate+' ms.');
        return intervalId;
    } else {
        clearTimers('TC_entityTimer');
    }
}

function TC_updateEmployeeTimers(employees, tasks, callback) {
    spu.consoleLog('Updating Timeclock Timers ('+employees.length+')');
    spu.consoleLog('Timeclock Entities: '+employees.length);
    spu.consoleLog('Timeclock Tasks: '+tasks.length);
    
    TC_entityTimer('','', 'stop');
    
    var GMToffset = getClientGMToffset();
    
    var employees = TC_Entities;
    var tasks = TC_Tasks;
    
    for (var e=0; e<employees.length; e++) {
        var entity = employees[e];

        spu.consoleLog('Iterating Timeclock Tasks ('+tasks.length+') looking for: '+entity.name);

        for (var t=0; t<tasks.length; t++) {

            var task = tasks[t];

            var startDT = task.startDate.toString(); // 2016-07-30T13:37:44.587Z
            var startMS = startDT.substr(20,4).replace(/Z/g,'');
                startMS = (startMS<100 ? (startMS<10 ? '00'+startMS : '0'+startMS) : startMS);
                startDT = startDT.substr(0,19) + '.' + startMS + GMToffset;
            var timeStart = startDT;

            var customData = task.customData;

            var taskEntityName = '';
            var taskId = 0;
            var taskIdent = '';

            for (var d=0; d<customData.length; d++) {
                //spu.consoleLog(entity.name + '... CD ['+customData[d].name+']'+customData[d].value);
                if (customData[d].name == 'entityName') {
                    taskEntityName = customData[d].value;
                }
            }

            if (taskEntityName == entity.name) {

                taskId = task.id;
                taskIdent = task.identifier;
                var startDT = task.startDate.toString(); // 2016-07-30T13:37:44.587Z
                var startMS = startDT.substr(20,4).replace(/Z/g,'');
                    startMS = (startMS<100 ? (startMS<10 ? '00'+startMS : '0'+startMS) : startMS);
                    startDT = startDT.substr(0,19) + '.' + startMS + GMToffset;
                var timeStart = startDT;

                spu.consoleLog('Found Timeclock Task for ('+taskEntityName+'): '+taskIdent+' (ID:'+taskId+')');

                spu.consoleLog(taskEntityName+' Punch Status: '+entity.punchState);

                if (document.getElementById(entity.entTimerId)) {
                    document.getElementById(entity.entTimerId).setAttribute('timeStart',timeStart);
                }
                if (entity.punchState == 'Punched In') {
                    spu.consoleLog('Starting Entity Timer for: '+taskEntityName);
                    TC_entityTimer(entity.entTimerId, timeStart, 'start', 1000);
                } else {
                    spu.consoleLog('No need to start Entity Timer for: '+taskEntityName);
                }
                break;
            }
            
        }
        
    }
    
    if (callback) {
        callback(employees, tasks);
    }
}

function TC_refreshTimeclockDisplay(entityType,search,callback) {
    spu.consoleLog("Refreshing Timeclock Display ...");
    $('#TC_Entities').html('<div class="info-message">Fetching Entities, please Wait...<br /><br />'+busyWheel+'</div>');
    TC_getTimeclockTasks(TC_PunchTaskType,'false','','','',''
        , function tcTasks() {
            TC_refreshEmployeeEntities(entityType, search, '', TC_Tasks
            , function empTimers() {
                TC_updateEmployeeTimers(TC_Entities,TC_Tasks
                , function et(){
                    $('#REP_Report').empty();
                    if (callback) {
                        callback();
                    }
                });
            });
        }
    );
}


function updateTaskMessage(msg) {
    $('#TSK_MSG').html(msg);
    jumpTop();
}

function loadTaskTypeList(callback) {
    if (document.getElementById('TSK_TaskTypePicker')) {
        TSK_TaskTypes = [];
        var ttypesstuff = '';
        getReportVars('PHP Task Types',function tt(data){
            taskTypes = data;
            
            getReportVars('PHP Task Type Custom Fields',function cf(cfdata){
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
    getReportVars('PHP Custom Reports',function rl(data){
        customReports = data;
        if (customReports.length>0) {
            for (var r=0; r<customReports.length; r++) {
                var rep = customReports[r];
                if (rep["DisplayInExplorer"]=='True') {
                    replist += '<div id="Reports_'+rep["name"].replace(/ /g,'_')+'" class="REP_Report" isSelected="0" hasParms="'+rep["hasParms"]+'">' + rep["name"] + (rep["hasParms"]==='1' ? ' <span style="color:#55FFBB;" title="Report contains parameters which may be required to produce output.">*</span>' : '') + '</div>';
                }
            }
            $('#REP_Reports').empty();
            $('#REP_Reports').append(replist);
            $('#REP_Reports').append('<div style="height:80px;"> </div>');
        } else {
            $('#REP_Reports').html('<div class="info-message">No Reports found.</div>');
        }
    });
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
            // using a pre-populated array (from PHP/SQL)
            // that contains report template information
            // about the column widths, for example:
            // [ReportName:5, 3,2, 1, 1]
            // if we want evenly-spaced columns, then 
            // comment outthe colWidth assignment
            // this loop is still required to display the column Headers
            // start the loop for report Header columns
            var columnHeaders = [];
            for (var col=0; col<report.tables[t].columns.length; col++) {
                var columnHeader = report.tables[t].columns[col].header;
                    columnHeader = (columnHeader===null ? '-' : columnHeader);
                    columnHeaders.push(columnHeader);
                if (PHP) {
                    var colWidth = reportColumnWidths[col] + '%';
                }
                repstuff += '<div id="columnHeader_'+col+'" class="REPORT_columnHeader" style="width:'+colWidth+';">' + columnHeader + '</div>';
            }

            repstuff += '</div>';

            // this loops through a pre-populated array (from PHP/SQL)
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
                    if (PHP) {
                        var colWidth = reportColumnWidths[cell] + '%';
                    }
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

function TE_changeTicketExplorerFilters(parm, callback) {

    $('#TE_DisplayTicket').hide();

    var filterParm = '#'+parm;
    var filterVal  = $(filterParm).val();

    if (filterParm == '#REP_PeriodPicker') {
        switch (filterVal) {
            case 'Today':
                $('#REP_DateStart').val(today);
                $('#REP_DateEnd').val(tomorrow);
                //$('#REP_PeriodPicker').val('ignore');
                break;
            case 'Yesterday':
                $('#REP_DateStart').val(yesterday);
                $('#REP_DateEnd').val(today);
                //$('#REP_PeriodPicker').val('ignore');
                break;
            case 'This Week':
                $('#REP_DateStart').val(weekStart);
                $('#REP_DateEnd').val(weekEnd);
                //$('#REP_PeriodPicker').val('ignore');
                break;
            case 'Past Week':
                $('#REP_DateStart').val(weekPastStart);
                $('#REP_DateEnd').val(weekPastEnd);
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
    }

    //if (startDate=='') {
        var startDate = $('#REP_DateStart').val();
    //}
    //if (endDate=='') {
        var endDate = $('#REP_DateEnd').val();
    //}
    //if (filterParm == '#TE_OpenClosed')
        var isClosed = $('#TE_OpenClosed').val();
    //}
    //if (filterParm == '#TE_Sort')
        var orderBy = $('#TE_Sort').val();
    //}

    $('#TE_Tickets').html('<div class="info-message">Fetching Tickets, please Wait...<br /><br />'+busyWheel+'</div>');
    TE_getTicketExplorerTickets(startDate,endDate,isClosed,orderBy,'' ,''  , function gt(tickets){
        TE_Tickets = tickets;
        TE_refreshTicketExplorerTicketList(TE_Tickets);
    });

}

function TE_getTicketExplorerTickets(startDate,endDate,isClosed,orderBy,take,skip, callback) {

    if (startDate=='') {
        startDate = $('#REP_DateStart').val();
    }
    if (endDate=='') {
        endDate = $('#REP_DateEnd').val();
    }
    if (isClosed=='') {
        isClosed = $('#TE_OpenClosed').val();
    }
    if (orderBy=='') {
        orderBy = $('#TE_Sort').val();
    }
    
    take = '';
    skip = '';
    
    gql.EXEC(gql.getTickets(startDate,endDate,isClosed,orderBy,take,skip), function(response) {
        if (response.errors) {
            gql.handleError("TE_getTicketExplorerTickets", response.errors);
            if (callback) {
                callback('ERROR');
            }
        } else {
            var tickets = response.data.tickets;
            spu.consoleLog('Got Tickets: '+tickets.length);
            if (callback) {
                callback(tickets);
            }
        }

    });
}

function TE_refreshTicketExplorerTicketList(tickets, callback) {

    $('#TE_Ticket').empty();
    $('#TE_Tickets').empty();
    
    for (var t=0; t<tickets.length; t++){
        var tStuff = '';

        var ticket = tickets[t];
        var tEntities = ticket.entities;
        var tStates = ticket.states;
        var tTags = ticket.tags;
        
        var timeOffset = getClientGMToffset().split(':');
        var offsetHours = Number(timeOffset[0]);
            offsetHours = offsetHours + Number(timeOffset[1])/60;
            //offsetHours = offsetHours * -1;
            offsetHours = 0;
        var elemDate = moment(ticket.date, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');
        
        //tStuff += '<div>'+ticket.uid+'</div>';
        tStuff += '<div style="color:Orange;font-weight:bold;">#'+ticket.number+' (ID:'+ticket.id+') ['+ticket.type+']</div>';
        tStuff += '<div>'+elemDate+'</div>';
        tStuff += '<div>TTL:<b>'+ticket.totalAmount.toFixed(2)+'</b> Rem:'+ticket.remainingAmount.toFixed(2)+'</div>';

        if (tEntities) {
            var entStuff = '';
            for (var te=0; te<tEntities.length; te++) {
                var entity = tEntities[te];
                entStuff += '<div class="TE_ticketEntity"><b>'+entity.type.substr(0,(entity.type.length-1))+'</b>: '+entity.name+'</div>';
            }
            tStuff += entStuff;
        }
        
        if (tStates) {
            var tsStuff = '';
            for (var ts=0; ts<tStates.length; ts++) {
                var tState = tStates[ts];
                tsStuff += '<div class="TE_ticketState"><b>'+tState.stateName+'</b>: '+tState.state+'</div>';
            }
            tStuff += tsStuff;
        }
        
        if (tTags) {
            var ttStuff = '';
            for (var tt=0; tt<tTags.length; tt++) {
                var tTag = tTags[tt];
                ttStuff += '<div class="TE_ticketTag"><b>'+tTag.tagName+'</b>: '+tTag.tag.replace(/\\r/g,'')+'</div>';
            }
            tStuff += ttStuff;
        }
                
        $('#TE_Tickets').append('<div id="Tickets_'+ticket.uid+'" class="TE_TicketPreview">'+tStuff+'</div>');

    } // tickets
    
    if (tickets.length==0) {
        $('#TE_Tickets').html('<div class="info-message" style="text-align:left;">No Tickets in specified Date Range that meet the Filter Criteria.<br /><br />Select a different Date Range and/or Filter Criteria.</div>');
    }
    
    if (callback) {
        callback(tickets);
    }
}
function TE_displayTicketExplorerTicket(ticketUid) {

    $('#TE_DisplayTicket').hide();

    $('#TE_Ticket').empty();
    
    ticketUid = ticketUid.replace(/Tickets_/g,'');
    
    for (var t=0; t<TE_Tickets.length; t++){
        if (ticketUid == TE_Tickets[t].uid) {
            var ticket = TE_Tickets[t];
            break;
        }
    }

    if (ticket) {
        var tEntities = ticket.entities;
        var tStates = ticket.states;
        var tTags = ticket.tags;

        var timeOffset = getClientGMToffset().split(':');
        var offsetHours = Number(timeOffset[0]);
            offsetHours = offsetHours + Number(timeOffset[1])/60;
            //offsetHours = offsetHours * -1;
            offsetHours = 0;
        var elemDate = moment(ticket.date, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');
            
        var tStuff = '';
        tStuff += '<div class="TE_TicketHeader">';
        tStuff += '<div style="color:Orange;font-weight:bold;">#'+ticket.number+' (ID:'+ticket.id+') ['+ticket.type+']</div>';
        tStuff += '<div>'+elemDate+'</div>';
        tStuff += '<div>TTL:<b>'+ticket.totalAmount.toFixed(2)+'</b> Rem:'+ticket.remainingAmount.toFixed(2)+'</div>';

        if (tEntities) {
            var entStuff = '';
            for (var te=0; te<tEntities.length; te++) {
                var entity = tEntities[te];
                entStuff += '<div class="TE_ticketEntity"><b>'+entity.type.substr(0,(entity.type.length-1))+'</b>: '+entity.name+'</div>';
            }
            tStuff += entStuff;
        }
        
        if (tStates) {
            var tsStuff = '';
            for (var ts=0; ts<tStates.length; ts++) {
                var tState = tStates[ts];
                tsStuff += '<div class="TE_ticketState"><b>'+tState.stateName+'</b>: '+tState.state+'</div>';
            }
            tStuff += tsStuff;
        }
        
        if (tTags) {
            var ttStuff = '';
            for (var tt=0; tt<tTags.length; tt++) {
                var tTag = tTags[tt];
                ttStuff += '<div class="TE_ticketTag"><b>'+tTag.tagName+'</b>: '+tTag.tag.replace(/\\r/g,'')+'</div>';
            }
            tStuff += ttStuff;
        }

        tStuff += '</div>'; // TE_TicketHeader
        
        var orders = ticket.orders;
        var oStuff = '';
        for (var o=0; o<orders.length; o++){
            var order = orders[o];
            var oStates = order.states;
            var oTags = order.tags;
            // id,uid,productId,calculatePrice,decreaseInventory,increaseInventory

            order.priceTotal = (order.price*order.quantity);
            
            for (var ot=0; ot<oTags.length; ot++){
                var oTag = oTags[ot];
                if (oTag.price!=0) {
                    order.priceTotal = order.priceTotal + (oTag.price*oTag.quantity);
                }
            } // orderTags

            for (var os=0; os<oStates.length; os++){
                var oState = oStates[os];
                if (oState.state=='Gift') {
                    order.priceTotal = 'FREE';
                    break;
                } else if (oState.state=='Void') {
                    order.priceTotal = 'VOID';
                    break;
                } else {
                    order.priceTotal = Number(order.priceTotal).toFixed(2);
                }
            } // orderStates

            oStuff += '<div class="TE_orderContainer">';
            oStuff += '<div class="TE_orderLine">';
            oStuff += '<div class="TE_orderQuantity">'+order.quantity+'</div>';
            oStuff += '<div class="TE_orderName">'+order.name+' <div class="TE_orderPortion"> ('+order.portion+')</div>'+'</div>';
            oStuff += '<div class="TE_orderPriceTag">'+(order.priceTag==null || order.priceTag=='' ? 'REG' : order.priceTag)+'</div> ';
            oStuff += '<div class="TE_orderPrice">'+order.price.toFixed(2)+'</div>';
            oStuff += '<div class="TE_orderLineTotal'+(isNumeric(order.priceTotal) ? '' : ' TE_'+order.priceTotal)+'">'+order.priceTotal+'</div>';

            oStuff += '</div>'; // TE_orderLine

            var oStateStuff = '<div class="TE_orderState">';
            for (var os=0; os<oStates.length; os++){
                var oState = oStates[os];
                //oStateStuff += '<div>'+oState.stateName+'</div>';
                oStateStuff += oState.state+(os<(oStates.length-1) ? ',' : '');
                //oStateStuff += '<div>'+oState.stateValue+'</div>';
                if (oState.state=='Gift') {
                    
                }
            } // orderStates
            oStateStuff += '</div>'; // TE_orderState
            oStuff += oStateStuff;

            var oTagStuff = '<div class="TE_orderTag">';
            for (var ot=0; ot<oTags.length; ot++){
                var oTag = oTags[ot];
                oTagStuff += (oTag.quantity==1?'&nbsp;&nbsp;':oTag.quantity+'x');
                //oTagStuff += '<div>'+oTag.tagName+'</div>';
                oTagStuff += '&nbsp;'+oTag.tag;
                oTagStuff += (oTag.price==0?'':' ... '+oTag.price.toFixed(2));
                oTagStuff += (oTag.price==0?'':' ... '+(oTag.price*oTag.quantity).toFixed(2));
                //oTagStuff += '<div>'+oTag.rate+'</div>';
                //oTagStuff += '<div>'+oTag.userId+'</div>';
                oTagStuff += '<br />';
            } // orderTags
            oTagStuff += '</div>'; // TE_orderTag
            oStuff += oTagStuff;

            oStuff += '</div>'; // TE_orderContainer
        } // orders

        $('#TE_Ticket').append('<div id="TicketExplorerTicket" class="TE_TicketCard" ticketId="'+ticket.id+'">'+tStuff+oStuff+'</div>');
        
        if (inSambaPOS) {
            $('#TE_DisplayTicket').show();
        }
        
    }
}
function TE_displayTicketExplorerTicketinSambaPOS() {
    if (inSambaPOS) {
        var name = 'HUB Display Ticket in SambaPOS';
        var value = $('#TicketExplorerTicket').attr('ticketId');
        spu.executeAutomationCommand(name,value);
    }
}


function POS_refreshPOSDisplay() {
//    $('#selectCustomers').html("Customer<br /><b style='color:#55FF55'>"+POS_Ticket.ticketCustomer+"</b>");
//    $('#selectTables').html("Table<br /><b style='color:#55FF55'>"+POS_Ticket.ticketTable+"</b>");

    POS_getEntitySelectors();
    POS_amcButtons('ticketCommands');
    POS_amcButtons('orderCommands');
    POS_amcButtons('ticketRow1');
    POS_amcButtons('ticketRow2');

    $('#entityGrids').empty();
    for (var e=0;e<POS_EntityTypes.length; e++) {
        var et  = POS_EntityTypes[e];
        var ets = et.substr(0,et.length-1);
        
        POS_fillEntityGrid(et);

        POS_Ticket[ets] = (typeof POS_Ticket[ets]==='undefined' ? '' : POS_Ticket[ets]);
        
        $('#select'+et).html(ets+'<br /><b style="color:#55FF55">'+(POS_Ticket[ets]!='' ? POS_Ticket[ets] : '&nbsp;')+'</b>');

    }

    $('#orders').empty();
    POS_updateTicketOrders();
    selectedOrderCount = 0;

    if (!POS_Menu.selectedCategoryDivId) {
        POS_getMenu(menuName, function m(menu){
            POS_Menu = menu;
            POS_getCategories(POS_Menu, function c(selectedCategoryDivId){
                $('#'+selectedCategoryDivId).click();
            });
        });
    } else {
        POS_getCategories(POS_Menu, function c(selectedCategoryDivId){
            document.getElementById(selectedCategoryDivId).click();
            $('#'+selectedCategoryDivId).click();
        });
    }
}