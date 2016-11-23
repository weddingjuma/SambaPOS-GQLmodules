////////////////////////////////
//
// nav_timeclock
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');
    
    if (customReports.length<1) {
        getReportVars('GQLM Custom Reports','', function rl(data){
            customReports = data;
            TC_refreshTimeclockDisplay(TC_EntityType,TC_EntitySearch);
        });
    } else {
        TC_refreshTimeclockDisplay(TC_EntityType,TC_EntitySearch);
    }
    setReportFilterDefaults();
}

$('#TC_Entities').on('click', '.TC_Entity', function(){
    var entityButton = this.id; // Employees_Jenery, Employees_Ovania, ...
    var entityName = entityButton.replace(/Employees_/g,'');
    spu.consoleLog('TC Entity Clicked:'+entityButton+' ('+entityName+')');
    
    var reportPeriod = document.getElementById('REP_PeriodPicker').value;
    var reportStart = document.getElementById('REP_DateStart').value;
        //reportStart = (reportStart!='' ? reportStart + ' 00:00:00' : '');
    var reportEnd = document.getElementById('REP_DateEnd').value;
        //reportEnd = (reportEnd!='' ? reportEnd + ' 23:59:59' : '');

    var parameters = '{name:"1",value:"Employees"}';
        parameters+=',{name:"2",value:"'+entityName+'"}';
        parameters+=',{name:"3",value:"'+reportStart+'"}';
        parameters+=',{name:"4",value:"'+reportEnd+'"}';

    if (reportPeriod!='' && reportPeriod!='ignore' && reportPeriod!='This Year' && reportPeriod!='Past Year') {
        reportStart = '';
        reportEnd = '';
    }

    
    for (var e=0; e<TC_selectedEntities.length; e++) {
        if (document.getElementById(TC_selectedEntities[e])) {
            document.getElementById(TC_selectedEntities[e]).setAttribute('isSelected','0');
            document.getElementById(TC_selectedEntities[e]).style.borderColor = '';
        }
    }
    
    TC_selectedEntities = [];
    
    if (document.getElementById(entityButton)) {
        var isSel = (document.getElementById(entityButton).getAttribute('isSelected') == '1' ? '0' : '1');
        document.getElementById(entityButton).setAttribute('isSelected',isSel);
        if (isSel == 1) {
            document.getElementById(entityButton).style.borderColor = '#FFBB00';
            TC_selectedEntities.push(entityButton);
            spu.consoleLog('Selected TC Entity: '+entityName);
            
            
            reportHeaders  = [];
            reportHeadersD = [];
            reportHeadersS = [];


            $('#REP_Report').html('<br /><br /><div class="info-message">... Generating Report ...<br /><br />'+busyWheel+'</div>');
                
            for (var e=0; e<customReports.length; e++) {
                if (customReports[e]["name"] == 'TC Employee Hours') {
                    parseReportHeaderRows(customReports[e]["template"]);
                    parseReportColumns(customReports[e]["cols"]);
                }
            }
                


                
            //getCustomReport(reportName,user,dateFilter,startDate,endDate,parameters);
            getCustomReport('TC Employee Hours',currentUser,reportPeriod,reportStart,reportEnd, parameters, function getRep(report) {
                displayReport(report);
            });
            
        } else {
            document.getElementById(entityButton).style.borderColor = '';
            spu.consoleLog('DE-Selected TC Entity: '+entityName);
            $('#TC_Report').empty();
        }
    }

});

