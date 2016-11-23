////////////////////////////////
//
// nav_chat
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

    getChatMessages();
    document.getElementById('CHAT_Input').focus();
}


function getChatMessages(callback) {
    var timeOffset = getClientGMToffset().split(':');
    var offsetHours = Number(timeOffset[0]);
        offsetHours = offsetHours + Number(timeOffset[1])/60;
    // getTasks(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback)
    getTasks('CHAT Message Task', nowDateLessDay, monthEnd, false, '', '', '', '', function gt(tasks){
        var chatMessages = '';
        for (var t=0; t<tasks.length; t++) {
            // GQL getTasks returns start/end dates with the client TZ-offset already applied, 
            // not the actual dates as found in the DB, so we need to backout the offset
            var beg = tasks[t].startDate.replace(/Z/g,'');
            var end = tasks[t].endDate.replace(/Z/g,'');

            beg = moment(beg, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
            end = moment(end, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

            tasks[t].startDate = beg;
            tasks[t].endDate =  end;
                
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
