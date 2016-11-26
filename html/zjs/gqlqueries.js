////////////////////////////////
//
// gqlqueries
//
////////////////////////////////

// define Object for all GraphQL stuff
var gql = { };

//----------------------------------------------------------------------------
// main AJAX function to Post GQL Queries/Mutations and Receive data
//----------------------------------------------------------------------------
gql.EXEC = function (query, callback) {
    spu.consoleLog('EXEC GQL:' +query);
    var data = JSON.stringify({ query: query });
    countTrafficBytes(data,'gql','sent');
    return jQuery.ajax({
    'type': 'POST',
    'url': GQLurl,
    headers: {'Authorization':'Bearer '+accessToken},
    'contentType': 'application/json',
    'data': data,
    'dataType': 'json',
//    'success': callback,

    'error': function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                spu.consoleLog('!!! AJAX ERROR !!! ['+jqXHR.status+'] Could not connect. Verify Network.');
            } else if (jqXHR.status == 404) {
                spu.consoleLog('!!! AJAX ERROR !!! ['+jqXHR.status+'] Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                spu.consoleLog('!!! AJAX ERROR !!! ['+jqXHR.status+'] Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                alert('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                alert('Time out error.');
            } else if (exception === 'abort') {
                alert('Ajax request aborted.');
            } else if (jqXHR.status == 400) {
                spu.consoleLog('!!! BAD REQUEST !!! ['+jqXHR.status+'] Bad Request [400].' + jqXHR.responseText);
                showErrorMessage('!!! BAD REQUEST !!! ['+jqXHR.status+'] Bad Request [400].' + "\r\n\r\n" + jqXHR.responseText);
            } else {
                spu.consoleLog('Uncaught Error: ['+jqXHR.status+']' + jqXHR.responseText);
                showErrorMessage('Uncaught Error: ['+jqXHR.status+']' + "\r\n\r\n" + jqXHR.responseText);
            }
            //callback(jqXHR.responseText);
            jqXHR.responseJSON.GQLquery = data;
            callback(jqXHR.responseJSON);
        }
    })
            .done(callback
            ).then(
                function(response){
                    var payload = JSON.stringify(response.data);
                    countTrafficBytes(payload,'gql','rcvd');
                }
            );
};


gql.handleError = function(caller,errorData, callback) {
    var errorMessage = errorData.errors[0].Message +' '+ errorData.errors[0].InnerException.Message;
    spu.consoleLog("!!! GQL ERROR: ["+caller+'] '+ errorMessage + ' !!! ' + JSON.stringify(errorData));
//    if (msg.indexOf('No ticket open on terminal')>-1) {
//        $('#errorMessage').hide();
//    } else {
        var qry = errorData.GQLquery;
        var e = caller+'<br /><br /><b>'+errorMessage+'</b><br /><br />'+qry;
        showErrorMessage(e);
        if (callback) {
            callback(e);
        }
//    }
};

//----------------------------------------------------------------------------
// GQL Authorization added in SambaPOS v5.1.61
//----------------------------------------------------------------------------
gql.Authorize = function (user, password, callback) {
    var aurl = 'http://' + GQLhost + ':' + GQLport + '/Token';
    user = (user ? user : 'samba');
    password = (password ? password : 'password');
    
    spu.consoleLog('AUTHORIZING GQL ...');
    spu.consoleLog('URL: '+aurl);
    spu.consoleLog('PW: '+password);
    
    var ver = SambaPOS.split('.');
    var maj = Number(ver[0]);
    var min = Number(ver[1]);
    var rev = Number(ver[2]);
    
    if (maj>=5 && min>=1 && rev>=61) {
        
        jQuery.ajax({
        'type': 'POST',
        'url': aurl,
        cache:false,
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        data: $.param({grant_type:'password', username:user, password:password})
        })
        .done(function d(response){
            accessToken = response.access_token;
            spu.consoleLog('AUTHORIZED GQL: ' + accessToken.substr(0,20) + ' ...');
            if (callback) {
                callback(accessToken);
            }
        });
        
    } else {
        
        spu.consoleLog('GQL AUTH requires v5.1.61+ ... bypassed!');
        if (callback) {
            callback(accessToken);
        }
        
    }
};


//----------------------------------------------------------------------------
// define functions for all Queries and Mutations
//----------------------------------------------------------------------------