$('#TC_EntityCommands').on('click', '.TC_EntityCommand', function(){
    var cmdButton = this.id; // Employees_Jenery, Employees_Ovania, ...
    var cmdName = cmdButton.replace(/TC_/g,'');
    spu.consoleLog('TC Command Clicked:'+cmdButton+' ('+cmdName+')');
    
    if (document.getElementById(cmdButton)) {
        var isSel = (document.getElementById(cmdButton).getAttribute('isSelected') == '1' ? '0' : '1');
        document.getElementById(cmdButton).setAttribute('isSelected',isSel);
        if (isSel == 1) {
            document.getElementById(cmdButton).style.borderColor = '#6666FF';
            spu.consoleLog('Selected TC Command: '+cmdButton);
        } else {
            document.getElementById(cmdButton).style.borderColor = '';
            spu.consoleLog('DE-Selected TC Command: '+cmdButton);
        }
    }

    if (TC_selectedEntities.length>0) {
        var selEnt = TC_selectedEntities[0];

        //$('#TC_Entities').html('<div class="info-message">Updating Entities, please Wait...<br /><br />'+busyWheel+'</div>');
        $('#TC_EntityCommands').hide();
        updateEmployeePunchState(selEnt,cmdButton, function refresh() {
            TC_refreshTimeclockDisplay(TC_EntityType,TC_EntitySearch, function sel() {
                document.getElementById(selEnt).click();
                document.getElementById(selEnt).style.borderColor = '#FFBB00';
                $('#TC_EntityCommands').show();
            });
        });
    }
    document.getElementById(cmdButton).style.borderColor = '';
});

