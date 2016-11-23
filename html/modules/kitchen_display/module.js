////////////////////////////////
//
// nav_kitchen_display
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');
    
    KD_refreshTaskList();
}

$('#KD_Food').on('click', '.KD_TaskCard_Food', function(){
    var selectedCardList = '';
    var cardNumber = this.id; // KD_Task_1, KD_Task_2, ...
    cardNumber = cardNumber.replace(/KD_Task_/,'');
    if (isNumeric(cardNumber) && document.getElementById('KD_Task_'+cardNumber)) {
        var cardElem = document.getElementById('KD_Task_'+cardNumber);

        var taskSelected = cardElem.getAttribute('isSelected');
        if (taskSelected=='1') {
            cardElem.style.backgroundColor = '#111133';
            cardElem.setAttribute('isSelected','0');
        } else if (taskSelected=='0') {
            cardElem.style.backgroundColor = '#223322';
            cardElem.setAttribute('isSelected','1');
        }
        selectedTasks = [];
        selectedTaskIDs = [];
        selectedTaskIdents = [];
        for (var t=1; t<=taskCount; t++) {
            if (document.getElementById('KD_Task_'+t)) {
                var s = document.getElementById('KD_Task_'+t).getAttribute('isSelected');
                if (s=='1') {
                    var taskID = document.getElementById('KD_Task_'+t).getAttribute('taskID');
                    var taskIdent = document.getElementById('KD_Task_'+t).getAttribute('ident');
                    selectedTasks.push(t);
                    selectedTaskIDs.push(taskID);
                    selectedTaskIdents.push(taskIdent);
                    selectedCardList += t+':'+taskID+',';
                }
            }
        }
        spu.consoleLog('Selected Task Cards: '+selectedCardList.substr(0,selectedCardList.length-1));
    }
});

$('#BB_Buttons').on('click', '.BB_Button', function(){
    var bbButtonNumber = this.id; // BB_1, BB_2, ...
    spu.consoleLog('BB Button click ID: '+bbButtonNumber);
    bbButtonNumber = bbButtonNumber.replace(/BB_/,'');
    if (isNumeric(bbButtonNumber) && document.getElementById('KD_Task_'+bbButtonNumber)) {
        spu.consoleLog('BB Button click NUM: '+bbButtonNumber);
        var taskID = document.getElementById('KD_Task_'+bbButtonNumber).getAttribute('taskID');
        var taskIdent = document.getElementById('KD_Task_'+bbButtonNumber).getAttribute('ident');
        selectedTaskIDs = [];
        selectedTaskIDs.push(taskID);
        selectedTaskIdents = [];
        selectedTaskIdents.push(taskIdent);
        KD_completeTasks(selectedTaskIDs,selectedTaskIdents,true,function cKDtsk(){
            KD_refreshTaskList();
        });
    } else {
        if (bbButtonNumber=='Refresh') {
            KD_refreshTaskList();
        }
        if (bbButtonNumber=='SelectAll') {
            var belem = document.getElementById('BB_'+bbButtonNumber);
            var selectToggle = belem.getAttribute('isSelected');
            selectToggle = (selectToggle=='1' ? '0' : '1');
            belem.setAttribute('isSelected', selectToggle);

            spu.consoleLog((selectToggle=='0' ? 'De-' : '')+'Selecting ALL KD Tasks...');
            selectedTasks = [];
            selectedTaskIDs = [];
            selectedTaskIdents = [];
            for (var t=1; t<=taskCount; t++) {
                var telem = document.getElementById('KD_Task_'+t);
                telem.setAttribute('isSelected',selectToggle);
                var taskID = telem.getAttribute('taskID');
                var taskIdent = telem.getAttribute('ident');
                var bgColor = (selectToggle=='1' ? '#223322' : '#111133');
                telem.style.backgroundColor = bgColor;
                if (selectToggle=='1') {
                    selectedTasks.push(t);
                    selectedTaskIDs.push(taskID);
                    selectedTaskIdents.push(taskIdent);
                }
            }
        }
        if (bbButtonNumber=='MarkCompleted') {
            if (selectedTaskIDs.length > 0) {
                KD_completeTasks(selectedTaskIDs,selectedTaskIdents,true,function cKDtsk(){
                    KD_refreshTaskList();
                });
            } else {
                spu.consoleLog('No Tasks Selected!');
            }
        }
    }
});



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
    var fn = spu.fi(arguments);
    $('#KD_Food').html('<div class="info-message">Fetching Tasks, please Wait...<br /><br />'+busyWheel+'</div>');

    gql.EXEC(gql.getTasks(KD_HTMLtaskType,'false'), function(response) {
        if (response.errors) {
            gql.handleError(fn+" gql.getTasks", response);
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