gql.getLocalSetting = function(settingName) {
    return '{setting: getLocalSetting(name:"'+settingName+'"){name,value}}';
};
gql.getGlobalSetting = function(settingName) {
    return '{setting: getGlobalSetting(name:"'+settingName+'"){name,value}}';
};
gql.postBroadcastMessage = function(msg, callback) {
    // JSON TEST
    //msg = '{"orders":[{"orderID":"124","orderTime":"12:54"},{"orderID":"125","orderTime":"12:55"}]}';
    msg = msg.replace(/"/g,'\\"');
    return 'mutation m {postBroadcastMessage(message:"'+msg+'"){message}}';
};
gql.getCustomReport = function(reportName,user,dateFilter,startDate,endDate,parameters) {
    var q = '{report: getCustomReport(';
        q+= 'name:"'+reportName+'"';
        q+= (user ?  ',user:"'+user+'"' : '');
        q+= (dateFilter ? ',date:"'+dateFilter+'"' : '');
        q+= (startDate ? ',startDate:"'+startDate+'"' : '');
        q+= (endDate ? ',endDate:"'+endDate+'"' : '');
        q+= (parameters ? ',parameters:['+parameters+']' : '');
        q+= ')';
        q+= '{name,header,startDate,endDate,tables{name,maxHeight,columns{header},rows{cells}}}';
        q+= '}';
    return q;
};
gql.getTickets = function(startDate,endDate,isClosed,orderBy,take,skip) {
    startDate = (startDate!='' ? startDate : moment().format("YYYY-MM-DD"));
    endDate = (endDate!='' ? endDate : moment().add(1,'days').format("YYYY-MM-DD"));
    var q = '{tickets: getTickets(';
        q+= (startDate!='' ? 'start:"'+startDate+'"' : '');
        q+= (endDate!=''   ? ',end:"'+endDate+'"' : '');
        q+= (isClosed!=''  ? ',isClosed:'+isClosed : '');
        q+= (orderBy!=''   ? ',orderBy:'+orderBy : '');
        q+= (take!=''      ? ',take:'+take : '');
        q+= (skip!=''      ? ',skip:'+skip : '');
        q+= ')';
        q+= '{id,uid,number,date,type,totalAmount,remainingAmount,states{stateName,state},tags{tagName,tag},entities{name,type,id,typeId},orders{id,uid,quantity,name,productId,portion,price,priceTag,calculatePrice,decreaseInventory,increaseInventory,tags{tagName,tag,price,quantity,rate,userId},states{stateName,state,stateValue}}}';
        q+= '}';
    return q;
};
gql.getTicket = function(ticketId) {
    var q = '{ticket: getTicket(id:'+ticketId+')';
        q+= '{id,uid,number,date,type,totalAmount,remainingAmount,states{stateName,state},tags{tagName,tag},entities{name,type,id,typeId},orders{id,uid,quantity,name,productId,portion,price,priceTag,calculatePrice,decreaseInventory,increaseInventory,tags{tagName,tag,price,quantity,rate,userId},states{stateName,state,stateValue}}}';
        q+= '}';
    return q;
};
gql.addTasks = function(taskTypes,taskNames,content,isCompleted,userName,customData,state) {
    var q = '';
        q+= 'mutation m{';
        for (var t=0; t<taskNames.length; t++) {
            var taskType = taskTypes[t];
            var taskName = taskNames[t];
            q += 'm'+t+': ';
            q+= 'addTask(';
            q+= 'task:{';
            q+= 'taskType:"'+taskType+'"';
            q+= ',name:"'+taskName+'"';
            q+= ',content:"'+content+'"';
            q+= ',isCompleted:'+isCompleted;
            q+= ',userName:"'+userName+'"';
            q+= (state ? ',state:"'+state+'"' : '');
            q+= ',customData:[';
            if (customData) {
                for (var d=0; d<customData.length; d++) {
                    q+= (d==0 ? '' : ',');
                    q+= '{name:"'+customData[d].name+'",value:"'+customData[d].value+'"}';
                }
            }
            q+= ']';
            q+= '}';
            q+= ')';
            q+= '{id,name,identifier,content,isCompleted,userName,customData{name,value}}';
            q += ((t+1) != taskNames.length ? ', ' : '');
        }
        q+= '}';
    return q;
};
//mutation {addTask(taskType:"TC Punch Task",name:"Punched In",content:"content",isCompleted:false,userName:"Q",customData:[{name:"entityType",value:"Employees"},{name:"entityId",value:""},{name:"entityName",value:"Jenery"},{name:"stateName",value:"TC Punch Status"},{name:"state",value:"Punched In"},{name:"startState",value:"Punched Out"},{name:"endState",value:"Punched In"},{name:"holidayFlag",value:"0"},{name:"Id",value:"2016-07-20T23:55:54.842Z--Punched In-Jenery-undefined"}]){id,name,identifier,content,isCompleted,userName,customData{name,value}}}
gql.getTasks = function(taskType, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback) {
    var q = '';
        q+= '{tasks:getTasks(';
        q+= 'taskType:"'+taskType+'"';
        q+= (completedFilter ? ',isCompleted:'+completedFilter : '');
        q+= (nameLike ? ',nameLike:"'+nameLike+'"' : '');
        q+= (contentLike ? ',contentLike:"'+contentLike+'"' : '');
        q+= (stateFilter ? ',state:"'+stateFilter+'"' : '');
        q+= (fieldFilter ? ',customFields:[{name:"'+fieldFilter.name+'",value:"'+fieldFilter.value+'"}]' : '');
        q+= ')';
        q+= '{id,isCompleted,identifier,name,state,content,contentText,customData{name,value},stateLog{state,start,end},stateDuration{state,duration},startDate,endDate,userName}';
        q+= '}';
    return q;
    //return '{tasks:getTasks(taskType:"'+taskTypeName+'",isCompleted:false){id,isCompleted,identifier,name,content,contentText,customData{name,value},startDate,endDate,userName}}';
};
gql.getTasks2 = function(taskType, startFilter, endFilter, completedFilter, nameLike, contentLike, fieldFilter, stateFilter, callback) {
    var q = '';
        q+= '{tasks:getTasks(';
        q+= 'taskType:"'+taskType+'"';
        q+= (startFilter ? ',startDate:"'+startFilter+'"' : '');
        q+= (endFilter ? ',endDate:"'+endFilter+'"' : '');
        q+= (completedFilter ? ',isCompleted:'+completedFilter : '');
        q+= (nameLike ? ',nameLike:"'+nameLike+'"' : '');
        q+= (contentLike ? ',contentLike:"'+contentLike+'"' : '');
        q+= (stateFilter ? ',state:"'+stateFilter+'"' : '');
        q+= (fieldFilter ? ',customFields:[{name:"'+fieldFilter.name+'",value:"'+fieldFilter.value+'"}]' : '');
        q+= ')';
        q+= '{id,isCompleted,identifier,name,state,content,contentText,customData{name,value},stateLog{state,start,end},stateDuration{state,duration},startDate,endDate,userName}';
        q+= '}';
    return q;
    //return '{tasks:getTasks(taskType:"'+taskTypeName+'",isCompleted:false){id,isCompleted,identifier,name,content,contentText,customData{name,value},startDate,endDate,userName}}';
};
gql.updateTask = function(taskTypes, taskIDs, taskIdents, isCompleted, state, customData, content, name){
    var idList='';
    updatedTasks = [];
    var q = 'mutation m {';
    for (var t=0; t<taskIDs.length; t++) {
        var taskID = taskIDs[t];
        var taskIdent = taskIdents[t];
        var taskType = taskTypes[t];
        q += 'm'+t+': updateTask(';
        q += 'id:'+taskID;
        q += ', task:{';
        q += 'taskType:"'+taskType+'"';
        q += ', isCompleted:'+isCompleted;
        q += (name ? ', name:"'+name+'"' : '');
        q += (state ? ', state:"'+state+'"' : '');
        q += (content ? ', content:"'+content+'"' : '');
        q += ',customData:[';
        if (customData) {
            for (var d=0; d<customData.length; d++) {
                q+= (d==0 ? '' : ',');
                q+= '{name:"'+customData[d].name+'",value:"'+customData[d].value+'"}';
            }
        }
        q += ']';
        q += (taskIdent!='' ? ', identifier:"'+taskIdent+'"' : '');
        q += '}';
        q += ')';
        q+= '{id,isCompleted,identifier,name,state,content,contentText,customData{name,value},stateLog{state,start,end},stateDuration{state,duration},startDate,endDate,userName}';
        //q += '}';
        q += ((t+1) != taskIDs.length ? ', ' : '');

        idList += taskID + ((t+1) != taskIDs.length ? ', ' : '');
        
        var pushVal = { }; // new Object()
        pushVal["id"] = taskID;
        pushVal["completed"] = (isCompleted ? '1' : '0');
        pushVal["identifier"] = taskIdent;
        updatedTasks.push(JSON.stringify(pushVal));
    }
    q += '}';
    spu.consoleLog('Updating Tasks by id: '+idList);
    return q; //'mutation m {updateTask(id:'+taskID+',task:{taskType:"BB Bump Bar Task",isCompleted:true}){id}}';
};
gql.updateTaskByIdentifier = function(taskTypes, taskIdents, isCompleted, state, customData, content, name){
    var idList='';
    var q = 'mutation m {';
    for (var t=0; t<taskIdents.length; t++) {
        var taskIdent = taskIdents[t];
        var taskType = taskTypes[t];
        q += 'm'+t+': updateTask(';
        q += 'identifier:"'+taskIdent+'"';
        q += ', taskType:"'+taskType+'"';
        q += ', task:{';
        q += 'taskType:"'+taskType+'"';
        q += ', isCompleted:'+isCompleted;
        q += (name ? ', name:"'+name+'"' : '');
        q += (state ? ', state:"'+state+'"' : '');
        q += (content ? ', content:"'+content+'"' : '');
        q+= ',customData:[';
        if (customData) {
            for (var d=0; d<customData.length; d++) {
                q+= (d==0 ? '' : ',');
                q+= '{name:"'+customData[d].name+'",value:"'+customData[d].value+'"}';
            }
        }
        q+= ']';
        q += '}';
        q += ')';
        q+= '{id,isCompleted,identifier,name,state,content,contentText,customData{name,value},stateLog{state,start,end},stateDuration{state,duration},startDate,endDate,userName}';
        //q += '}';
        q += ((t+1) != taskIdents.length ? ', ' : '');

        idList += taskIdent + ((t+1) != taskIdents.length ? ', ' : '');
        
        var pushVal = { }; // new Object()
        //pushVal["id"] = taskID;
        pushVal["completed"] = (isCompleted ? '1' : '0');
        pushVal["identifier"] = taskIdent;
        updatedTasks.push(JSON.stringify(pushVal));
    }
    q += '}';
    spu.consoleLog('Updating Tasks by identifier: '+idList);
    return q; //'mutation m {updateTask(id:'+taskID+',task:{taskType:"BB Bump Bar Task",isCompleted:true}){id}}';
};
gql.updateTaskStateByIdentifier = function(taskTypes, taskIdents, taskType, state, stateDate){
    var idList='';
    var stateDate = (stateDate ? stateDate : formatDateTime(new Date(),true,true));
    var q = 'mutation m {';
    for (var t=0; t<taskIdents.length; t++) {
        var taskIdent = taskIdents[t];
        var taskType = taskTypes[t];
        q += 'm'+t+': updateTaskState(';
        q += 'identifier:"'+taskIdent+'"';
        q += ', taskType:"'+taskType+'"';
        q += (state ? ', state:"'+state+'"' : '');
        q += (stateDate ? ', date:"'+stateDate+'"' : '');
        q += ')';
        q += '{id, identifier, name,state,stateLog{state,start,end}}';
        q += ((t+1) != taskIdents.length ? ', ' : '');

        idList += taskIdent + ((t+1) != taskIdents.length ? ', ' : '');
    }
    q += '}';
    spu.consoleLog('Updating Task States ('+state+':'+stateDate+'):'+idList);
    return q; //'mutation m {updateTask(id:'+taskID+',task:{taskType:"BB Bump Bar Task",isCompleted:true}){id}}';
};
gql.deleteTask = function(taskIDs){
    var idList='';
    var q = 'mutation m {';
    for (var t=0; t<taskIDs.length; t++) {
        var taskID = taskIDs[t];
        q += 'm'+t+': deleteTask(';
        q += 'id:'+taskID;
        q += ')';
        q+= '{id,isCompleted,identifier,name,state,content,contentText,customData{name,value},stateLog{state,start,end},stateDuration{state,duration},startDate,endDate,userName}';
        q += ((t+1) != taskIDs.length ? ', ' : '');

        idList += taskID + ((t+1) != taskIDs.length ? ', ' : '');
    }
    q += '}';
    spu.consoleLog('Deleting Tasks: '+idList);
    return q; //'mutation m {updateTask(id:'+taskID+',task:{taskType:"BB Bump Bar Task",isCompleted:true}){id}}';
};

gql.postTaskRefreshMessage = function(taskIDs) {
    var idList='';
    var q = 'mutation m {';
    for (var t=0; t<taskIDs.length; t++) {
        var taskID = taskIDs[t];
        q += 'm'+t+': postTaskRefreshMessage(id:'+taskID+'){id}';
        q += ((t+1) != taskIDs.length ? ', ' : '');
        idList += taskID + ((t+1) != taskIDs.length ? ', ' : '');
    }
    q += '}';
    spu.consoleLog('Posting Rask Refresh Message for Tasks: '+idList);
    return q; //'mutation m {postTaskRefreshMessage(id:'+taskID+'){id}}';
};

gql.getEntities = function(entityType, search, stateFilter){
    var q = '';
        q+= '{entities:getEntities(';
        q+= 'type:"'+entityType+'"';
    if (search) {
        q+= ', search:"'+search+'"';
    }
    if (stateFilter) {
        q+= ', state:"'+stateFilter+'"';
    }
        q+= ')';
        q+= '{';
        q+= 'type,id,name,states{stateName,state},customData{name,value}';
        q+= '}';
        q+= '}';
    return q;
//    return '{entities:getEntities(type:"'+entityType+'"){type,name,states{stateName,state},customData{name,value}}}';
};

gql.getEntityScreenItems = function(entityScreen, stateFilter){
    var q = '';
        q+= '{entityScreenItems:getEntityScreenItems(';
        q+= 'name:"'+entityScreen+'"';
    if (stateFilter) {
        q+= ', state:"'+stateFilter+'"';
    }
        q+= ')';
        q+= '{';
        q+= 'name,caption,color,labelColor';
        q+= '}';
        q+= '}';
    return q;
//    return '{entityScreenItems:getEntiyScreenItems(name:"Tables",state:"*"){name,caption,color,labelColor}}';
};



// PMPOS

gql.getMenu = function(menuName){
    return '{menu:getMenu(name:"'+menuName+'"){categories{id,name,color,foreground,image,header,menuId,isFastMenu,menuItems{id,name,color,foreground,image,header,caption,categoryId,productId,portion,quantity,defaultOrderTags,product{id,name,barcode,groupCode,price,portions{id,name,productId,price}}}}}}';
};

gql.getMenuCategories = function(){
    return '{menuCategories: getMenuCategories(menu:"Menu"){id,name,header,color,image,isFastMenu,menuId,menuItems{id,name,header,caption,image,color,categoryId,portion,productId,product{id,name,groupCode,barcode,price,portions{id,name,productId,price}}}}}';
};
gql.getMenuCategoriesMenuItems = function(){
    return '{menuCategories: getMenuCategories(menu:"Menu"){id,name,header,color,image,isFastMenu,menuId,menuItems{id,name,header,caption,image,color,categoryId,portion,productId,product{id,name,groupCode,barcode,price,portions{id,name,productId,price}}}}}';
};

gql.getMenuItems = function(category){
    return '{items:getMenuItems(menu:"Menu",category:"'+category+'"){id,name,header,caption,color,portion,product{groupCode,name,price,portions{name,price}}}}';
};

gql.getOrderTagGroups = function(productName,productId,portion,ticketType,terminal,department,user,hidden){
    portion = portion=='null' || portion=='' ? 'Normal' : portion;
    return '{orderTagGroups:getOrderTagGroups(productName:"'+productName+'",productId:'+productId+',portion:"'+portion+'",ticketType:"'+ticketType+'",terminal:"'+terminal+'",department:"'+department+'",user:"'+user+'",hidden:'+hidden+'){id,name,color,min,max,hidden,tags{id,name,color,description,header,price,rate,filter,maxQuantity}}}';
};

gql.executePrintJob = function(printJobName, ticketId, copies, orderStateFilters, nextOrderStates, nextTicketStates, terminal, department, ticketType, userName, ticket){
    var pjName = (printJobName!='' ? printJobName : 'Print Bill');
    var tid = (ticketId ? ticketId : 0);
    var cpy = (copies ? copies:  1);
    var usr = (userName ? userName:  currentUser);
    terminal = (terminal ? terminal : POS_Terminal.name ? POS_Terminal.name : defaultTerminal);
    department = (department ? department : departmentName);
    ticketType = (ticketType ? ticketType : ticketTypeName);
    ticket = (ticket ? ticket : '');

    if (orderStateFilters) {
    var osFilters = orderStateFilters.map(function (osf) {
        return '{stateName:"' + osf.stateName + '", state:"' + osf.state + '"}';
    });
    }
    if (nextOrderStates) {
    var osNext = nextOrderStates.map(function (nos) {
        return '{stateName:"' + nos.stateName + '", currentState:"' + nos.currentState + '", state:"' + nos.state + '"}';
    });
    }
    if (nextTicketStates) {
    var tsNext = nextTicketStates.map(function (nts) {
        return '{stateName:"' + nts.stateName + '", state:"' + nts.state + '"}';
    });
    }
    
    //return 'mutation m {executePrintJob(name:"'+pjName+'",ticketId:'+tid+',copies:'+copies+',orderStateFilters:{stateName:"sName",state:"st"},nextOrderStates:{stateName:"nsName",currentState:"csName",state:"nst"},nextTicketStates:{stateName:"sName",state:"st"},userName:"'+usr+'") {name}}';
    var xpj = 'mutation m {printJob:executePrintJob(';
    xpj+= 'name:"'+pjName+'"';
    xpj+= ',ticketId:'+tid;
    xpj+= ',copies:'+cpy;
    xpj+= ',user:"'+usr+'"';
    xpj+= ',terminal:"'+terminal+'"';
    xpj+= ',department:"'+department+'"';
    xpj+= ',ticketType:"'+ticketType+'"';
    xpj+= (ticket!=='' ? ',ticket:"'+ticket+'"' : '');
        xpj+= (osFilters ? ',orderStateFilters:[' + osFilters.join() + ']' : '');
        xpj+= (osNext    ? ',nextOrderStates:[' + osNext.join() + ']' : '');
        xpj+= (tsNext    ? ',nextTicketStates:[' + tsNext.join() + ']' : '');
        xpj+= ') {name}}';
    return xpj;
};

gql.addTicket = function(orders,ticketEntities){

    var orderLines = orders.map(function (order) {
        return '{name:"' + order.name + '",states:[{stateName:"Status",state:"Submitted"},{stateName:"KDStatus",state:"FNotPrinted"}]}';
    });
    
//    var entityPart = (tableName && customerName
//                        ? 'entities:[{entityType:"Tables",name:"'+tableName+'"},{entityType:"Customers",name:"'+customerName+'"}]'
//                        : (tableName 
//                            ?  'entities:[{entityType:"Tables",name:"'+tableName+'"}]'
//                            : (customerName 
//                                ?  'entities:[{entityType:"Customers",name:"'+customerName+'"}]' 
//                                : '')
//                            )
//                        );
    
    var entityPart = 'entities:['+ticketEntities+']';
    
    var q = '';
    q += 'mutation m{addTicket(';
    q += '        ticket:{type:"'+ticketTypeName+'"';
    q += '            , department:"'+departmentName+'"';
    q += '            , user:"'+currentUser+'"';
    //q += '            , terminal:"'+currentTerminal+'"';
    q += '            , terminal:"Server"';
    q += '            , '+entityPart;
    q += '            , states:[{stateName:"Status",state:"Unpaid"}]';
    q += '            , orders:['+orderLines.join()+']';
    q += '        }){id}}';
    return q;
};

gql.updateEntityState = function(entityType,entityName,stateName,state) {
    var q = '';
    q += 'mutation m{updateEntityState(';
    q += 'entityTypeName:"'+entityType+'"';
    q += ', entityName:"'+entityName+'"';
    q += ', stateName:"'+stateName+'"';
    q += ', state:"'+state+'"';
    q += ')';
    q += '{id,name';
    q += ',states{stateName,state}';
    //q += ',type';
    //q += ',customData';
    q += '}';
    q += '}';
    return q;
};

gql.getProductPortions = function(productName,productId) {
    return '{portions:getProductPortions(productName:"'+productName+'",productId:'+productId+'){id,name,productId,price}}';
};

gql.postTicketRefreshMessage = function(ticketId) {
    return 'mutation m {postTicketRefreshMessage(id:'+ticketId+'){id}}';
};

gql.ticketDetails = function() {
    return '{id,uid,type,number,date,totalAmount,remainingAmount,note,tags{tagName,tag},states{stateName,state},entities{name,type,id,typeId},orders{id,uid,name,productId,quantity,portion,price,priceTag,calculatePrice,decreaseInventory,increaseInventory,locked,states{stateName,state,stateValue},tags{tagName,tag,price,quantity,rate,userId}}}';
};
gql.updateTicket = function(ticketId,ticketTags,note) {
    var q = 'mutation m {ticket:updateTicket(ticketId:'+ticketId;
    q += ',ticketTags:' + (ticketTags ? ticketTags : '[]');
    q += note!=='undefined' ? ',note:"'+note+'"' : '';
    q += ')';
    q += gql.ticketDetails();
    q += '}';
    return q;
};
gql.mergeTickets = function(terminal,department,ticketType,user,ticketIds) {
    var q = 'mutation m {ticketId:mergeTickets(terminal:"'+terminal+'",department:"'+department+'",ticketType:"'+ticketType+'",user:"'+user+'"';
    q += ',ticketIds:[' + ticketIds.join() + ']';
    q += ')';
//    q += '{}';
    q += '}';
    return q;
};

gql.registerTerminal = function(terminal,department,ticketType,user) {
    //returns unique terminalId like: 7rO2ngxHRE2Rs47kHlBT8A
    return 'mutation m {terminalId:registerTerminal(terminal:"'+terminal+'",department:"'+department+'",ticketType:"'+ticketType+'",user:"'+user+'")}';
};
gql.unregisterTerminal = function(terminalId) {
    return 'mutation m {isTerminalUnregistered:unregisterTerminal(terminalId:"'+terminalId+'")}';
};
gql.getTerminalExists = function(terminalId) {
    return '{isTerminalExists:getTerminalExists(terminalId:"'+terminalId+'")}';
};

gql.terminalTicketDetails = function() {
    return '{id,uid,type,number,date,totalAmount,remainingAmount,note,entities{typeId,type,id,name},states{stateName,state},tags{tagName,tag},orders{id,uid,name,quantity,productId,portion,price,priceTag,calculatePrice,locked,decreaseInventory,increaseInventory,states{stateName,state,stateValue},tags{tagName,tag,quantity,price,rate,userId}}}';
};
gql.getTerminalTicket = function(terminalId) {
    return '{terminalTicket:getTerminalTicket(terminalId:"'+terminalId+'")'+gql.terminalTicketDetails()+'}';
};
gql.getTerminalTickets = function(terminalId) {
    return '{terminalTickets:getTerminalTickets(terminalId:"'+terminalId+'"){id,number,date,lastOrderDate,remaining,note,entities{typeId,type,id,name},tags{tagName,tag}}}';
};
gql.createTerminalTicket = function(terminalId) {
    return 'mutation m {terminalTicket:createTerminalTicket(terminalId:"'+terminalId+'")'+gql.terminalTicketDetails()+'}';
};
gql.closeTerminalTicket = function(terminalId) {
    return 'mutation m {closeTerminalTicket(terminalId:"'+terminalId+'")}';
};
gql.loadTerminalTicket = function(terminalId,ticketId) {
    return 'mutation m {terminalTicket:loadTerminalTicket(terminalId:"'+terminalId+'",ticketId:"'+ticketId+'")'+gql.terminalTicketDetails()+'}';
};
gql.clearTerminalTicketOrders = function(terminalId) {
    return 'mutation m {terminalTicket:clearTerminalTicketOrders(terminalId:"'+terminalId+'")'+gql.terminalTicketDetails()+'}';
};
gql.changeEntityOfTerminalTicket = function(terminalId,entityType,entityName) {
    return 'mutation m {terminalTicket:changeEntityOfTerminalTicket(terminalId:"'+terminalId+'",type:"'+entityType+'",name:"'+entityName+'")'+gql.terminalTicketDetails()+'}';
};
gql.addOrderToTerminalTicket = function(terminalId,quantity,productName,portion,orderTags,productId) {
    return 'mutation m {terminalTicket:addOrderToTerminalTicket(terminalId:"'+terminalId+'",productId:'+productId+',productName:"'+productName+'",quantity:'+quantity+',portion:"'+portion+'",orderTags:"'+orderTags+'")'+gql.terminalTicketDetails()+'}';
};
gql.updateOrderOfTerminalTicket = function(terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType) {
    var q = 'mutation m {terminalTicket:updateOrderOfTerminalTicket(';
    q += 'terminalId:"' + terminalId + '"';
    q += ',orderUid:"' + orderUid + '"';
    q += quantity !== '' ? ',quantity:' + quantity : '';
    q += portion !== '' ? ',portion:"' + portion+'"' : '';
    q += price !== '' ? ',price:' + price : '';
    q += priceTag !== '' ? ',priceTag:"' + priceTag+'"' : '';
    q += calculatePrice !== '' ? ',calculatePrice:' + calculatePrice : '';
    if (orderTags) {
    var oTags = orderTags.map(function (oTag) {
        return '{tagName:"' + oTag.tagName + '", tag:"' + oTag.tag + '"' + (oTag.price ? ', price:' + oTag.price : '') + (oTag.quantity ? ', quantity:' + oTag.quantity : '') + (oTag.rate ? ', rate:' + oTag.rate : '') + '}';
    });
    q+= (oTags ? ',orderTags:[' + oTags.join() + ']' : '');
    }
    q += locked !== '' ? ',locked:' + locked : '';
    q += increaseInventory !== '' ? ',increaseInventory:' + increaseInventory : '';
    q += decreaseInventory !== '' ? ',decreaseInventory:' + decreaseInventory : '';
    q += name !== '' ? ',name:"' + name+'"' : '';
    q += taxTemplate !== '' ? 'taxTemplate:"' + taxTemplate+'"' : '';
    q += warehouseName !== '' ? 'warehouseName:"' + warehouseName+'"' : '';
    q += accountTransactionType !== '' ? 'accountTransactionType:"' + accountTransactionType+'"' : '';
    q += ')';
    q += gql.terminalTicketDetails();
    q += '}';
    
    return q;
};
gql.cancelOrderOnTerminalTicket = function(terminalId,orderUids) {
    var q = 'mutation m {';
    for (var u=0;u<orderUids.length;u++) {
        q += 'm'+u+':';
        q += 'cancelOrderOnTerminalTicket(terminalId:"'+terminalId+'",orderUid:"'+orderUids[u]+'")';
        q += gql.terminalTicketDetails();
        q += ((u+1) !== orderUids.length ? ', ' : '');
    }
    q += '}';
    return q;
//    return 'mutation m {terminalTicket:cancelOrderOnTerminalTicket(terminalId:"'+terminalId+'",orderUid:"'+orderUid+'")'+gql.terminalTicketDetails()+'}';
};
gql.getOrderTagsForTerminalTicketOrder = function(terminalId,orderUid) {
    return 'mutation m {orderTagGroups:getOrderTagsForTerminalTicketOrder(terminalId:"'+terminalId+'",orderUid:"'+orderUid+'"){name,maxSelection,requiredSelection,tags{groupName,name,color,labelColor,isVisible,isSelected,fontSize,caption},categories{name,value,color,level,sortOrder},prefixes{name,color,fontSize}}}';
};
gql.executeAutomationCommandForTerminalTicket = function(terminalId,orderUid,commandName,commandValue) {
    var q = 'mutation m {terminalTicket:executeAutomationCommandForTerminalTicket(';
    q += 'terminalId:"'+terminalId+'"';
    q += ',orderUid:"'+orderUid+'"';
    q += ',name:"'+commandName+'"';
    q += ',value:"'+commandValue+'"';
    q += ')';
    q += gql.terminalTicketDetails();
    q += '}';
    return q;
    //'mutation m {terminalTicket:executeAutomationCommandForTerminalTicket(terminalId:"",orderUid:"",name:"",value:"")'+gql.terminalTicketDetails()+'}';
};