function updateEmployeePunchState(entityButtonId,cmdButton,callback) {
    if (document.getElementById(entityButtonId)) {
        var entityId = document.getElementById(entityButtonId).getAttribute('entityId');
        var entityName = entityButtonId.replace(/Employees_/g,'');
        var payRates = document.getElementById(entityButtonId).getAttribute('payRates');
        var punchStateCurrent = document.getElementById(entityButtonId).getAttribute('punchState');
        var taskId = document.getElementById(entityButtonId).getAttribute('taskId');
        var taskIdent = document.getElementById(entityButtonId).getAttribute('taskIdent');
        var taskStartUTC = document.getElementById(entityButtonId).getAttribute('taskStartUTC');
        var taskDatetimeISO = document.getElementById(entityButtonId).getAttribute('taskDatetimeISO');
        spu.consoleLog(entityButtonId+' punchState: '+punchStateCurrent);

        var punchTaskTypes = [];
            punchTaskTypes.push(TC_PunchTaskType);
        var punchControlTaskTypes = [];
            punchControlTaskTypes.push(TC_PunchControlTaskType);
        var taskIdents = [];
            taskIdents.push(taskIdent);
        var entityNames = [];
            entityNames.push(entityName);
        
        var punchStateNew = (punchStateCurrent == 'Punched Out' ? 'Punched In' : 'Punched Out');
        
        var addControlTask = (punchStateNew == 'Punched In' ? true : false);
        var completeControlTask = (punchStateNew == 'Punched Out' ? true : false);
        
        var GMToffset = getClientGMToffset();
        var dtNow = new Date();                        // DateObject: 2016-07-28T18:17:36.094Z
        var utcMilliSeconds = getDateTime(dtNow,'ms'); // 1469729856094
        var utcSeconds = getDateTime(dtNow,'s');       // 1469729856     // UNIX Timestamp (UTC) // seconds since EPOCH 1970-01-01 00:00:00 (midnight UTC/GMT)
        var utcMinutes = getDateTime(dtNow,'m');       // 24495498
        var dtISO = formatDateTime(dtNow,true,true);   // 2016-07-28T12:17:36.094
        var dtISOgmt = dtISO + GMToffset;              // 2016-07-28T12:17:36.094-06:00
        var dtISOutc = dtISO + 'Z';                    // 2016-07-28T12:17:36.094Z
        
        var myDate = Date.parse(dtISOgmt);
        var myEpoch = myDate/1000.0;

        var punchDataFOUND = (taskIdent == "" ? false : true);
        
        if (!punchDataFOUND) {
            spu.consoleLog('NO PUNCH DATA FOUND.  Setting Task Start timeStamp to NOW.');
            punchStateCurrent = 'Punched Out';
            punchStateNew = 'Punched In';
            taskStartUTC = utcSeconds;
            taskDatetimeISO = dtISOgmt;
        }
        spu.consoleLog('Task Start: taskStartUTC('+taskStartUTC+') taskDatetimeISO('+taskDatetimeISO+')');

        var taskDuration = utcSeconds - taskStartUTC;
        
        var TT_timestampPunchCreated = taskStartUTC;
        var TT_timestampPunchUpdated = utcSeconds;
        var TT_datetimePunchCreated = taskDatetimeISO;
        var TT_datetimePunchUpdated = dtISOgmt;
        
        var TT_timestampPunchControlCreated = taskStartUTC;
        var TT_timestampPunchControlUpdated = utcSeconds;
        var TT_datestamp = taskDatetimeISO.toString().substr(0,10);
        
        var ident = utcMilliSeconds + '-' + entityName + '-' + entityId;             // 1469729856094-Jenery-44
        
        if (!punchDataFOUND) {
            taskIdent = ident;
        }
        
        var punchContent = punchStateNew + ': '+entityName + ' ('+dtISOgmt+')';      // Punched In: Jenery (2016-07-28T12:17:36.094-06:00)
        var punchControlContent = 'Punch Cycle: '+ident;                             // Punch Cycle: 1469729856094-Jenery-44
        
        var customDataPunch = [];
            customDataPunch.push({name:"entityType",value:"Employees"});
            customDataPunch.push({name:"entityId",value:entityId});
            customDataPunch.push({name:"entityName",value:entityName});
            customDataPunch.push({name:"payRates",value:payRates});
            customDataPunch.push({name:"stateName",value:"TC Punch Status"});
            customDataPunch.push({name:"state",value:punchStateNew});
            customDataPunch.push({name:"startState",value:punchStateCurrent});
            customDataPunch.push({name:"endState",value:punchStateNew});
            // TimeTrex Data
            customDataPunch.push({name:"TT_type_id",value:punchStateNew});              // punch type (Punched In or Punched Out)
/*
            customDataPunch.push({name:"TT_deleted_date",value:0});         // UTC seconds placeholder for future use
            customDataPunch.push({name:"TT_created_by",value:currentUser}); // placeholder for future use
            customDataPunch.push({name:"TT_updated_by",value:currentUser}); // placeholder for future use
            customDataPunch.push({name:"TT_deleted_by",value:0});           // placeholder for future use
            customDataPunch.push({name:"TT_station_id",value:0});           // placeholder for future use
            customDataPunch.push({name:"TT_transfer",value:0});             // placeholder for future use
            customDataPunch.push({name:"TT_longitude",value:0});            // placeholder for future use
            customDataPunch.push({name:"TT_latitude",value:0});             // placeholder for future use
*/


        var customDataPunchControl = [];
            customDataPunchControl.push({name:"Id",value:ident});                      // Id = Identifier = link between Punch data and PunchControl data
            // TimeTrex Data
            customDataPunchControl.push({name:"TT_punch_control_id",value:ident});     // punch_control_id (we use the Task Identifier)
            customDataPunchControl.push({name:"TT_user_id",value:entityId});              // user_id (we use the Employee Entity Id)
            customDataPunchControl.push({name:"TT_user_name",value:entityName});              // user_id (we use the Employee Entity Name)
            customDataPunchControl.push({name:"TT_date_stamp",value:TT_datestamp});              // the date ONLY, no time // 2016-07-28
            customDataPunchControl.push({name:"TT_total_time",value:taskDuration});           // difference of (updated_date - created_date) = seconds rounded to minute  // (12999)     rounded      13020
            customDataPunchControl.push({name:"TT_actual_total_time",value:taskDuration});    // difference of (updated_date - created_date) = seconds non-rounded        // 12999      (rounded      13020)
            customDataPunchControl.push({name:"TT_created_date",value:TT_timestampPunchControlCreated});         // UTC seconds Punch IN date  // 1469729856 (rounded 1469729880)
            customDataPunchControl.push({name:"TT_updated_date",value:TT_timestampPunchControlUpdated});         // UTC seconds Punch OUT date // 1469742855 (rounded 1469742840)
/*
            customDataPunchControl.push({name:"TT_deleted_date",value:0});         // UTC seconds placeholder for future use
            customDataPunchControl.push({name:"TT_pay_period_id",value:0});        // placeholder for future use
            customDataPunchControl.push({name:"TT_created_by",value:currentUser}); // placeholder for future use
            customDataPunchControl.push({name:"TT_updated_by",value:currentUser}); // placeholder for future use
            customDataPunchControl.push({name:"TT_deleted_by",value:""});          // placeholder for future use
            customDataPunchControl.push({name:"TT_deleted",value:0});              // placeholder for future use
            customDataPunchControl.push({name:"TT_branch_id",value:0});            // placeholder for future use
            customDataPunchControl.push({name:"TT_department_id",value:0});        // placeholder for future use
            customDataPunchControl.push({name:"TT_job_id",value:0});               // placeholder for future use
            customDataPunchControl.push({name:"TT_job_item_id",value:0});          // placeholder for future use
            customDataPunchControl.push({name:"TT_quantity",value:0});             // placeholder for future use
            customDataPunchControl.push({name:"TT_bad_quantity",value:0});         // placeholder for future use
*/



        if (punchStateCurrent != cmdButton.replace(/TC_Clock_/g,'Punched ')) {

            if (punchDataFOUND) {
                
                spu.consoleLog('Completing Punch Task ('+TC_PunchTaskType+') ['+punchStateCurrent+']: ' + taskIdents);
                // when we UPDATE a Punch Task, we use Original Dates
                if (punchStateCurrent=='Punched Out') {
                    customDataPunch.push({name:"Id",value:taskIdent});                      // Id = Identifier = link between Punch data and PunchControl data
                    // TimeTrex Data
                    customDataPunch.push({name:"TT_punch_control_id",value:taskIdent});     // punch_control_id (we use the Task Identifier)
                } else {
                    customDataPunch.push({name:"Id",value:ident});                      // Id = Identifier = link between Punch data and PunchControl data
                    // TimeTrex Data
                    customDataPunch.push({name:"TT_punch_control_id",value:ident});     // punch_control_id (we use the Task Identifier)
                }
                customDataPunch.push({name:"TT_original_time_stamp",value:TT_datetimePunchCreated});  // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                customDataPunch.push({name:"TT_time_stamp",value:TT_datetimePunchCreated});           // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                customDataPunch.push({name:"TT_actual_time_stamp",value:TT_datetimePunchCreated});    // date/time non-rounded including seconds with Timezone               // 2016-07-28T12:17:36-06:00
                customDataPunch.push({name:"TT_created_date",value:TT_timestampPunchCreated});         // UTC seconds Punch IN/OUT date                                       // 1469729856
                customDataPunch.push({name:"TT_updated_date",value:TT_timestampPunchCreated});         // UTC seconds Punch IN/OUT date (same as created_date unless modified // 1469729856
                updateTasksByIdentifier(punchTaskTypes, taskIdents, true, punchStateCurrent+' Complete', customDataPunch, '', true, function completeP() {
                    // remove TT Date data from Array
                    for (var p=0; p<5; p++) {
                        customDataPunch.pop();
                    }
                    // remove identifiers from Array
                    for (var p=0; p<2; p++) {
                        customDataPunch.pop();
                    }


                    // Complete Control Task only if Punching OUT (completeControlTask==true)
                    if (completeControlTask) {
                        spu.consoleLog('Completing Punch Control Task ('+TC_PunchControlTaskType+') ['+punchStateCurrent+']: ' + taskIdents);
                    } else {
                        spu.consoleLog('Skipping Punch Control Task completion ('+TC_PunchControlTaskType+') ['+punchStateCurrent+']: ' + taskIdents);
                    }
                    updateTasksByIdentifier(punchControlTaskTypes, taskIdents, true, 'Punch Cycle Complete', customDataPunchControl, punchControlContent+' ['+taskStartUTC+'~'+utcSeconds+']', completeControlTask, function completeC() {


                        spu.consoleLog('Creating Punch Task ('+TC_PunchTaskType+') ['+punchStateNew+']: ' + ident);
                        // when we CREATE a Punch Task, we use NOW Dates
                        customDataPunch.push({name:"Id",value:ident});                      // Id = Identifier = link between Punch data and PunchControl data
                        // TimeTrex Data
                        customDataPunch.push({name:"TT_punch_control_id",value:ident});     // punch_control_id (we use the Task Identifier)

                        customDataPunch.push({name:"TT_original_time_stamp",value:TT_datetimePunchUpdated});  // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                        customDataPunch.push({name:"TT_time_stamp",value:TT_datetimePunchUpdated});           // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                        customDataPunch.push({name:"TT_actual_time_stamp",value:TT_datetimePunchUpdated});    // date/time non-rounded including seconds with Timezone               // 2016-07-28T12:17:36-06:00
                        customDataPunch.push({name:"TT_created_date",value:TT_timestampPunchUpdated});         // UTC seconds Punch IN/OUT date                                       // 1469729856
                        customDataPunch.push({name:"TT_updated_date",value:TT_timestampPunchUpdated});         // UTC seconds Punch IN/OUT date (same as created_date unless modified // 1469729856
                        addTasks(punchTaskTypes, entityNames, punchContent, false, currentUser, customDataPunch, punchStateNew, true, function addP() {
                            // remove TT Date data from Array
                            for (var p=0; p<5; p++) {
                                customDataPunch.pop();
                            }


                            // Add Control Task only if Punching IN (addControlTask==true)
                            if (addControlTask) {
                                spu.consoleLog('Creating Punch Control Task ('+TC_PunchControlTaskType+') ['+punchStateNew+']: ' + ident);
                            } else {
                                spu.consoleLog('Skipping Punch Control Task creation ('+TC_PunchControlTaskType+') ['+punchStateNew+']: ' + ident);
                            }
                            addTasks(punchControlTaskTypes, entityNames, punchControlContent, false, currentUser, customDataPunchControl, 'Punch Cycle', addControlTask, function addC() {

                                spu.consoleLog('Updating Entity Punch State: ' + punchStateCurrent + ' > ' + punchStateNew);
                                TC_updateEntityState('Employees',entityName,'TC Punch Status',punchStateNew,function es(){
                                    var msg = '{"eventName":"TIMECLOCK_REFRESH","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
                                    broadcastMessage(msg);
                                    if (callback) {
                                        callback();
                                    }
                                });
                           });
                        });
                        
                    });
                });

            } else {

                // if we have no Punch data, we skip Task Completion.  This should only ever occur ONCE per Entity, then they will have Punch Data.
                
                spu.consoleLog('NO PUNCH DATA FOUND.  Creating initial Punch Tasks...');

                punchStateCurrent = 'Punched Out';
                punchStateNew = 'Punched In';
                addControlTask = true;

                        spu.consoleLog('Creating Punch Task ('+TC_PunchTaskType+') ['+punchStateNew+']: ' + ident);
                        // when we CREATE a Punch Task, we use NOW Dates
                        if (punchStateCurrent=='Punched Out') {
                            customDataPunch.push({name:"Id",value:taskIdent});                      // Id = Identifier = link between Punch data and PunchControl data
                            // TimeTrex Data
                            customDataPunch.push({name:"TT_punch_control_id",value:taskIdent});     // punch_control_id (we use the Task Identifier)
                        } else {
                            customDataPunch.push({name:"Id",value:ident});                      // Id = Identifier = link between Punch data and PunchControl data
                            // TimeTrex Data
                            customDataPunch.push({name:"TT_punch_control_id",value:ident});     // punch_control_id (we use the Task Identifier)
                        }
                        customDataPunch.push({name:"TT_original_time_stamp",value:TT_datetimePunchUpdated});  // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                        customDataPunch.push({name:"TT_time_stamp",value:TT_datetimePunchUpdated});           // date/time rounded to minute with Timezone                           // 2016-07-28T12:18:00-06:00
                        customDataPunch.push({name:"TT_actual_time_stamp",value:TT_datetimePunchUpdated});    // date/time non-rounded including seconds with Timezone               // 2016-07-28T12:17:36-06:00
                        customDataPunch.push({name:"TT_created_date",value:TT_timestampPunchUpdated});         // UTC seconds Punch IN/OUT date                                       // 1469729856
                        customDataPunch.push({name:"TT_updated_date",value:TT_timestampPunchUpdated});         // UTC seconds Punch IN/OUT date (same as created_date unless modified // 1469729856
                        addTasks(punchTaskTypes, entityNames, punchContent, false, currentUser, customDataPunch, punchStateNew, true, function addP() {

                            if (addControlTask) {
                                spu.consoleLog('Creating Punch Control Task ('+TC_PunchControlTaskType+') ['+punchStateNew+']: ' + ident);
                            } else {
                                spu.consoleLog('Skipping Punch Control Task creation ('+TC_PunchControlTaskType+') ['+punchStateNew+']: ' + ident);
                            }
                            addTasks(punchControlTaskTypes, entityNames, punchControlContent, false, currentUser, customDataPunchControl, 'Punch Cycle', addControlTask, function addC() {

                                spu.consoleLog('Updating Entity Punch State: ' + punchStateCurrent + ' > ' + punchStateNew);
                                TC_updateEntityState('Employees',entityName,'TC Punch Status',punchStateNew,function es(){
                                    var msg = '{"eventName":"TIMECLOCK_REFRESH","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
                                    broadcastMessage(msg);
                                    if (callback) {
                                        callback();
                                    }
                                });

                                
                           });
                        });

            }
            
        } else {
            spu.consoleLog('Punch State has not changed ('+entityName+'):' + punchStateCurrent);
            $('#TC_EntityCommands').show();
//            if (callback) {
//                callback();
//            }
        }
        
    }
//    if (callback) {
//        callback(entityButtonId);
//    }
}



function TC_refreshEmployeeEntities(entityType, search, stateFilter, tasks, callback){
    var fn = spu.fi(arguments);
    // singular name of entityType
    var eType = entityType.substr(0,entityType.length-1);
    
    var GMToffset = getClientGMToffset();
    
    gql.EXEC(gql.getEntities(entityType, search, stateFilter), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getEntities", response);
        } else {
            spu.consoleLog('TC_refreshEmployeeEntities:'+entityType+' ('+response.data.entities.length+')');
            
            var entities = response.data.entities;

//            $('#TC_Entities').empty();

            jsonData = entities;
            jsonData = sortJSON(jsonData,"name",true);
            
            TC_Entities = [];

            var estuff = '';
            
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

                        var timeStart = task.startDate.toString();
                        var timeStartUTC = Date.parse(timeStart).toString();
                            timeStartUTC = (timeStartUTC.length>10 ? timeStartUTC.substr(0,10) : timeStartUTC);

                        var startDT = task.startDate.toString(); // 2016-07-30T13:37:44.587Z
                        var startMS = startDT.substr(20,4).replace(/Z/g,'');
                            startMS = (startMS<100 ? (startMS<10 ? '00'+startMS : '0'+startMS) : startMS);
                            startDT = startDT.substr(0,19) + '.' + startMS + GMToffset;
                            
                        entity.taskStart = timeStart;//startDT; // 2016-07-30T13:37:44.587
                        
                        var dtISO = startDT;// + GMToffset;   // 2016-07-30T13:37:44.587-06:00
                        entity.taskDatetimeISO = timeStart;//dtISO;
                        var tsUTC = Date.parse(dtISO).toString();                   // 1469907464587
                            tsUTC = (tsUTC.length>10 ? tsUTC.substr(0,10) : tsUTC); // 1469907464
                        entity.taskStartUTC = timeStartUTC;//tsUTC;
                        //}
                    }
                }
                
                if (entity.taskIdent == '') {
                    entity.punchState = 'Punched Out';
                    entity.punchStateClass = 'TC_Punched_Out';
                    entity.clockState = entity.punchState.replace(/Punched/g,'Clocked');
                    spu.consoleLog('NO PUNCH DATA FOUND.  Setting initial Entity Punch State: ' + entity.punchState);
                    TC_updateEntityState('Employees',entity.name,'TC Punch Status','Punched Out');
                }

                
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
                    estuff += '<div id="' + entity.entTimerId + '" class="TC_StateDuration" timeStartUTC="'+entity.taskStartUTC+'" timeStart="'+entity.taskStart+'">00:00:00</div>';
                //}
                estuff += '</div>';

                

                TC_Entities.push(entity);

            }
            
            estuff += '<div style="height:50px;"> </div>';
            
            $('#TC_Entities').html(estuff);
            
        }
        if (callback) {
            callback(TC_Entities);
        }
    });

//    return TC_Entities;
}

function TC_updateTimerDisplay(timerId, startTime) {
    if (document.getElementById(timerId)) {
        var t = document.getElementById(timerId);
        var tstart = t.getAttribute('timeStart');
        var tstartUTC = t.getAttribute('timeStartUTC');
            
        var tnUTC = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            tnUTC = Date.parse(tnUTC).toString();                   // 1469907464587
            tnUTC = (tnUTC.length>10 ? tnUTC.substr(0,10) : tnUTC); // 1469907464
            tnUTC = Number(tnUTC);
        
        var tdiff = 0;//datediff(tstart,tnow,'s');
            tdiff = tnUTC - tstartUTC;
        
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

            var timeStart = task.startDate.toString();
            var timeStartUTC = Date.parse(timeStart).toString();
                timeStartUTC = (timeStartUTC.length>10 ? timeStartUTC.substr(0,10) : timeStartUTC);

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
                
                timeStart = task.startDate.toString();
                timeStartUTC = Date.parse(timeStart).toString();                   // 1469907464587
                timeStartUTC = (timeStartUTC.length>10 ? timeStartUTC.substr(0,10) : timeStartUTC); // 1469907464

                spu.consoleLog('Found Timeclock Task for ('+taskEntityName+'): '+taskIdent+' (ID:'+taskId+')');

                spu.consoleLog(taskEntityName+' Punch Status: '+entity.punchState);

                if (document.getElementById(entity.entTimerId)) {
                    document.getElementById(entity.entTimerId).setAttribute('timeStart',timeStart);
                    document.getElementById(entity.entTimerId).setAttribute('timeStartUTC',timeStartUTC);
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


function TC_getTimeclockTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state, callback) {
    var fn = spu.fi(arguments);
    var timeOffset = getClientGMToffset().split(':');
    var offsetHours = Number(timeOffset[0]);
        offsetHours = offsetHours + Number(timeOffset[1])/60;

    gql.EXEC(gql.getTasks(taskType,completedFilter,nameLike,contentLike,fieldFilter, state), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getTasks", response);
            callback('ERROR');
        } else {
            TC_Tasks = [];
            var tasks = response.data.tasks;
            spu.consoleLog('Got Timeclock Tasks: '+tasks.length);
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
            TC_Tasks = tasks;
        }
        if (callback) {
            callback(TC_Tasks);
        }
    });
    return TC_Tasks;
}

function TC_updateEntityState(entityType,entityName,stateName,state,callback) {
    var fn = spu.fi(arguments);
    gql.EXEC(gql.updateEntityState(entityType,entityName,stateName,state), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.updateEntityState", response);
        } else {
            var ent = response.data.updateEntityState;
        }
        if (callback){
            callback(ent);
        }
    });
}
