/* global spu, POS_Terminal, module, POS_Menu, busyWheel, currentUser */

////////////////////////////////
//
// nav_pos
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');
    
    $('#POS_Orders').empty();
    $('#POS_TicketList').empty();
    $('#loadMessage').html('<br /><br /><div class="info-message">Loading Module:<br /><br />[ POS ]<br /><br />... please wait ...<br /><br />'+busyWheel+'</div>');
    $('#loadMessage').show();
    workperiodCheck('',function wpo(workperiod){
        WPisOpen = workperiod.isOpen;
        if (!workperiod.isOpen) {
            spu.consoleLog('POS NOT ready.  Workperiod is CLOSED.');
            showInfoMessage('Workperiod is CLOSED.<br /><br />Click to Retry.');
        } else {
            $('#infoMessage').hide();
        }

        //registerTerminal(terminal,department,ticketType,user,reRegister,callback);
        var term = (POS_Terminal.name ? POS_Terminal.name : defaultTerminal);
        registerTerminal(term,'','','',false,function r(term){
            spu.consoleLog('Yup ['+term.name+'] ('+term.registered+'):'+term.id);

            var tTypes = [];
                tTypes.push(ticketTypeName);
            getReportVars('GQLM Ticket Type Entity Types',tTypes, function ttet(etdata){
                var eTypes = etdata;

                // get Ticket Entity Types when POS_EntityTypesAuto==true
                // or if POS_EntityTypes has not been specified
                if (POS_EntityTypesAuto || POS_EntityTypes.length<1) {
                    POS_EntityTypes = [];
                    for (var et=0; et<eTypes.length; et++) {
                        POS_EntityTypes.push(eTypes[et].name.replace(/ /g,'_'));
                    }
                }

                POS_refreshPOSDisplay(true,function rpd(data){
                    $('#loadMessage').hide();
                });
            });
        });

    });

}

function POS_categoryClicked(catId, renderMenuItems, callback) {
    var fn = spu.fi(arguments);
    
    for (var c=0; c<POS_Menu.categories.length; c++) {
        if (document.getElementById('cm_'+POS_Menu.categories[c].id)) {
            var d = document.getElementById('cm_'+POS_Menu.categories[c].id);
            // markers
            $('#cm_'+POS_Menu.categories[c].id).hide();
            $('#cm2_'+POS_Menu.categories[c].id).hide();
        }
        if (POS_Menu.categories[c].id === catId) {
            var cat = POS_Menu.categories[c];
            if (document.getElementById('cm_'+POS_Menu.categories[c].id)) {
                var s = document.getElementById('cm_'+POS_Menu.categories[c].id);
                // markers
                $('#cm_'+POS_Menu.categories[c].id).show();
                $('#cm2_'+POS_Menu.categories[c].id).show();
            }
        }
    }
    
    POS_Menu.selectedCategoryId = cat.id;
    POS_Menu.selectedCategoryDivId = 'c_'+cat.id;
    POS_Menu.selectedCatName = cat.name;
    POS_Menu.selectedCatBGcolor = cat.color;
    POS_Menu.selectedCatIsFastMenu = cat.isFastMenu;
    
    spu.consoleLog('Category clicked: ['+POS_Menu.selectedCategoryId+'] ('+POS_Menu.selectedCatName+'), isFast:'+POS_Menu.selectedCatIsFastMenu);
    

    var items = '';
    
    POS_getMenuItems(POS_Menu.selectedCategoryId, function m(data){
         items = data;
         if (renderMenuItems) {
             $('#menuItems').empty();
             $('#menuItems').append(items);
         }
         if (callback) {
             callback(items);
         }
    });
}

function POS_menuItemClicked(m) {
    var fn = spu.fi(arguments);
    
    var miId           = m;
    var miDivId        = 'm_'+m;
    var elem           = document.getElementById(miDivId);
    
    var quantity       = 1;
    var miName         = elem.getAttribute("name");
    var miPrice        = elem.getAttribute('price');
    var productId      = elem.getAttribute('productId');
    var productName    = elem.getAttribute('productName');
    var portion        = elem.getAttribute('portion');
    var defaultOrderTags      = elem.getAttribute('defaultOrderTags');
    var orderLineTotal = Number(quantity * miPrice).toFixed(2);

    if (!POS_Ticket.terminalTicket) {
        spu.consoleLog('TERMINAL createTerminalTicket ...');
        gql.EXEC(gql.createTerminalTicket(POS_Terminal.id), function ct(response){
            var ticket = response.data.terminalTicket;
            ticket.note = '';
            POS_Ticket.terminalTicket = ticket;
            
            addOrderToTicket(POS_Terminal.id,quantity,productName,portion,defaultOrderTags,productId);

        });

    } else {

        addOrderToTicket(POS_Terminal.id,quantity,productName,portion,defaultOrderTags,productId);

    }
    
}
function addOrderToTicket(terminalId,quantity,productName,portion,defaultOrderTags,productId) {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('TERMINAL addOrderToTerminalTicket ...');
    gql.EXEC(gql.addOrderToTerminalTicket(terminalId,quantity,productName,portion,defaultOrderTags,productId), function ord(response){
        var ticket = response.data.terminalTicket;
            ticket.locked = false;
            ticket.note = POS_Ticket.terminalTicket.note;
        POS_Ticket.terminalTicket = ticket;
        POS_Ticket.selectedOrder = ticket.orders[ticket.orders.length-1];
        
        var orderUid = POS_Ticket.selectedOrder.uid;
        spu.consoleLog('Order Added: '+productName);
        
//        POS_updateOrderStateList();
        
//        var oStates = POS_Ticket.selectedOrder.states;
//        var oStateList = [];
//        for (var s=0; s<oStates.length; s++) {
//            var oState = oStates[s].state;
//            oStateList.push(oState);
//        }
//        POS_Ticket.selectedOrder.orderStateList = oStateList;
        
//        POS_updateTicketOrders(ticket, false, function ti(data){
//            
//            POS_Ticket.selectedOrder = data;
//            var orderUid = POS_Ticket.selectedOrder.uid;
//            spu.consoleLog('Order Added: '+productName);
            
            // load Order Tag screen
//            POS_getOrderTagGroups(productName,productId,portion, function t(oTagGroups){
//                POS_OrderTagGroups = oTagGroups;
//                POS_Ticket.selectedOrder.orderTagGroups = POS_OrderTagGroups;
//                if (oTagGroups.length>0) {
//                    POS_showOrderTagScreen(oTagGroups, defaultOrderTags.split(','));
//                } else {
//                    POS_Ticket.selectedOrder = {};
//                    POS_closeOrderTagDisplay();
//                }
//            });
            
            gql.EXEC(gql.getProductPortions(productName,productId), function p(response){
                var portions = response.data.portions;
                POS_Ticket.selectedOrder.portions = portions;
                
                POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function t(oTagGroups){
//                    POS_Ticket.selectedOrder.orderTagGroups = oTagGroups;
                    if (oTagGroups.length>0) {
                        POS_showOrderTagScreenForOrder(oTagGroups);
                    } else {
                        POS_Ticket.selectedOrder = {};
//                        POS_closeOrderTagDisplay();
                    }
                    POS_updateTicketOrders(ticket.orders,true);
                });
                
            });
            
//        });
    });
}

function POS_orderLineClicked(orderUid) {
    var fn = spu.fi(arguments);
    
    var elem     = document.getElementById('o_'+orderUid);
    
    var miName = elem.getAttribute("name");
    var orderId = elem.getAttribute("orderId");
    var orderUid = elem.getAttribute("orderUid");

    spu.consoleLog('Order Selected: '+miName);

    
    for (var t=0;t<POS_Ticket.terminalTicket.orders.length; t++) {
        var ticketOrder = POS_Ticket.terminalTicket.orders[t];
        if (ticketOrder.uid == orderUid) {
            POS_Ticket.selectedOrder = POS_Ticket.terminalTicket.orders[t];
            break;
        }
    }

    var miName = elem.getAttribute("name");
    var productId = elem.getAttribute("productId");
    var productName = elem.getAttribute("product");
    var portion = elem.getAttribute("portion");
    
    var locked = elem.getAttribute("locked") === 'true' ? true : false;
//    var calculatePrice = POS_Ticket.selectedOrder.calculatePrice;
//    var giftStatus = elem.getAttribute("giftStatus");
//    var voidStatus = elem.getAttribute("voidStatus");
//    var GStatus = elem.getAttribute("GStatus");
//    var oStateList = elem.getAttribute("orderStateList");
    
    var quantity = elem.getAttribute("quantity");
    var product  = elem.getAttribute("product");
    var price    = elem.getAttribute("price");
//    var orderLineTotal    = elem.getAttribute("orderLineTotal");
    
    var orderTags= elem.getAttribute("orderTags");

    var isSelected = (elem.getAttribute("isSelected")=='1' ? '0' : '1');
    for (var o=0; o<orders.length; o++) {
        if (document.getElementById('o_'+o)) {
            document.getElementById('o_'+o).setAttribute("isSelected", "0");
            document.getElementById('o_'+o).style.backgroundColor = '';
        }
    }
    elem.setAttribute("isSelected", isSelected);
    isSelected = elem.getAttribute("isSelected");
    if (isSelected=='1') {
        selectedOrderCount++;
        elem.style.backgroundColor = '#224455';
    } else {
        selectedOrderCount--;
        elem.style.backgroundColor = '';
    }
    spu.consoleLog('ORDERLINE:'+quantity+'x '+product+' '+price+' S:'+isSelected+' bgColor:'+elem.style.backgroundColor);
    spu.consoleLog('selectedOrderCount:'+selectedOrderCount);


    if (isSelected=='1') {
//        var oTags = POS_Ticket.selectedOrder.tags;
        gql.EXEC(gql.getProductPortions(productName,productId), function p(response){
            var portions = response.data.portions;
            
//            POS_Ticket.selectedOrder = {orderId:orderId,orderUid:orderUid,quantity:quantity,price:price,name:miName,productName:productName,productId:productId,portion:portion,locked:locked,calculatePrice:calculatePrice,orderTags:orderTags,tags:oTags,orderStateList:oStateList,portions:portions};
            POS_Ticket.selectedOrder.portions = portions;
            
            // load Order Tag screen
            if (locked && 1===2) {
                POS_getOrderTagGroups(productName,productId,portion, function t(oTagGroups){
                    POS_Ticket.selectedOrder.orderTagGroups = oTagGroups;
                    POS_showOrderTagScreen(oTagGroups, orderTags.split(','));
                });
            } else {
                POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function t(oTagGroups){
                    POS_Ticket.selectedOrder.orderTagGroups = oTagGroups;
                    POS_showOrderTagScreenForOrder(oTagGroups);
                });
            }
            
        });

    } else {
        POS_Ticket.selectedOrder = {};
        POS_closeOrderTagDisplay();
    }

}
function POS_updateOrderStateList(selectedOrder) {
    var fn = spu.fi(arguments);
    
    selectedOrder = typeof selectedOrder!=='undefined' ? selectedOrder : POS_Ticket.selectedOrder;
    var oStates = selectedOrder.states;
    var oStateList = [];
//    POS_SendKDUpdateMessage = false;
    for (var s=0; s<oStates.length; s++) {
        var oStateName = oStates[s].stateName;
        var oState = oStates[s].state;
        oStateList.push(oState);
        if (oStateName==='KDStatus' && oState==='FNotPrinted') {
            POS_SendKDUpdateMessage = true;
            spu.consoleLog('POS_updateOrderStateList found Order for KD Update ('+oStateName+'/'+oState+'): '+selectedOrder.name);
        }
    }
//    POS_Ticket.selectedOrder.orderStateList = oStateList;
}

function POS_entityGridButtonClick(divId) {
    var fn = spu.fi(arguments);
    
    var elem = document.getElementById(divId);
    
    var et  = elem.getAttribute("entityType");
    // singular name of Entity Type
    var ets = et.substr(0,et.length-1);
    var selectedEntity = POS_Ticket[ets] ? POS_Ticket[ets] : 'NONE';
    var selEnt = selectedEntity.replace(/ /g,'_');
    var entityName  = elem.getAttribute("name");
    var selEntType = et.replace(/ /g,'_');
    var entityType = et.replace(/_/g,' ');
    var entityStatusState = elem.getAttribute("statusState");
    
    spu.consoleLog("SELECTED Entity: "+et+":"+entityName);
    
    if (document.getElementById(et)) {
        $('#'+et).hide();
    }
    
    if (document.getElementById('select'+selEntType)) {
        if (entityName==='BACK') {
            // do nothing
        } else if (entityName==='NONE') {
            POS_Ticket[ets] = '';
        } else {
            POS_Ticket[ets] = entityName;
        }
    }
    
    entityName = entityName==='NONE' ? '' : entityName;

    if (!POS_Ticket.terminalTicket) {
        var matchingEntityTicketIds = POS_checkEntityTickets();
    } else {
        var matchingEntityTicketIds = [];
    }

    if (matchingEntityTicketIds.length>0) {
        // stop
    } else {
        if (entityName !== 'BACK') {

            if (!POS_Ticket.terminalTicket) {
                gql.EXEC(gql.createTerminalTicket(POS_Terminal.id), function c(response){
                    var ticket = response.data.terminalTicket;
                    ticket.note = '';
                    POS_Ticket.terminalTicket = ticket;

                    POS_updateTicketEntity(POS_Terminal.id, entityType, entityName);

                });

            } else {

                POS_updateTicketEntity(POS_Terminal.id, entityType, entityName);

            }
        }
    }
}
function POS_updateTicketEntity(terminalId,entityType,entityName, callback) {
    var fn = spu.fi(arguments);
        
    gql.EXEC(gql.changeEntityOfTerminalTicket(terminalId,entityType,entityName), function et(response){
        if (response.errors) {
            gql.handleError(fn+' gql.changeEntityOfTerminalTicket',response);
        } else {
            var ticket = response.data.terminalTicket;
//            ticket.orders = POS_Ticket.terminalTicket.orders;
            ticket.selectionRequired = POS_Ticket.terminalTicket.selectionRequired;
            ticket.canCloseTicket = POS_Ticket.terminalTicket.canCloseTicket;
            
            POS_Ticket.terminalTicket = ticket;
            
            POS_updateTicketOrders(POS_Ticket.terminalTicket.orders, true);
            
            $('#POS_EntitySelectors').html(POS_getEntitySelectors(ticket.entities));
            
            POS_fillEntityGrids();

        }
    });
}
function POS_checkEntityTickets() {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('>Checking POS_EntityTickets ...');
    
    POS_EntityTickets = [];

    var eTickets = cloneData(POS_Terminal.tickets);
    
    for (var t=0; t<eTickets.length; t++) {
        var eTicket = eTickets[t];
        var entityTicket = cloneData(eTicket);
        for (var e=0; e<eTicket.entities.length; e++) {
            entityTicket.entityType = eTicket.entities[e].type;
            entityTicket.entityName = eTicket.entities[e].name;
            POS_EntityTickets.push({ticket:eTicket,ticketId:eTicket.id,entityType:eTicket.entities[e].type,entityName:eTicket.entities[e].name});
            spu.consoleLog((POS_EntityTickets.length-1)+'>'+POS_EntityTickets[POS_EntityTickets.length-1].entityType+':'+POS_EntityTickets[POS_EntityTickets.length-1].entityName);
        }
    }
    
    var ticketIds = [];
    var tEntities = [];
    
    for(var key in POS_Ticket){
        for (var tet=0; tet<POS_EntityTypes.length; tet++) {
            var et  = POS_EntityTypes[tet];
            var ets = et.substr(0,(et.length-1));
            if (key == ets) {
                var eType = et;
                var eName = POS_Ticket[key];
                if (eName!='' && eName!='NONE') {
                    tEntities.push({type:eType,name:eName});
                }
            }
        }
        
    }
    for (var t=0; t<POS_EntityTickets.length; t++) {
        for (var te=0; te<tEntities.length; te++) {
//        spu.consoleLog('Checking: '+POS_EntityTickets[t].entityType+':'+POS_EntityTickets[t].entityName+' against '+entityType+':'+entityName+' ...');
            if (POS_EntityTickets[t].entityType == tEntities[te].type && POS_EntityTickets[t].entityName == tEntities[te].name) {
                spu.consoleLog('Matching EntityTicket ('+POS_EntityTickets[t].entityType+':'+POS_EntityTickets[t].entityName+'): '+POS_EntityTickets[t].ticketId);
                var alreadyadded = false;
                for (var tids=0; tids<ticketIds.length; tids++) {
                    if (ticketIds[tids] == POS_EntityTickets[t].ticketId) {
                        alreadyadded = true;
                    }
                }
                if (!alreadyadded) {
                    ticketIds.push(POS_EntityTickets[t].ticketId);
                }
            }
        }
    }
    if (ticketIds.length>0) {
        spu.consoleLog('Found matching EntityTickets ...');
        for (var t=0; t<ticketIds.length; t++) {
            spu.consoleLog(t+'>Match, ticketId: '+ticketIds[t]);
        }
    }
    
    POS_EntityTickets = [];

    var eTickets = cloneData(POS_Terminal.tickets);
    
    for (var t=0; t<eTickets.length; t++) {
        var eTicket = eTickets[t];
        for (var tids=0; tids<ticketIds.length; tids++) {
            if (eTicket.id == ticketIds[tids]) {
                POS_EntityTickets.push(eTicket);
            }
        }
    }
    
    if (POS_EntityTickets.length>0) {
        POS_switchTicketAreaContent('TicketList');
        POS_renderTicketList(POS_EntityTickets,tEntities, function t(data){
            var ticketList = data;
            $('#POS_TicketList').html(ticketList);
            $('#POS_EntitySelectors').html(POS_getEntitySelectors(tEntities));
        });
    }
    
    return ticketIds;
}
function POS_createTerminalTicket(terminalId, callback) {
    var fn = spu.fi(arguments);
    
    terminalId = typeof terminalId==='undefined' || terminalId==='' ? POS_Terminal.id : terminalId;
    
    gql.EXEC(gql.createTerminalTicket(terminalId), function c(response){
        var ticket = response.data.terminalTicket;
        
        POS_Ticket.terminalTicket = ticket;

        for(var key in POS_Ticket){
            for (var tet=0; tet<POS_EntityTypes.length; tet++) {
                var et  = POS_EntityTypes[tet];
                var ets = et.substr(0,(et.length-1));
                if (key == ets) {
                    var eType = et;
                    var eName = POS_Ticket[key];
                    if (eName!='' && eName!='NONE') {
//                        tEntities.push({type:eType,name:eName});
                        POS_updateTicketEntity(POS_Terminal.id, eType, eName);
                    }
                }
            }
        }
        
    });
}

function POS_getCategories(menu,callback){
    var fn = spu.fi(arguments);
    
    categoryIDs = [];

    var menuCategories = menu.categories;

    spu.consoleLog('POS_getCategories ('+menuCategories.length+')');

    var fastStuff = '';
    var catStuff = '';
    var firstNonFastCat = -1;
    var selectedCategoryDivId = '';

    for (var c=0; c<menuCategories.length; c++) {
        var category = menuCategories[c];
        var catId = category.id;
        categoryIDs.push(catId);

        firstNonFastCat = (category.isFastMenu==false && firstNonFastCat<0 ? c : firstNonFastCat);
        firstNonFastCat = Number(firstNonFastCat);

        var catName = category.name.toString().replace(/\\r/g, " ");

        var catHeader = '';
        if (category.header!=null) {
            catHeader = category.header.toString().replace(/\\r/g, "<br />");
            catHeader = catHeader.replace(/<br>/g, "<br />");
        }

        var catButtonText = (catHeader!='' ? catHeader : catName);

        var bgColor = '';
        if (category.color!=null) {
            bgColor = category.color;
        } else {
            bgColor = '#FF333333';
            bgColor = '#333333';
        }

        if (c==firstNonFastCat) {
            var categoryBGcolor = bgColor;
        }

        var tColor = category.foreground;


        catStuff += '<div class="category">';
        catStuff += '<div id="c_'+catId+'" name="'+catName+'" value="'+catName+'" isFastMenu="0" bgColor="'+bgColor+'" style="background-color:'+bgColor+';color:'+tColor+';" class="cBtn" onClick="POS_categoryClicked('+catId+',true'+')">';
        catStuff += catButtonText;
        catStuff += '</div>';
        catStuff += '<div id="cm_'+catId+'" class="catmarker"></div>';
        catStuff += '<div id="cm2_'+catId+'" class="catmarker2"></div>';
        catStuff += '</div>';

    }

    if (callback) {
        callback(catStuff);
    }
}

/*
function POS_getOrderTagGroups(productName,productId,portion, callback) {
    var fn = spu.fi(arguments);
    
//    $('#POS_OrderTags').html('<div class="info-message">Fetching Order Tags, please Wait...<br /><br />'+busyWheel+'</div>');
//    $('#POS_OrderTagDisplay').show();
    
    var portion = portion=='null' || portion=='' ? 'Normal' : portion;
    var ticketType = POS_Ticket.terminalTicket.type;// ticketType ? ticketType : ticketTypeName;
    var terminal = terminal ? terminal : POS_Terminal.name;
    var department = department ? department : departmentName;
    var user = user ? user : currentUser;
    var hidden = true;

    var oTagGroups;
    gql.EXEC(gql.getOrderTagGroups(productName,productId,portion,ticketType,terminal,department,user,hidden), function(response) {
        if (response.errors) {
            gql.handleError(fn+' gql.getOrderTagGroups',response);
        } else {
            oTagGroups = response.data.orderTagGroups;
            POS_Ticket.orderTagGroups = oTagGroups;
        }
        if (callback) {
            callback(oTagGroups);
        }
    });
}
*/
function POS_getOrderTagGroupsForOrder(terminalId,orderUid, callback) {
    var fn = spu.fi(arguments);
    
    terminalId = typeof terminalId==='undefined' || terminalId==='' ? POS_Terminal.id : terminalId;
    orderUid = typeof orderUid==='undefined' || orderUid==='' ? POS_Ticket.selectedOrder.orderUid : orderUid;
    
    var foundOrder = false;
    
    for (var o=0; o<POS_Ticket.terminalTicket.orders.length; o++) {
        if (POS_Ticket.terminalTicket.orders[o].uid === orderUid) {
            foundOrder = true;
        }
    }

    var oTagGroups = [];

    if (foundOrder) {
        
        gql.EXEC(gql.getOrderTagsForTerminalTicketOrder(terminalId,orderUid), function(response) {
            if (response.errors) {
                gql.handleError(fn+' gql.getOrderTagsForTerminalTicketOrder',response);
            } else {
                oTagGroups = response.data.orderTagGroups;
                POS_Ticket.orderTagGroups = oTagGroups;
                var requiredSelectionCount = 0;
                for (var t=0; t<oTagGroups.length; t++) {
                    if (oTagGroups[t].requiredSelection>0) {
                        requiredSelectionCount++;
                        oTagGroups.requiredSelectionCount = requiredSelectionCount;
                    }
                }
                if (requiredSelectionCount>0) {
    //                POS_Ticket.selectedOrder.selectionRequired = true;
                    POS_Ticket.terminalTicket.selectionRequired = true;
                    POS_Ticket.terminalTicket.canCloseTicket = false;
                }
            }
            if (callback) {
                callback(oTagGroups);
            }
        });
        
    } else {
        if (callback) {
            callback(oTagGroups);
        }
    }
}

function POS_showOrderTagScreenForOrder(orderTagGroups) {
    var fn = spu.fi(arguments);
    
//    orderTagGroups[g].name
//    orderTagGroups[g].maxSelection
//    orderTagGroups[g].requiredSelection
//    orderTagGroups[g].categories[c].name
//    orderTagGroups[g].categories[c].value
//    orderTagGroups[g].categories[c].color
//    orderTagGroups[g].categories[c].level
//    orderTagGroups[g].categories[c].sortOrder
//    orderTagGroups[g].prefixes[pfx].name
//    orderTagGroups[g].prefixes[pfx].color
//    orderTagGroups[g].prefixes[pfx].fontSize
//    orderTagGroups[g].tags[t].caption
//    orderTagGroups[g].tags[t].color
//    orderTagGroups[g].tags[t].fontSize
//    orderTagGroups[g].tags[t].groupName
//    orderTagGroups[g].tags[t].isSelected
//    orderTagGroups[g].tags[t].isVisible
//    orderTagGroups[g].tags[t].labelColor
//    orderTagGroups[g].tags[t].name
    
    var order = POS_Ticket.selectedOrder;
    
    var orderUid = order.uid;
    
    var tagGroups = orderTagGroups;
    var selectedOrderTags = [];
    
//    var orderTags = order.tags;
    
    var isGift = false;
    var isVoid = false;
    
    var oStates = order.states;
    var oStateList = [];
    for (var s=0; s<oStates.length; s++) {
        var oState = oStates[s].state;
        oStateList.push(oState);
        if (oState=='Gift') {
            isGift = true;
        }
        if (oState=='Void') {
            isVoid = true;
        }
    }

    //
    // HEADER
    //
    var otHead = '';
    otHead += '<div id="selectedOrderQuantity">' + order.quantity + '</div>';
    otHead += '<div id="selectedOrderName">' + order.name + '<span id="selectedOrderPortion">(' + order.portion + ')</span></div>';
    if (!order.locked) {
        otHead += '<div id="quantityPlus" class="POS_OrderCommands" onclick="POS_ChangeOrderQuantity(\'+\');">+</div>';
        otHead += '<div id="quantityMinus" class="POS_OrderCommands" onclick="POS_ChangeOrderQuantity(\'-\');">-</div>';
        otHead += '<div id="cancelButton" class="POS_OrderCommands" onclick="POS_CancelOrder(\''+POS_Terminal.id+'\',\''+orderUid+'\');">CANCEL Order</div>';
    }
        otHead += '<div id="giftButton" class="POS_OrderCommands" onclick="POS_GiftOrder(\''+orderUid+'\');">'+(!isGift ? 'GIFT' : 'CANCEL<br />Gift')+'</div>';
    if (order.locked) {
        otHead += '<div id="voidButton" class="POS_OrderCommands" onclick="POS_VoidOrder(\''+orderUid+'\');">'+(!isGift ? 'VOID' : 'CANCEL<br />Void')+'</div>';
        otHead += '<div id="lockedMessage">Order is LOCKED!</div>';
    }
    $('#POS_OrderTagsHeader').html(otHead);
    $('#POS_OrderTagsHeader').append('<div class="closeButtonLarge" title="click to close" onclick="POS_closeOrderTagDisplay();return false;">X</div>');


    var otStuff = '';

    //
    // PORTIONS
    //
    var portions = order.portions; // id,name,price,productId

    if (typeof portions !== 'undefined' && portions.length>1) {

        otStuff += '<div class="orderTagGroupSection">';

        otStuff += '<div id="orderPortions" class="portionGroup">Portion</div>';
        otStuff += '<div class="orderTagButtonSection">';

        for (var p=0; p<portions.length; p++) {
            var portion = portions[p];
            var tagClass = order.portion === portion.name ? ' orderTagButtonSelected' : '';
            if (Number(portion.price)!=0) {
                otStuff += '<div id="opb_'+portion.id+'" portionName="'+portion.name+'" portionPrice="'+portion.price+'" productId="'+portion.productId+'" class="orderTagButton'+tagClass+'" onclick="POS_updateOrderPortionForOrder('+portion.id+",'"+portion.name+"'"+')">'+portion.name+'<br />'+portion.price.toFixed(2)+'</div>';
            }
        }

        otStuff += '</div>'; // orderTagButtonSection
        otStuff += '</div>'; // orderTagGroupSection

    }


    var selectionRequired = false;

    //
    // ORDER TAGS
    //
    for (var g=0; g<tagGroups.length; g++) {
        var tagGroup = tagGroups[g];

        tagGroup.id = tagGroup.name.replace(/ /g,'_');
        tagGroups[g].id = tagGroup.id;
        
        //
        // ORDER TAG GROUP HEADER
        //
        otStuff += '<div class="orderTagGroupSection">';

        otStuff += '<div id="orderTagGroup_'+tagGroup.id+'" class="orderTagGroup">'+tagGroup.name;
        otStuff += '<span class="orderTagMinMaxArea">';
//        otStuff += '&nbsp; Min:<div id="min_"'+tagGroup.id+'" val="' + tagGroup.min + '" style="display:inline-block;">' + tagGroup.min + '</div>';
        otStuff += '&nbsp; Max:<div id="max_"'+tagGroup.id+'" val="' + tagGroup.maxSelection + '" style="display:inline-block;">' + tagGroup.maxSelection + '</div>';
        otStuff += (tagGroup.requiredSelection>0 ? ' <div id="selectionWarning_'+tagGroup.id+'" class="orderTagSelectionWarning">Selection Required! ('+tagGroup.requiredSelection+')</div>' : '');
        otStuff += '</span>';
        otStuff += '</div>';


        //
        // ORDER TAG PREFIXES
        //
        otStuff += '<div class="orderTagPrefixSection">';

        var pfxStuff = '';
        var groupPrefixes = tagGroup.prefixes;
        var selectedPrefixes = '';
        for (var p=0; p<groupPrefixes.length; p++) {
            var prefix = groupPrefixes[p];
                prefix.id = prefix.name.replace(/ /g,'_');
                prefix.isSelected = typeof prefix.isSelected === 'undefined' ? false : prefix.isSelected;
            
            selectedPrefixes += (prefix.isSelected ? prefix.name+' ' : '');
            
            var prefixClass= prefix.isSelected ? ' orderTagPrefixSelected' : '';
            var prefixDivId = 'otp_'+tagGroup.id+'_'+prefix.id;
            
            pfxStuff += '<div id="'+prefixDivId+'" tagGroupId="'+tagGroup.id+'" tagGroup="'+tagGroup.name+'"';
//            pfxStuff += ' tagRequiredSelection="'+tagGroup.requiredSelection+'" tagMaxSelection="'+tagGroup.maxSelection+'"';
//            pfxStuff += ' tagQuantity="'+tag.quantity+'"';
            pfxStuff += ' prefixName="'+prefix.name+'"';
            pfxStuff += ' prefixColor="'+prefix.color+'"';
            //pfxStuff += ' tagPrice="'+tag.price+'" tagRate="'+tag.rate+'"';
            pfxStuff += ' isSelected="'+(prefix.isSelected ? '1' : '0')+'"';
            pfxStuff += ' class="orderTagPrefixButton'+prefixClass+'"';
//            pfxStuff += ' onclick="POS_updateOrderTagSelectionForOrder('+"'"+orderUid+"',"+"'"+prefix.id+"'"+",'"+tagGroup.name+"'"+",'"+prefix.name+"'"+')"';
            pfxStuff += ' onclick="POS_toggleOrderTagPrefix('+"'"+prefixDivId+"'"+')"';
            pfxStuff += '>';
            pfxStuff += prefix.name;
            pfxStuff += '</div>';
        }
        pfxStuff += '</div>';
        otStuff += pfxStuff;
        
        
        //
        // ORDER TAG BUTTONS
        //
        otStuff += '<div class="orderTagButtonSection">';
        
        tagGroup.selectedQuantity = 0;

        var groupTags = tagGroup.tags;
        for (var t=0; t<groupTags.length; t++) {
            var tag = groupTags[t];
                tag.id = tag.name.replace(/ /g,'_');
            var quant = tag.caption.indexOf('x ');
                tag.quantity = (quant<0 ? 0 : tag.caption.substr(0,quant));
                
            var tagClass= tag.isSelected ? ' orderTagButtonSelected' : '';
            var tagDivId = 'otb_'+tagGroup.id+'_'+tag.id;
            
            tag.tagName = tagGroup.name;
            tag.groupId = tagGroup.id;
            tag.tag = tag.name;
            tag.min = tagGroup.requiredSelection;
            tagGroup.selectedQuantity = tag.quantity;
            // {tagName:"Condiments",tag:"Mustard",price:10,quantity:1,rate:0}
//            var tagJSON = JSON.stringify(tag);
            selectedOrderTags.push(tag);

//            var selectedPrefixes = '';
//            for (var p=0; t<groupPrefixes.length; p++) {
//                var prefix = groupPrefixes[p];
//                    prefix.id = prefix.name.replace(/ /g,'_');
//
//                var prefixClass= prefix.isSelected ? ' orderTagPrefixSelected' : '';
//                var prefixDivId = 'otp_'+tagGroup.id+'_'+prefix.id;
//            }
            
            if (tag.isVisible) {
                otStuff += '<div id="'+tagDivId+'" tagGroupId="'+tagGroup.id+'" tagGroup="'+tagGroup.name+'"';
                otStuff += ' tagRequiredSelection="'+tagGroup.requiredSelection+'" tagMaxSelection="'+tagGroup.maxSelection+'"';
                otStuff += ' tagQuantity="'+tag.quantity+'"';
                otStuff += ' tagName="'+tag.name+'"';
                //otStuff += ' tagPrice="'+tag.price+'" tagRate="'+tag.rate+'"';
                otStuff += ' class="orderTagButton'+tagClass+'"';
                otStuff += ' onclick="POS_updateOrderTagSelectionForOrder('+"'"+orderUid+"',"+"'"+tag.id+"'"+",'"+tagGroup.name+"'"+",'"+selectedPrefixes+tag.name+"'"+')"';
                otStuff += '>';
                otStuff += tag.caption;
                otStuff += '</div>';
            }
            
        }

        otStuff += '</div>'; // orderTagButtonSection
        otStuff += '</div>'; // orderTagGroupSection

        // check for Min Required Tag selection
        if (tagGroup.selectedQuantity < tagGroup.requiredSelection) {
            selectionRequired = true;
        }

    }

    //
    // NO ORDER TAGS
    //
    if (tagGroups.length===0) {
        otStuff += '<div class="orderTagsNoneMessage">No Order Tags for this Item.</div>';
    }


    $('#POS_OrderTags').empty();
    $('#POS_OrderTags').append(otStuff);
    $('#POS_OrderTagDisplay').show();


    //
    // ORDER TAG SELECTION WARNING for Min Required
    //
    for (var t=0; t<selectedOrderTags.length; t++) {
        var tag = selectedOrderTags[t];
        var sCount = 0;
        sCount = sCount + tag.quantity;
        if (tag.min <= sCount) {
            $('#selectionWarning_'+tag.groupId).empty();
//                        order.selectionRequired = false;
        } else {
            $('#selectionWarning_'+tag.groupId).html('Selection Required! ('+tag.min+')');
//                        order.selectionRequired = true;
        }
    }

    // update Ticket objects
    POS_Ticket.selectedOrder.orderTagGroups = tagGroups;
    POS_Ticket.selectedOrder.selectionRequired = selectionRequired;
    POS_Ticket.terminalTicket.canCloseTicket = selectionRequired ? false : true;

    // update Ticket Orders with selectionRequired result
    for (var o=0; o<POS_Ticket.terminalTicket.orders.length; o++) {
        var thisOrder = POS_Ticket.terminalTicket.orders[o];
        if (thisOrder.uid == orderUid) {
            POS_Ticket.terminalTicket.orders[o].selectionRequired = selectionRequired;
        }
    }
}

/*
function POS_showOrderTagScreen(orderTagGroups, orderTags) {
    var fn = spu.fi(arguments);
    
    // id,name,color,min,max,tags{id,name,color,description,header,price,rate,filter}
    var tagGroups = orderTagGroups;
    var selectedOrderTags = [];
    
    var order = POS_Ticket.selectedOrder;
    var orderUid = order.uid;
    
    orderTags = order.tags;
    
    var isGift = false;
    var isVoid = false;
    
    var oStates = order.states;
    var oStateList = [];
    for (var s=0; s<oStates.length; s++) {
        var oState = oStates[s].state;
        oStateList.push(oState);
        if (oState=='Gift') {
            isGift = true;
        }
        if (oState=='Void') {
            isVoid = true;
        }
    }

    var otHead = '';
    otHead += '<div id="selectedOrderQuantity">' + order.quantity + '</div>';
    otHead += '<div id="selectedOrderName">' + order.name + '<span id="selectedOrderPortion">(' + order.portion + ')</span></div>';
    if (!order.locked) {
        otHead += '<div id="quantityPlus" class="POS_OrderCommands" onclick="POS_ChangeOrderQuantity(\'+\');">+</div>';
        otHead += '<div id="quantityMinus" class="POS_OrderCommands" onclick="POS_ChangeOrderQuantity(\'-\');">-</div>';
        otHead += '<div id="cancelButton" class="POS_OrderCommands" onclick="POS_CancelOrder(\''+POS_Terminal.id+'\',\''+orderUid+'\');">CANCEL Order</div>';
    }
        otHead += '<div id="giftButton" class="POS_OrderCommands" onclick="POS_GiftOrder(\''+orderUid+'\');">'+(!isGift ? 'GIFT' : 'CANCEL<br />Gift')+'</div>';
    if (order.locked) {
        otHead += '<div id="voidButton" class="POS_OrderCommands" onclick="POS_VoidOrder(\''+orderUid+'\');">'+(!isVoid ? 'VOID' : 'CANCEL<br />Void')+'</div>';
        otHead += '<div id="lockedMessage">Order is LOCKED!</div>';
    }
    $('#POS_OrderTagsHeader').html(otHead);
    $('#POS_OrderTagsHeader').append('<div class="closeButtonLarge" title="click to close" onclick="POS_closeOrderTagDisplay();return false;">X</div>');


    var otStuff = '';

    //
    // PORTIONS
    //
    var portions = order.portions; // id,name,price,productId

    if (typeof portions !== 'undefined' && portions.length>1) {

        otStuff += '<div class="orderTagGroupSection">';

        otStuff += '<div id="orderPortions" class="portionGroup">Portion</div>';
        otStuff += '<div class="orderTagButtonSection">';

        for (var p=0; p<portions.length; p++) {
            var portion = portions[p];
            var tagClass = order.portion === portion.name ? ' orderTagButtonSelected' : '';
            if (Number(portion.price)!=0) {
                otStuff += '<div id="opb_'+portion.id+'" portionName="'+portion.name+'" portionPrice="'+portion.price+'" productId="'+portion.productId+'" class="orderTagButton'+tagClass+'" onclick="POS_updateOrderPortion('+portion.id+",'"+portion.name+"'"+')">'+portion.name+'<br />'+portion.price.toFixed(2)+'</div>';
            }
        }

        otStuff += '</div>'; // orderTagButtonSection
        otStuff += '</div>'; // orderTagGroupSection

    }


    var selectionRequired = false;

    //
    // ORDER TAGS
    //
    for (var g=0; g<tagGroups.length; g++) {
        var tagGroup = tagGroups[g];

        if (!tagGroup.hidden) {

            otStuff += '<div class="orderTagGroupSection">';

            otStuff += '<div id="orderTagGroup_'+tagGroup.id+'" class="orderTagGroup">'+tagGroup.name;
            otStuff += '<span class="orderTagMinMaxArea">';
            otStuff += '&nbsp; Min:<div id="min_"'+tagGroup.id+'" val="' + tagGroup.min + '" style="display:inline-block;">' + tagGroup.min + '</div>';
            otStuff += '&nbsp; Max:<div id="max_"'+tagGroup.id+'" val="' + tagGroup.max + '" style="display:inline-block;">' + tagGroup.max + '</div>';
            otStuff += (tagGroup.min>0 ? ' <div id="selectionWarning_'+tagGroup.id+'" class="orderTagSelectionWarning">Selection Required!</div>' : '');
            otStuff += '</span>';
            otStuff += '</div>';


            otStuff += '<div class="orderTagButtonSection">';

            tagGroup.selectedQuantity = 0;

            var groupTags = tagGroup.tags;
            for (var t=0; t<groupTags.length; t++) {
                var tag = groupTags[t];
                var tagClass= '';
                var tagSelected = false;
                for (var tg=0; tg<orderTags.length; tg++) {
                    tag.quantity = 0;

                    if (tag.name==orderTags[tg].tag && tagGroup.name==orderTags[tg].tagName) {
                        tagSelected = true;
                        tag.isSelected = tagSelected;
                        tag.tagName = tagGroup.name;
                        tag.groupId = tagGroup.id;
                        tag.tag = tag.name;
                        tag.quantity = orderTags[tg].quantity;
                        tag.min = tagGroup.min;
                        tag.max = tagGroup.max;
                        tagGroup.selectedQuantity += tag.quantity;
                        // {tagName:"Condiments",tag:"Mustard",price:10,quantity:1,rate:0}
                        var tagJSON = JSON.stringify(tag);
                        selectedOrderTags.push(tag);
                        tagClass = ' orderTagButtonSelected';

                        break;
                    }
                }
                otStuff += '<div id="otb_'+tag.id+'" tagGroupId="'+tagGroup.id+'" tagGroup="'+tagGroup.name+'" tagMin="'+tagGroup.min+'" tagMax="'+tagGroup.max+'" tagQuantity="'+tag.quantity+'" tagName="'+tag.name+'" tagPrice="'+tag.price+'" tagRate="'+tag.rate+'" class="orderTagButton'+tagClass+'" onclick="POS_updateOrderTagSelection('+tag.id+",'"+tagGroup.name+"'"+",'"+tag.name+"'"+')">';
                otStuff += (tag.quantity>1 ? tag.quantity+'x ' : '') + tag.name+'</div>';
            }

            otStuff += '</div>'; // orderTagButtonSection
            otStuff += '</div>'; // orderTagGroupSection

            // check for Min Required Tag selection
            if (tagGroup.selectedQuantity < tagGroup.min) {
                selectionRequired = true;
            }

        }
    }

    //
    // NO ORDER TAGS
    //
    if (tagGroups.length===0) {
        otStuff += '<div class="orderTagsNoneMessage">No Order Tags for this Item.</div>';
    }


    $('#POS_OrderTags').empty();
    $('#POS_OrderTags').append(otStuff);
    $('#POS_OrderTagDisplay').show();


    //
    // ORDER TAG SELECTION WARNING for Min Required
    //
    for (var t=0; t<selectedOrderTags.length; t++) {
        var tag = selectedOrderTags[t];
        var sCount = 0;
        sCount = sCount + tag.quantity;
        if (tag.min <= sCount) {
            $('#selectionWarning_'+tag.groupId).empty();
//                        POS_Ticket.selectedOrder.selectionRequired = false;
        } else {
            $('#selectionWarning_'+tag.groupId).html('Selection Required!');
//                        POS_Ticket.selectedOrder.selectionRequired = true;
        }
    }

    // update Ticket objects
    POS_Ticket.selectedOrder.selectionRequired = selectionRequired;
    POS_Ticket.terminalTicket.canCloseTicket = selectionRequired ? false : true;

    // update Ticket Orders with selectionRequired result
    for (var o=0; o<POS_Ticket.terminalTicket.orders.length; o++) {
        var thisOrder = POS_Ticket.terminalTicket.orders[o];
        if (thisOrder.uid == orderUid) {
            POS_Ticket.terminalTicket.orders[o].selectionRequired = selectionRequired;
        }
    }
}
*/

function POS_toggleOrderTagPrefix(prefixDivId) {
    var isSelected = $('#'+prefixDivId).hasClass('orderTagPrefixSelected');
    var isSelectedAttrib = $('#'+prefixDivId).attr('isSelected');
    var newClass = isSelected ? 'orderTagPrefixButton' : 'orderTagPrefixButton orderTagPrefixSelected';
    $('#'+prefixDivId).attr('class',newClass);
    isSelectedAttrib = isSelected ? '0' : '1';
    $('#'+prefixDivId).attr('isSelected',isSelectedAttrib);
    
    isSelected = !isSelected;
    
    var prefixName = $('#'+prefixDivId).attr('prefixName');
    var prefixGroup = $('#'+prefixDivId).attr('tagGroup');
    
    var tagGroups = POS_Ticket.selectedOrder.orderTagGroups;
    
    for (var g=0; g<tagGroups.length; g++) {
        var tagGroup = tagGroups[g];
        for (var p=0; p<tagGroup.prefixes.length; p++) {
            var pfx = tagGroup.prefixes[p];
            if (tagGroup.name==prefixGroup && pfx.name==prefixName) {
                tagGroups[g].prefixes[p].isSelected = isSelected;
            }
        }
    }
    POS_showOrderTagScreenForOrder(tagGroups);
}

function POS_ChangeOrderQuantity(updown,callback) {
    var fn = spu.fi(arguments);
    
    var oldQuantity = Number(POS_Ticket.selectedOrder.quantity);
    var quantity = oldQuantity;
    if (updown === '-' && quantity > 1) {
        quantity--;
    }
    if (updown === '+') {
        quantity++;
    }
    spu.consoleLog('POS_ChangeOrderQuantity: '+updown);
    POS_Ticket.selectedOrder.quantity = quantity;
    POS_updateSelectedOrder('quantity',POS_Ticket.selectedOrder,'', function u(data){
        spu.consoleLog('Order Quantity changed from ['+oldQuantity+'] to ['+POS_Ticket.selectedOrder.quantity+']');
        $('#selectedOrderQuantity').html(POS_Ticket.selectedOrder.quantity);
        if (callback) {
            callback(data);
        }
    });
}
function POS_GiftOrder(orderUid,callback) {
    var fn = spu.fi(arguments);
    
    var applyGift = $('#giftButton').html().toLowerCase().indexOf('cancel') < 0 ? true : false;
    
    var terminalId = POS_Terminal.id;
    var commandName = applyGift ? 'Gift' : 'Cancel Gift';
    var commandValue = '';
    
    POS_executeAutomationCommand(terminalId,orderUid,commandName,commandValue, function g(tdata){
        var ticket = tdata;

        POS_Ticket.terminalTicket = ticket;
        
        $('#giftButton').html((applyGift ? 'CANCEL<br/>Gift' : 'GIFT'));

        if (applyGift) {
            $('#giftButton').html('CANCEL<br/>Gift');
            $('#voidButton').html('VOID');
            spu.consoleLog('Order Gifted.');
        } else {
            $('#giftButton').html('GIFT');
            spu.consoleLog('Order Gift CANCELED.');
        }
        
    });
}
function POS_VoidOrder(orderUid,callback) {
    var fn = spu.fi(arguments);
    
    var applyVoid= $('#voidButton').html().toLowerCase().indexOf('cancel') < 0 ? true : false;
    
    var terminalId = POS_Terminal.id;
    var commandName = applyVoid ? 'Void' : 'Cancel Void';
    var commandValue = '';
    
    POS_executeAutomationCommand(terminalId,orderUid,commandName,commandValue, function g(tdata){
        var ticket = tdata;

        POS_Ticket.terminalTicket = ticket;

        if (applyVoid) {
            $('#voidButton').html('CANCEL<br/>Void');
            $('#giftButton').html('GIFT');
            spu.consoleLog('Order Void.');
        } else {
            $('#voidButton').html('VOID');
            spu.consoleLog('Order Void CANCELED.');
        }
        
    });
}

function POS_closeOrderTagDisplay(callback) {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('Closing Order Tag Display ...');

    POS_Ticket.selectedOrder = {};
    
//    POS_updateTicketOrder(POS_Ticket.selectedOrder, function uod(orderData){
        POS_updateTicketOrders(POS_Ticket.terminalTicket.orders, true);
        $('#POS_OrderTagDisplay').hide();
//    });
}

function POS_updateOrderPortion(portionId,portionName,callback) {
    var fn = spu.fi(arguments);
    
    if (!POS_Ticket.selectedOrder.locked) {
        var oldPortion = '';
        var portions = POS_Ticket.selectedOrder.portions;
        for (var p=0; p<portions.length; p++) {
            var pId = portions[p].id;
            if ($("#opb_"+pId).hasClass('orderTagButtonSelected') && oldPortion=='') {
                oldPortion = $("#opb_"+pId).attr('portionName');
            }
            $("#opb_"+pId).attr('class', 'orderTagButton');
        }
        $("#opb_"+portionId).attr('class', 'orderTagButton orderTagButtonSelected');
        var portionPrice = $("#opb_"+portionId).attr('portionPrice');
        POS_Ticket.selectedOrder.portion = portionName;
        POS_Ticket.selectedOrder.price = Number(portionPrice);
        POS_updateSelectedOrder('portion',POS_Ticket.selectedOrder,'', function u(data){
            spu.consoleLog('Portion changed from ['+oldPortion+'] to ['+portionName+']');
            $('#selectedOrderPortion').html('('+portionName+')');
            if (callback) {
                callback(data);
            }
        });
    } else {
        spu.consoleLog('POS_updateOrderPortion Cannot change Locked Order!');
    }
}
function POS_updateOrderPortionForOrder(portionId,portionName,callback) {
    var fn = spu.fi(arguments);
    
    if (!POS_Ticket.selectedOrder.locked) {
        var oldPortion = '';
        var portions = POS_Ticket.selectedOrder.portions;
        for (var p=0; p<portions.length; p++) {
            var pId = portions[p].id;
            if ($("#opb_"+pId).hasClass('orderTagButtonSelected') && oldPortion=='') {
                oldPortion = $("#opb_"+pId).attr('portionName');
            }
            $("#opb_"+pId).attr('class', 'orderTagButton');
        }
        $("#opb_"+portionId).attr('class', 'orderTagButton orderTagButtonSelected');
        var portionPrice = $("#opb_"+portionId).attr('portionPrice');
        POS_Ticket.selectedOrder.portion = portionName;
        POS_Ticket.selectedOrder.price = Number(portionPrice);
        POS_updateSelectedOrder('portion',POS_Ticket.selectedOrder,'', function u(data){
            spu.consoleLog('Portion changed from ['+oldPortion+'] to ['+portionName+']');
            $('#selectedOrderPortion').html('('+portionName+')');
            if (callback) {
                callback(data);
            }
        });
    } else {
        spu.consoleLog('POS_updateOrderPortion Cannot change Locked Order!');
    }
}
function POS_updateOrderTagSelection(tagId,tagGroup,tagName,callback) {
    var fn = spu.fi(arguments);
    
    // we can only update Orders that are NOT Locked
    if (!POS_Ticket.selectedOrder.locked) {
        // check if the Order Tag is Selected
        var isTagSelected = $("#otb_"+tagId).hasClass('orderTagButtonSelected');
        var tagClass = isTagSelected ? 'orderTagButton' : 'orderTagButton orderTagButtonSelected';
        spu.consoleLog('POS_updateOrderTagSelection ['+tagGroup+'/'+tagName+'] isSelected (' + isTagSelected + '), switching to ('+!isTagSelected+') using class: ' + tagClass);
        $("#otb_"+tagId).attr('class', tagClass);

        var selectedOrder = POS_Ticket.selectedOrder;
        var terminalId = POS_Terminal.id;
        var orderUid = selectedOrder.orderUid;
        var quantity = selectedOrder.quantity;
        var min = $("#otb_"+tagId).attr('tagMin');
        var max = $("#otb_"+tagId).attr('tagMax');
        var tagQuantity = $("#otb_"+tagId).attr('tagQuantity');
        var portion = selectedOrder.portion;
        var price = selectedOrder.price;
        var priceTag = '';
        var calculatePrice = true;
        var locked = false;
        var increaseInventory = '';
        var decreaseInventory = '';
        var name = '';
        var taxTemplate = '';
        var warehouseName = '';
        var accountTransactionType = '';
        
//        var orderTagList = POS_Ticket.selectedOrder.orderTags.split(',');
        var selectedOrderTags = [];
            selectedOrderTags.push({tagName:tagGroup,tag:tagName});
        var orderTags = selectedOrderTags;


        //
        // perform the update
        // 
        // terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType
        gql.EXEC(gql.updateOrderOfTerminalTicket(terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType), function ug(response){
            if (response.errors) {
                gql.handleError(fn+' gql.updateOrderOfTerminalTicket',response);
            } else {
                var ticket = response.data.terminalTicket;
                ticket.note = POS_Ticket.terminalTicket.note;

                // mutation returns entire Ticket, so we need to iterate through Orders array to find selectedOrder
                for (var o=0; o<ticket.orders.length; o++) {
                    var order = ticket.orders[o];
                    if (order.uid == POS_Ticket.selectedOrder.orderUid) {
                        // we found selected order

                        // get Tag Group selected Tag Quantity
                        var q = 0;
                        for (var t=0; t<order.tags.length; t++) {
                            if (order.tags[t].tagName == tagGroup) {
                                if (order.tags[t].tag == tagName) {
                                    q+=Number(order.tags[t].quantity);
                                }
                            }
                        }
                        // update Min selectionRequired for Tag Group
                        POS_Ticket.selectedOrder.selectionRequired = q >= min ? false : true;
                        ticket.orders[o].selectionRequired = q >= min ? false : true;
                        // save some special Properties
                        var portions = POS_Ticket.selectedOrder.portions;
                        var orderStateList = POS_Ticket.selectedOrder.orderStateList;
                        POS_OrderTagGroups = POS_Ticket.selectedOrder.orderTagGroups;
                        // overwrite selectedOrder object
                        POS_Ticket.selectedOrder = order;
                        var oTags = order.tags.map(function (oTag) {
                            return oTag.tag;
                        });
                        var orderTagList = (oTags ? oTags.join() : '');

                        // restore some special Properties
                        POS_Ticket.selectedOrder.portions = portions;
                        POS_Ticket.selectedOrder.orderStateList = orderStateList;
                        POS_Ticket.selectedOrder.orderTags = orderTagList;
                        POS_Ticket.selectedOrder.orderUid = order.uid;
                        POS_Ticket.selectedOrder.orderTagGroups = POS_OrderTagGroups;
                        
                        // overwrite current Ticket and orders array
                        POS_Ticket.terminalTicket = ticket;
                        orders = ticket.orders;
                        
                        // redisplay Order Tag Screen to show updated Order Tag selections
                        POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function t(oTagGroups){
                            POS_showOrderTagScreenForOrder(oTagGroups);
                        });
                    }
                }
                if (callback) {
                    callback(POS_Ticket.selectedOrder);
                }
            }
        });
    
    } else {
        spu.consoleLog('POS_updateOrderTagSelection Cannot change Locked Order!');
        if (callback) {
            callback(POS_Ticket.selectedOrder);
        }
    }
}
function POS_updateOrderTagSelectionForOrder(orderUid,tagId,tagGroup,tagName,callback) {
    var fn = spu.fi(arguments);
    
    // we can only update Orders that are NOT Locked
    if (!POS_Ticket.selectedOrder.locked) {
//        // check if the Order Tag is Selected
//        var isTagSelected = $("#otb_"+tagId).hasClass('orderTagButtonSelected');
//        var tagClass = isTagSelected ? 'orderTagButton' : 'orderTagButton orderTagButtonSelected';
//        spu.consoleLog('POS_updateOrderTagSelectionForOrder ['+tagGroup+'/'+tagName+'] isSelected (' + isTagSelected + '), switching to ('+!isTagSelected+') using class: ' + tagClass);
        spu.consoleLog('POS_updateOrderTagSelectionForOrder ['+tagGroup+'/'+tagName+'] ...');
//        $("#otb_"+tagId).attr('class', tagClass);

        var selectedOrder = POS_Ticket.selectedOrder;
        var terminalId = POS_Terminal.id;
//        var orderUid = selectedOrder.uid ? selectedOrder.uid : selectedOrder.orderUid;
        var quantity = selectedOrder.quantity;
//        var min = $("#otb_"+tagId).attr('tagMin');
//        var max = $("#otb_"+tagId).attr('tagMax');
//        var tagQuantity = $("#otb_"+tagId).attr('tagQuantity');
        var portion = selectedOrder.portion;
        var price = selectedOrder.price;
        var priceTag = '';
        var calculatePrice = true;
        var locked = false;
        var increaseInventory = '';
        var decreaseInventory = '';
        var name = '';
        var taxTemplate = '';
        var warehouseName = '';
        var accountTransactionType = '';
        
//        var orderTagList = POS_Ticket.selectedOrder.orderTags.split(',');
        var selectedOrderTags = [];
            selectedOrderTags.push({tagName:tagGroup,tag:tagName});
        var orderTags = selectedOrderTags;


        //
        // perform the update
        // 
        // terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType
        gql.EXEC(gql.updateOrderOfTerminalTicket(terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType), function ug(response){
            if (response.errors) {
                gql.handleError(fn+' gql.updateOrderOfTerminalTicket',response);
            } else {
                var ticket = response.data.terminalTicket;
//                ticket.note = POS_Ticket.terminalTicket.note;

                // mutation returns entire Ticket, so we need to iterate through Orders array to find selectedOrder
                for (var o=0; o<ticket.orders.length; o++) {
                    var order = ticket.orders[o];
                    if (order.uid == orderUid) {
                        // we found selected order
                        order.portions = POS_Ticket.selectedOrder.portions;

//                        // get Tag Group selected Tag Quantity
//                        var q = 0;
//                        for (var t=0; t<order.tags.length; t++) {
//                            if (order.tags[t].tagName == tagGroup) {
//                                if (order.tags[t].tag == tagName) {
//                                    q+=Number(order.tags[t].quantity);
//                                }
//                            }
//                        }
//                        // update Min selectionRequired for Tag Group
//                        POS_Ticket.selectedOrder.selectionRequired = q >= min ? false : true;
//                        ticket.orders[o].selectionRequired = q >= min ? false : true;
//                        // save some special Properties
//                        var portions = POS_Ticket.selectedOrder.portions;
//                        var orderStateList = POS_Ticket.selectedOrder.orderStateList;
//                        POS_OrderTagGroups = POS_Ticket.selectedOrder.orderTagGroups;
                        // overwrite selectedOrder object
                        POS_Ticket.selectedOrder = order;
//                        POS_Ticket.selectedOrder.orderUid = orderUid;
//                        var oTags = order.tags.map(function (oTag) {
//                            return oTag.tag;
//                        });
//                        var orderTagList = (oTags ? oTags.join() : '');
//
//                        // restore some special Properties
//                        POS_Ticket.selectedOrder.portions = portions;
//                        POS_Ticket.selectedOrder.orderStateList = orderStateList;
//                        POS_Ticket.selectedOrder.orderTags = orderTagList;
//                        POS_Ticket.selectedOrder.orderUid = order.uid;
//                        POS_Ticket.selectedOrder.orderTagGroups = POS_OrderTagGroups;
                        
                        // overwrite current Ticket and orders array
                        POS_Ticket.terminalTicket = ticket;
                        orders = ticket.orders;
                        
                        // redisplay Order Tag Screen to show updated Order Tag selections
                        POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function t(oTagGroups){
                            POS_showOrderTagScreenForOrder(oTagGroups);
                        });
                    }
                }
                if (callback) {
                    callback(POS_Ticket.selectedOrder);
                }
            }
        });
    
    } else {
        spu.consoleLog('POS_updateOrderTagSelection Cannot change Locked Order!');
        if (callback) {
            callback(POS_Ticket.selectedOrder);
        }
    }
}

function POS_updateSelectedOrder(updateType,selectedOrder,tagGroups, callback) {
    var fn = spu.fi(arguments);
    
    var selectedOrderTags = [];
    var orderTagList = selectedOrder.orderTags;
    
    // loop through Order Tag Groups
    if (updateType=='orderTags' && tagGroups.length > 0) {
        orderTagList = [];
        for (var g=0; g<tagGroups.length; g++) {
            var tagGroup = tagGroups[g];
            // only process non-hidden Tag Groups
            if (!tagGroup.hidden) {
                // loop through Order Tags in the Tag Group
                for (var t=0; t<tagGroup.tags.length; t++) {
                    var tag = tagGroup.tags[t];
                    
                    // check if the Order Tag is Selected
                    var tagSelected = $("#otb_"+tag.id).hasClass('orderTagButtonSelected');
                    
                    // if Order Tag is Selected, update Array of selected Order Tags
                    if (tagSelected) {
                        // {tagName:"Condiments",tag:"Mustard",price:10,quantity:1,rate:0}
                        var selectedTag = {};
                            selectedTag.tagName = tagGroup.name;
                            selectedTag.tag = tag.name;
                            selectedTag.price = tag.price;
                            selectedTag.quantity = $("#otb_"+tag.id).attr("quantity") ? $("#otb_"+tag.id).attr("quantity") : 1;
                            selectedTag.rate = tag.rate;
                        selectedOrderTags.push(selectedTag);
                        orderTagList.push(tag.name);
                    }
                }
            }
        }
    }    

//      terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked
//      ,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType

//    if (!selectedOrder.locked || updateType.indexOf('Gift')>-1 || updateType.indexOf('Void')>-1) {
    if (!selectedOrder.locked) {
        POS_Ticket.selectedOrder.orderTags = orderTagList;
        var terminalId = POS_Terminal.id;
        var orderUid = selectedOrder.uid;
        var quantity = selectedOrder.quantity;
        var portion = selectedOrder.portion;
        var price = selectedOrder.price;
        var priceTag = '';
        var orderTags = selectedOrderTags;//JSON.stringify(selectedOrderTags);
//        var calculatePrice = (updateType==='Gift' || updateType==='Void' ? false : selectedOrder.calculatePrice);
        var calculatePrice = selectedOrder.calculatePrice;
        var locked = selectedOrder.locked;
        var increaseInventory = '';
        var decreaseInventory = '';
        var name = '';
        var taxTemplate = '';
        var warehouseName = '';
        var accountTransactionType = '';
        
        gql.EXEC(gql.updateOrderOfTerminalTicket(terminalId,orderUid,quantity,portion,price,priceTag,orderTags,name,calculatePrice,locked,warehouseName,increaseInventory,decreaseInventory,taxTemplate,accountTransactionType), function u(response){
            if (response.errors) {
                gql.handleError(fn+' '+updateType+ ' gql.updateOrderOfTerminalTicket',response);
            } else {
                var ticket = response.data.terminalTicket;
                ticket.note = POS_Ticket.terminalTicket.note;
                POS_Ticket.terminalTicket = ticket;
                for (var o=0; o<ticket.orders.length; o++) {
                    var order = ticket.orders[o];
                    if (order.uid == orderUid) {
                        order.portions = POS_Ticket.selectedOrder.portions;
//                        var selectionRequired = POS_Ticket.selectedOrder.selectionRequired;
//                        var orderStateList = POS_Ticket.selectedOrder.orderStateList;
//                            orderStateList += (updateType=='Gift' || updateType=='Void'? ','+updateType : '');
//                        if (updateType=='Cancel Gift') {
//                            orderStateList = orderStateList.replace(/,Gift/g,'');
//                        }
//                        if (updateType=='Cancel Void') {
//                            orderStateList = orderStateList.replace(/,Void/g,'');
//                        }
//                        POS_OrderTagGroups = POS_Ticket.selectedOrder.orderTagGroups;
                        POS_Ticket.selectedOrder = order;
//                        var oTags = order.tags.map(function (oTag) {
//                            return oTag.tag;
//                        });
//                        var orderTagList = (oTags ? oTags.join() : '');
//
//                        POS_Ticket.selectedOrder.portions = portions;
//                        POS_Ticket.selectedOrder.selectionRequired = selectionRequired;
//                        POS_Ticket.selectedOrder.orderStateList = orderStateList;
//                        POS_Ticket.selectedOrder.orderTags = orderTagList;
//                        POS_Ticket.selectedOrder.orderUid = order.uid;
//                        POS_Ticket.selectedOrder.orderTagGroups = POS_OrderTagGroups;
//                        POS_showOrderTagScreen(POS_Ticket.selectedOrder.orderTagGroups, orderTagList.split(','));
                        POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function t(oTagGroups){
                            POS_Ticket.selectedOrder.orderTagGroups = oTagGroups;
                            POS_showOrderTagScreenForOrder(oTagGroups);
                        });
                    }
                }
                if (callback) {
                    callback(POS_Ticket.selectedOrder);
                }
            }
        });

    } else {

        if (selectedOrder.locked) {
            spu.consoleLog('Order is Locked, cannot update Order!');
        }
        if (callback) {
            callback(POS_Ticket.selectedOrder);
        }

    }
        
}

function POS_CancelOrder(terminalId,orderUid,refreshOrders, callback) {
    var fn = spu.fi(arguments);
    
    $('#POS_OrderTagDisplay').hide();

    var orderUids = [];
    var ou = orderUid.split(',');
    for (var u=0; u<ou.length; u++) {
        orderUids.push(ou[u].replace(/'/g,''));
    }
    refreshOrders = typeof refreshOrders==='undefined' || refreshOrders==='' ? true : refreshOrders;
    
    terminalId =  POS_Terminal.id;

    if (orderUids.length>0 && orderUids[0]!='') {
        spu.consoleLog('POS_CancelOrder cancelOrderOnTerminalTicket UID ['+orderUid+'] (refreshOrders='+refreshOrders+') ...');

        gql.EXEC(gql.cancelOrderOnTerminalTicket(terminalId,orderUids),function c(response){
            var ticket = response.data['m'+(ou.length-1)];
            if (refreshOrders) {
                POS_Ticket = {};
                POS_Ticket.terminalTicket = ticket;
                spu.consoleLog('POS_CancelOrder refreshing Orders: '+ticket.orders.length);
                POS_updateTicketOrders(ticket.orders, true);
            }
            if (callback) {
                callback(ticket);
            }
        });
        
    } else {
        spu.consoleLog('POS_CancelOrder No Orders to Cancel!');
        if (callback) {
            callback(POS_Ticket.terminalTicket);
        }
    }
}
function POS_clearOrders() {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('Clearing non-submitted Orders ...');
    
    var updateOrders = false;
    var clearOrderList = [];
    var uids = '';
    
    if (POS_Ticket.terminalTicket && POS_Ticket.terminalTicket.orders.length>0) {

        var orderList = POS_Ticket.terminalTicket.orders;
        var oldOrders = 0;
        var newOrders = 0;
        var ttlOrders = Number(orderList.length);

        for (var o=0; o<orderList.length; o++) {
            if (orderList[o].locked) {
                oldOrders++;
            } else {
                newOrders++;
                clearOrderList.push(orderList[o]);
                uids += "'"+orderList[o].uid+"',";
            }
        }
        uids = uids.substr(0,(uids.length-1)); // trim trailing comma
        
        updateOrders = clearOrderList.length>0 ? true : false;
        
        spu.consoleLog('POS_clearOrders: '+clearOrderList.length);
        
        POS_CancelOrder(POS_Terminal.id,uids,updateOrders, function t(data){
            ttlOrders = (data.orders ? data.orders.length : 0);
            spu.consoleLog('POS_clearOrders ticketOrderCount: '+ttlOrders);
            if (ttlOrders===0 && data.entities.length===0) {
                POS_processCommand('Close_Ticket');
            }
        });
        
        spu.consoleLog('Clearing Orders completed.');
    
    } else {
        spu.consoleLog('No Orders to Clear!');
    }
}

//function POS_updateEntityColor(entityType,entityName){
//    var fn = spu.fi(arguments);
//    
//    if(!entityName) return;
//    gql.EXEC(gql.updateEntityState(entityType,entityName,'Status','New Orders'), function(response) {
//        if (response.errors) {
//            gql.handleError(fn+' gql.updateEntityState',response);
//        } else {
//            if (document.getElementById(entityType+'_'+entityName)) {
//                var ent = document.getElementById(entityType+'_'+entityName);
//                ent.style.backgroundColor = 'Orange';
//            }
//        }
//    });
//}


function POS_loadTerminalTicket(terminalId,ticketId) {
    var fn = spu.fi(arguments);
    
    note = typeof note!=='undefined' ? note : '';
    $('#POS_Orders').html('<div class="info-message">Fetching Ticket Orders, please Wait...<br /><br />'+busyWheel+'</div>');
    POS_switchTicketAreaContent('Orders');
    gql.EXEC(gql.loadTerminalTicket(terminalId,ticketId), function t(response){
        if (response.errors) {
            gql.handleError(fn+' gql.loadTerminalTicket',response);
        } else {
            var ticket = response.data.terminalTicket;
            POS_Ticket.terminalTicket = ticket;
            POS_Ticket.terminalTicket.locked = true;
//            POS_Ticket.terminalTicket.note = note;
//            $('#POS_TicketArea').empty();
//            $('#POS_TicketArea').append('<div id="POS_Orders"></div>');
            POS_updateTicketOrders(ticket.orders, true);
            $('#POS_EntitySelectors').html(POS_getEntitySelectors(ticket.entities));
            POS_fillEntityGrids();
//            $('#POS_EntityGrids').empty();
//            for (var e=0; e<POS_EntityTypes.length; e++) {
//                POS_fillEntityGrid(POS_EntityTypes[e],'', function ltt(data){
//                    for (var te=0; te<POS_Ticket.terminalTicket.entities.length; te++) {
//                        var eType = POS_Ticket.terminalTicket.entities[te].type;
//                        var eName = POS_Ticket.terminalTicket.entities[te].name;
//
//                        if (document.getElementById(eType.replace(/ /g,'_')+'_'+eName.replace(/ /g,'_'))) {
//                            document.getElementById(eType.replace(/ /g,'_')+'_'+eName.replace(/ /g,'_')).style.borderColor = '#FF0066';
//                        }
//                    }
//                });
//            }
        }
    });
}

function POS_closeTerminalTicket(terminalId) {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('TERMINAL closeTerminalTicket ...');
    
    if (POS_Ticket.terminalTicket) {
        $('#POS_Orders').html('<div class="info-message">Closing Ticket, please Wait...<br /><br />'+busyWheel+'</div>');
        gql.EXEC(gql.closeTerminalTicket(terminalId), function c(response){
            if (response.errors) {
                gql.handleError(fn+' gql.closeTerminalTicket',response);
            } else {

                var ticketId = POS_Ticket.terminalTicket.id;
                POS_clearTerminalTicketData();
                refreshTicket(ticketId);
            }

        });
    } else {
        POS_clearTerminalTicketData();
    }
}

function POS_clearTerminalTicketData() {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('POS_clearTerminalTicketData sendKDmessage: '+POS_SendKDUpdateMessage);
    if (POS_SendKDUpdateMessage) {
        POS_SendKDUpdateMessage = false;
        var productType = 'Food';
        var msg = '{"eventName":"TASK_PRINTED","terminal":"'+POS_Terminal.name+'","userName":"'+currentUser+'","productType":"'+productType+'"}';
        broadcastMessage(msg);
    }
    
//    for (var e=0; e<POS_EntityTypes.length; e++) {
//        var et = POS_EntityTypes[e];
//        var ets = et.substr(0,POS_EntityTypes[e].length-1);
//        POS_Ticket[ets] = '';
//    }
    POS_Ticket = {};
    //POS_refreshPOSDisplay(false);
    $('#POS_TicketInfo').attr('onClick','');
    $('#POS_TicketInfoLabel').empty();
    $('#POS_TicketTotalValue').html('0.00');
    POS_refreshTicketList();
    POS_fillEntityGrids();

}

function refreshTicket(ticketId, callback){
    var fn = spu.fi(arguments);
    
    gql.EXEC(gql.postTicketRefreshMessage(ticketId), function (response){
        if (callback) {
            callback(response.data);
        }
    });
}

function POS_updateTicketOrder(ticketOrder, callback) {
    var fn = spu.fi(arguments);
    
    if (ticketOrder) {
        spu.consoleLog('POS_updateTicketOrder ('+ticketOrder.name+') ...');

        var orderUid = ticketOrder.uid;

        ticketOrder.requiredSelectionCount = 0;

        ticketOrder.selectionRequired = false;
        
        POS_updateOrderStateList(ticketOrder);

        if (!ticketOrder.locked) {
            POS_getOrderTagGroupsForOrder(POS_Terminal.id,orderUid, function co(oTagGroups){
                ticketOrder.requiredSelectionCount = oTagGroups.requiredSelectionCount;
                ticketOrder.selectionRequired = oTagGroups.requiredSelectionCount > 0 ? true : false;
                if (POS_Ticket.selectedOrder && POS_Ticket.selectedOrder.uid == orderUid) {
//                    POS_Ticket.selectedOrder = ticketOrder;
                }
                if (callback) {
                    callback(ticketOrder);
                }
            });
        } else {
            if (POS_Ticket.selectedOrder && POS_Ticket.selectedOrder.uid == orderUid) {
//                POS_Ticket.selectedOrder = ticketOrder;
            }
            if (callback) {
                callback(ticketOrder);
            }
        }
    
    } else {
        if (callback) {
            callback(false);
        }
    }
}
function POS_updateTicketOrders(ticketOrders, showTicketOrders, callback){
    var fn = spu.fi(arguments);
    
    var orderCount = ticketOrders.length;
    
    showTicketOrders = typeof showTicketOrders==='undefined' || showTicketOrders==='' ? true : showTicketOrders;
    
    spu.consoleLog('POS_updateTicketOrders (showTicketOrders='+showTicketOrders+'): '+orderCount+' ...');
    
    var ordersUpdated = [];

    if (orderCount>0) {
        
        POS_SendKDUpdateMessage = false;
        
        for (var i=0; i<orderCount; i++) {
            var order = ticketOrders[i];

            POS_updateTicketOrder(order, function updatedOrder(orderData){
                if (orderData) {
                    ordersUpdated.push(orderData);
                }
                if (ordersUpdated.length===orderCount) {
                    spu.consoleLog(ordersUpdated.length+'/'+orderCount);
                    POS_Ticket.terminalTicket.orders = ordersUpdated;
                    if (showTicketOrders && ordersUpdated.length===orderCount) {
                        POS_showTicketOrders(ordersUpdated);
                    }
                }
            });
        }

    } else {
        if (showTicketOrders) {
            POS_showTicketOrders([]);
        }
    }
}
function POS_showTicketOrders(ticketOrders, callback){
    var fn = spu.fi(arguments);
    
    spu.consoleLog('POS_showTicketOrders ('+ticketOrders.length+') ...');
    
    var ttl=0;
    
//    orders = ticketData ? ticketData.orders : orders;

//    POS_Ticket.terminalTicket.orders = ticketOrders;
    
    var newOrders = 0;
    
    var canCloseTicket = (typeof POS_Ticket.terminalTicket.canCloseTicket === 'undefined' ? true : POS_Ticket.terminalTicket.canCloseTicket);
    
    
    var stuff = '';
            
    for (var o=0; o<ticketOrders.length; o++) {
        var order = ticketOrders[o];
        canCloseTicket = order.selectionRequired ? false : canCloseTicket;
        var orderId = order.id;
        var orderUid = order.uid;
        var price = Number(order.price);
        var quantity = order.quantity;
        var portion = order.portion;
        var miName = order.name;
        var productName = order.name;
        var productId = order.productId;
        var locked = order.locked;
        var calculatePrice = order.calculatePrice;
        var orderLineTotal = order.quantity * price;
        
        var oTags = order.tags ? order.tags : [];
        var orderTags = '';
        for (var t=0; t<oTags.length; t++) {
            var oTag = oTags[t];
            orderLineTotal = orderLineTotal + (quantity * oTag.quantity * oTag.price);
            orderTags += oTag.tag + (t<oTags.length-1 ? ',' : '');
        }

        var oStates = order.states;
        var oStateList = [];
        for (var s=0; s<oStates.length; s++) {
            var oState = oStates[s].state;
            oStateList.push(oState);
            if (oState=='Gift' || oState=='Void') {
                ttl += (orderLineTotal * -1);
            }
        }
        
        stuff += '<div id="o_'+order.uid+'" class="orderContainer" orderId="'+order.id+'" orderUid="'+order.uid+'" name="'+order.name+'"';
        stuff += ' product="'+order.name+'" productId="'+order.productId+'" portion="'+order.portion+'" quantity="'+order.quantity+'"';
        stuff += ' price="'+price+'" orderLineTotal="'+orderLineTotal+'"';
        stuff += ' locked="'+locked+'"';
        stuff += ' calculatePrice="'+calculatePrice+'"';
//        stuff += ' orderStateList="'+oStateList+'"';
        stuff += ' orderTags="'+orderTags+'"';
        stuff += ' isSelected="'+order.isSelected+'"';
        stuff += ' onClick="POS_orderLineClicked('+"'"+order.uid+"'"+');">';
            stuff += '<div class="orderLine">';
            stuff +=     '<div class="orderQuantity">'+order.quantity+'</div>';
            stuff +=     '<div class="orderName">';
            stuff += locked ? '<span class="orderNameLocked">' : '';
            stuff += (order.selectionRequired ? '<span class="orderNameSelectionRequired">' : '');
            stuff += order.name;
            stuff += (order.selectionRequired ? '</span>' : '');
            stuff += locked ? '</span>' : '';
            stuff += '<span class="orderPortion">&nbsp; ('+order.portion+')</span>';
            stuff += '</div>';
            stuff +=     '<div class="orderPrice">'+price.toFixed(2)+'</div>';
            stuff +=     '<div class="orderLineTotal'+(!calculatePrice ? ' orderLineTotalNoCalculatePrice' : '')+'">'+orderLineTotal.toFixed(2)+'</div>';
            stuff += '</div>';

            stuff += '<div class="orderState">';
                var os = '';
                for (var s=0; s<oStates.length; s++) {
                    //os += oStates[s]["stateName"]+':'+oStates[s]["state"];
                    var someState = oStates[s].state;
                        someState = someState.replace(/Gift/g,'<span class="orderStateGift">GIFT</span>');
                        someState = someState.replace(/Void/g,'<span class="orderStateVoid">VOID</span>');
                    os += someState;
                    os += (s<(oStates.length-1) ? ',' : '');
                }
                stuff += os;
            stuff += '</div>';

            //stuff += '<div class="orderTagLine">';
                var ot = '';
                for (var t=0; t<oTags.length; t++) {
                    var tagColorClass = 'orderTagColorFree';
                    tagColorClass = (Number(oTags[t].price)<0 ? 'orderTagColorLess' : tagColorClass);
                    tagColorClass = (Number(oTags[t].price)>0 ? 'orderTagColorMore' : tagColorClass);
                    ot += '<div class="orderTagLine '+tagColorClass+'">';
                    ot += '<div class="orderTagQuantity">' + (oTags[t].quantity > 1 ? oTags[t].quantity + 'x ' : '') + '</div>';
                    ot += '<div class="orderTagName">' + oTags[t].tag + '</div>';
                    ot += '<div class="orderTagPrice">' + (Number(oTags[t].price)!=0 ? oTags[t].price.toFixed(2) : '') + '</div>';
                    ot += '<div class="orderTagPriceTotal">' + (Number(oTags[t].price)!=0 ? (quantity * oTags[t].quantity * oTags[t].price).toFixed(2) : '') + '</div>';
//                    ot += (t<(oTags.length-1) ? '<br />' : '');
                    ot += '</div>';
                }
                stuff += ot;
//            stuff += '</div>';

        stuff += '</div>';
        
        ttl += Number(orderLineTotal);
        
        newOrders = newOrders + (locked ? 0 : 1);
    }
    
    $('#POS_Orders').html(stuff);
    
    if (ticketOrders.length==0) {
        $('#POS_Orders').html('No Orders!');
    }
    
    POS_switchTicketAreaContent('Orders');
    jumpBottom('#POS_TicketArea');
//    jumpBottom('#POS_Orders');
    
    ttl = ttl.toFixed(2);
    $('#POS_TicketTotalValue').html(ttl);
    
    $('#POS_TicketInfo').attr('onClick','POS_updateTicketNote('+POS_Ticket.terminalTicket.id+');');
    var label  = '<span style="color:#FFBB00;font-size:larger;">';
        label += (POS_Ticket.terminalTicket.number ? '#' + POS_Ticket.terminalTicket.number : 'New Ticket');
        label += '</span>';
        label += ' Orders:' + ticketOrders.length;
        label += ' <span style="font-size:smaller;">(New:' + newOrders + ')</span>';
        //label += (POS_Ticket.terminalTicket.note ? '<div class="POS_TL_Note"><span class="POS_TL_EntityType">NOTE:</span> <div id="TicketNote">'+(POS_Ticket.terminalTicket.note ? POS_Ticket.terminalTicket.note.replace(/\r\n/g,' ')+'</div>' : ' ') : '</div>');
        label += '<div id="TicketNote" class="POS_TL_Note">'+(POS_Ticket.terminalTicket.note ? POS_Ticket.terminalTicket.note.replace(/\r\n/g,' ') : ' ') + '</div>';
    $('#POS_TicketInfoLabel').html(label);
    
//    var portions = [];
    
//    POS_Ticket.selectedOrder = {orderId:orderId,orderUid:orderUid,quantity:quantity,price:price,name:miName,productName:productName,productId:productId,portion:portion,locked:locked,calculatePrice:calculatePrice,orderTags:orderTags,tags:oTags,orderStateList:oStateList,portions:portions};
    
    POS_Ticket.terminalTicket.canCloseTicket = canCloseTicket;
    
    if (callback) {
        gql.EXEC(gql.getProductPortions(productName,productId), function p(response){
            var portions = response.data.portions;
//            POS_Ticket.selectedOrder = {orderId:orderId,orderUid:orderUid,quantity:quantity,price:price,name:miName,productName:productName,productId:productId,portion:portion,locked:locked,calculatePrice:calculatePrice,orderTags:orderTags,tags:oTags,orderStateList:oStateList,portions:portions};
            POS_Ticket.selectedOrder.portions = portions;
            callback(POS_Ticket.selectedOrder);
        });
    }
}

function POS_updateSelectedTicketIdList(ticketId) {
    var fn = spu.fi(arguments);
    
    var isSelected = $('#ticketId_'+ticketId).attr('isSelected');
    isSelected = isSelected=='1' ? '0' : '1';
    $('#ticketId_'+ticketId).attr('isSelected',isSelected);
    
    POS_SelectedTicketIds = [];
    
    for (var t=0; t<POS_Terminal.tickets.length; t++) {
        if (document.getElementById('ticketId_'+POS_Terminal.tickets[t].id)) {
            var isSelected = $('#ticketId_'+POS_Terminal.tickets[t].id).attr('isSelected');
            if (isSelected=='1') {
                $('#ticketId_'+POS_Terminal.tickets[t].id).attr('class','POS_TL_Ident POS_TL_IsSelected');
                POS_SelectedTicketIds.push(POS_Terminal.tickets[t].id);
            } else {
                $('#ticketId_'+POS_Terminal.tickets[t].id).attr('class','POS_TL_Ident');
            }
        }
    }
    
    spu.consoleLog('POS_updateSelectedTicketIdList: '+POS_SelectedTicketIds);
    
    if (POS_SelectedTicketIds.length>1) {
        var stuff = '';

//        stuff += '<div id="POS_TL_TicketListCommand" class="POS_TL_Summary POS_TL_MergeTicketsSummary" onclick="POS_processCommand(\'Merge_Tickets\');">';
        stuff += '<div class="POS_TL_MergeTicketsSummary_Caption">Merge Selected Tickets</div>';
        stuff += '<br/>';
            // row 2
            stuff += '<div style="display:flex;width:100%;">';
            stuff += '<div class="POS_TL_Entities">';
                stuff += '<div class="POS_TL_Entity">';
                stuff += '<div class="POS_TL_EntityType">Ticket Ids:</div>';
                stuff += '<div class="POS_TL_EntityName">'+POS_SelectedTicketIds+'</div>';
            stuff += '</div>';

            stuff += '</div>';
            // row 2 end
//        stuff += '</div>';
        // container end

        $('#POS_TL_TicketListCommand').html(stuff);
        $('#POS_TL_TicketListCommand').attr('class','POS_TL_Summary POS_TL_MergeTicketsSummary');
        $('#POS_TL_TicketListCommand').attr('onClick','POS_processCommand(\'Merge_Tickets\')');
        $('#POS_TL_TicketListCommand').show();
        
    } else {
        $('#POS_TL_TicketListCommand').hide();
    }
}
function POS_mergeTickets(ticketIds) {
    var fn = spu.fi(arguments);
    
    var terminal = POS_Terminal.name;
    var department = departmentName;
    var ticketType = ticketTypeName;
    var user = currentUser;
    
    $('#POS_TicketList').html('<div class="info-message">Merging Tickets, please Wait...<br /><br />'+busyWheel+'</div>');
    
    gql.EXEC(gql.mergeTickets(terminal,department,ticketType,user,ticketIds), function lt(response){
        if (response.errors) {
//            gql.handleError(fn + ' gql.mergeTickets', response);
            // Error trying to resolve mergeTickets. Can't merge tickets Entities doesn't match
            if (response.errors[0].InnerException.Message.indexOf("Can't merge tickets")>-1) {
                $('#errorMessage').hide();
                showWarningMessage('<b>Merge Tickets FAILED!<br/><br/><br/>'+response.errors[0].InnerException.Message);
                POS_fillEntityGrids();
                POS_refreshTicketList();
            } else {
                gql.handleError(fn + ' gql.mergeTickets', response);
            }
            
        } else {
            var ticketId = response.data.ticketId;
            var msg = '{"eventName":"TICKETS_MERGED","ticketIds":"'+ticketIds+'","ticketId":"'+ticketId+'","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
            broadcastMessage(msg);
        }
    });
    
    
//    var terminalId = POS_Terminal.id;
//    var orderUid = '';
//    var commandName = 'HUB Merge Tickets';
//    var commandValue = ticketIds;
//    var ticketId = ticketIds[0];
//    
//    //    gql.EXEC(gql.loadTerminalTicket(terminalId,ticketId), function lt(response){
//        gql.EXEC(gql.executeAutomationCommandForTerminalTicket(terminalId,orderUid,commandName,commandValue), function m(response){
////            gql.EXEC(gql.closeTerminalTicket(terminalId), function c(response){
//                var msg = '{"eventName":"TICKETS_MERGED","ticketIds":"'+ticketIds+'","terminal":"'+currentTerminal+'","userName":"'+currentUser+'","sid":"'+sessionId+'"}';
//                broadcastMessage(msg);
////                POS_refreshTicketList();
////            });
//        });
//    });
}

function POS_showEntityGrid(entityType) {
    var fn = spu.fi(arguments);
    spu.consoleLog('Showing Entity Grid: '+entityType);
    $('#'+entityType).show();
}

function POS_amcButtonsGet(callback) {
    var fn = spu.fi(arguments);
    
    getReportVars('GQLM Automation Commands',function amc(data){
        var amcButtons = data;
        
        var btnArrayTicket = [];
        var btnArrayOrder = [];
        var btnArrayRow1 = [];
        var btnArrayRow2 = [];
        
        // loop through Rows for Automation Command Buttons
        for (var b=0; b<amcButtons.length; b++) {
            // if the Button has no Header, skip it
            if (amcButtons[b]["buttonHeader"]) {
                var amcButton    = amcButtons[b];
                var buttonID     = amcButton["name"].replace(/ /g, "_");
                var buttonName   = amcButton["name"];
                var buttonHeader = amcButton["buttonHeader"];
                var buttonHeader = buttonHeader.replace(/\\r/g,"<br />");
                var buttonColors = colorHexToDec(amcButton["color"]);
                var btnBGcolor   = buttonColors["bgColor"];
                var btnTextColor = buttonColors["txtColor"];

                // build JS Button Object
                var btnProps = {};
                btnProps.buttonID = buttonID;
                btnProps.buttonName = buttonName;
                btnProps.btnBGcolor = btnBGcolor;
                btnProps.btnTextColor = btnTextColor;
                btnProps.buttonHeader = buttonHeader;

                // add JS Button Object to applicable JS Array
                if (amcButtons[b]["displayOnTicket"]=='True') {
                    btnArrayTicket.push(btnProps);
                }
                if (amcButtons[b]["displayOnOrders"]=='True') {
                    btnArrayOrder.push(btnProps);
                }
                if (amcButtons[b]["displayUnderTicket"]=='True') {
                    btnArrayRow1.push(btnProps);
                }
                if (amcButtons[b]["displayUnderTicket2"]=='True') {
                    btnArrayRow2.push(btnProps);
                }
            }
        }
        // set main JS Arrays
        amcBtns_ticketCommands = btnArrayTicket;
        amcBtns_orderCommands = btnArrayOrder;
        amcBtns_ticketRow1 = btnArrayRow1;
        amcBtns_ticketRow2 = btnArrayRow2;
        
        if (callback) {
            callback(amcButtons);
        }
    });
}

function POS_amcButtonsRender(mapping) {
    var fn = spu.fi(arguments);
    
    switch (mapping) {
        case 'ticketCommands':
            var amcButtons = amcBtns_ticketCommands;
            break;
        case 'orderCommands':
            var amcButtons = amcBtns_orderCommands;
            break;
        case 'ticketRow1':
            var amcButtons = amcBtns_ticketRow1;
            break;
        case 'ticketRow2':
            var amcButtons = amcBtns_ticketRow2;
            break;
        default:
            break;
    }
    
    spu.consoleLog('Rendering POS_amcButtons ('+mapping+'): '+amcButtons.length);

    $('#'+mapping).empty();
    for (var b=0; b<amcButtons.length; b++) {
        var btn = amcButtons[b];
        var btnStuff = '<div id="amc_'+btn["buttonID"]+'" name="'+btn["buttonName"]+'" class="buttonMain" onclick="POS_processCommand(\''+btn["buttonID"]+'\');" style="background-color:'+btn["btnBGcolor"]+';color:'+btn["btnTextColor"]+'">'+btn["buttonHeader"]+'</div>';
        $('#'+mapping).append(btnStuff);
    }
}

function POS_processCommand(cmd) {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('Processing POS Command: '+cmd);
    switch(cmd) {
        case 'Close_Ticket':
            if (POS_Ticket.terminalTicket) {
                var canClose = typeof POS_Ticket.terminalTicket.canCloseTicket==='undefined' ? true : POS_Ticket.terminalTicket.canCloseTicket;
                if (canClose) {
                    $('#POS_Orders').empty();
                    POS_closeTerminalTicket(POS_Terminal.id);
                } else {
                    showWarningMessage('<b>Cannot close Ticket!</b><br /><br />Check for highlighted Orders which require Order Tag selection.');
                }
            } else {
                // no open Ticket, display Terminal Ticket List
                $('#POS_TicketInfo').attr('onClick','');
                $('#POS_TicketInfoLabel').empty();
                $('#POS_TicketTotalValue').html('0.00');
                POS_refreshTicketList();
                POS_fillEntityGrids();
            }
            break;
        case 'Merge_Tickets':
            POS_mergeTickets(POS_SelectedTicketIds);
            break;
        case 'NV_Main_Menu':
            navigateTo('module','main_menu','main_menu');
            break;
        default:
            spu.consoleLog('Unhandled POS Command: '+cmd);
    }
}





function POS_getTerminalTickets(terminalId,callback) {
    var fn = spu.fi(arguments);
    terminalId = terminalId ? terminalId : clientSetting('terminalId');
    var terminalName = clientSetting('terminalName');
    spu.consoleLog('TERMINAL Fetching Tickets ['+terminalId+'] ('+terminalName+') ...');

    isTerminalExists(terminalId,function e(data){
        var exists = data.exists;
        
        if (exists) {
            gql.EXEC(gql.getTerminalTickets(terminalId), function t(response){
                if (response.errors) {
                    gql.handleError(fn+' gql.getTerminalTickets',response);
                } else {
                    var tickets = response.data.terminalTickets;
                    if (tickets.length>0) {
                        POS_Terminal.tickets = tickets;
                        spu.consoleLog('TERMINAL fetched Tickets: '+tickets.length);
                    } else {
                        POS_Terminal.tickets = [];
                        spu.consoleLog('TERMINAL fetched Tickets: '+tickets.length);
                    }
                    if (callback) {
                        callback(tickets);
                    }
                }    
            });
        } else {
            spu.consoleLog('TERMINAL fetch Tickets FAILED, terminal not registered: '+terminalId);
            if (callback) {
                callback(false);
            }
        }
    });
}

function POS_refreshPOSDisplay(fetchMenu, callback) {
    var fn = spu.fi(arguments);
    // this directivedetermines if a GQL call is made to reload the Menu
    fetchMenu = fetchMenu !=='' ? fetchMenu : false;
    spu.consoleLog('POS_refreshPOSDisplay (fetchMenu:'+fetchMenu+') ...');
    
    // fill Entity Grids
    POS_fillEntityGrids();

    
    // if Terminal has an open Ticket, then display it
    // otherwise, show Terminal TicketList

    POS_renderMenu(fetchMenu, function m(data){
        var menu = data;
        $('#POS_MenuDisplay').html(menu);
        POS_categoryClicked(POS_Menu.selectedCategoryId,false);

        if (POS_Ticket.terminalTicket) {
            // open Ticket on Terminal, display the Ticket
            spu.consoleLog('TERMINAL getTerminalTicket ...');
            $('#POS_Orders').html('<div class="info-message">Fetching Ticket Orders, please Wait...<br /><br />'+busyWheel+'</div>');
            POS_switchTicketAreaContent('Orders');
//            gql.EXEC(gql.getTerminalTicket(POS_Terminal.id), function tt(response){
//                if (response.errors) {
//                    gql.handleError(fn+' gql.getTerminalTicket',response);
//                } else {
//                    var ticket = response.data.terminalTicket;
//                    if (ticket != null) {
//                        POS_updateTicketOrders(ticket.orders, true);
//                        $('#POS_EntitySelectors').html(POS_getEntitySelectors(ticket.entities));
//                    } else {
//                        $('#POS_Orders').html('No Orders!');
//                    }
//                }
//
//            });
            POS_getTerminalTicket(POS_Terminal.id);

        } else {

            // no open Ticket, display Terminal Ticket List
            POS_refreshTicketList();

        }

        if (callback) {
            callback();
        }
        
    });
}

function POS_switchTicketAreaContent(contentType) {
    POS_TicketAreaContent = contentType;
    var divId = 'POS_' + contentType;
    var content = [];
        content.push('POS_TicketList');
        content.push('POS_Orders');
        content.push('POS_EntityTicketList');
    for (var c=0; c<content.length; c++) {
        $('#'+content[c]).hide();
    }
    $('#'+divId).show();
}
function POS_refreshTicketList(ticketId) {
    var fn = spu.fi(arguments);
    var tid = typeof ticketId !== 'undefined' ? ticketId : 0;
    var fetchTickets = tid==0 ? true : false;

    POS_SendKDUpdateMessage = false;
    
    var timeOffset = getClientGMToffset().split(':');
    var offsetHours = Number(timeOffset[0]);
        offsetHours = offsetHours + Number(timeOffset[1])/60;

    if (tid!=0 && POS_Terminal.tickets) {
        fetchTickets = false;
        for (var t=0; t<POS_Terminal.tickets.length; t++) {
            if (tid == POS_Terminal.tickets[t].id) {
                fetchTickets = true;
                break;
            }
        }
    }
    
    fetchTickets = true; // override for now
    
    if (fetchTickets) {
        spu.consoleLog('TERMINAL Fetching TicketList ...');
        $('#POS_TicketList').html('<div class="info-message">Fetching Terminal Tickets, please Wait...<br /><br />'+busyWheel+'</div>');
        POS_switchTicketAreaContent('TicketList');
        POS_getTerminalTickets(POS_Terminal.id, function t(response){
            if (response.errors) {
                gql.handleError(fn+' gql.getTerminalTickets',response);
            } else {
                var tickets = response;
                POS_Terminal.tickets = tickets;
                spu.consoleLog('TERMINAL Tickets: '+tickets.length);

                if (tickets && tickets.length>0) {
                    for (var t=0; t<tickets.length; t++) {
                        // GQL getTasks returns start/end dates with the client TZ-offset already applied, 
                        // not the actual dates as found in the DB, so we need to backout the offset
                        var beg = tickets[t].date.replace(/Z/g,'');
                        var end = tickets[t].lastOrderDate.replace(/Z/g,'');

                        beg = moment(beg, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');
                        end = moment(end, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');

                        tickets[t].date = beg;
                        tickets[t].lastOrderDate = end;
                    }
                    POS_Terminal.tickets = tickets;
                    POS_renderTicketList(POS_Terminal.tickets,false, function t(data){
                        var ticketList = data;
                        $('#POS_TicketList').html(ticketList);
                    });
                } else {
                    $('#POS_TicketList').html('No Tickets!');
                }
            }
        });
    } else {
        spu.consoleLog('TERMINAL Fetch TicketList aborted, ticketId ('+ticketId+') does not belong to this Terminal.');
    }
}
function POS_renderTicketList(tickets,newTicketButton, callback) {
    newTicketButton = typeof newTicketButton==='undefined' ? false : newTicketButton;
    
    spu.consoleLog('TERMINAL Rendering TicketList (newTicketButton='+newTicketButton+') ...');
    
    var stuff = '';
    
//    if (newTicketButton) { // unless false, this will contain a list of chosen Entities
        var tEntities = newTicketButton;
        stuff += '<div id="POS_TL_TicketListCommand" class="POS_TL_Summary'+(newTicketButton ? ' POS_TL_CreateNewTicketSummary' : '')+'"'+(!newTicketButton ? ' style="display:none;"' : '')+' onclick="POS_createTerminalTicket();">';
        stuff += '<div class="POS_TL_CreateNewTicketSummary_Caption">Create a NEW Ticket with these Entities:</div>';
        stuff += '<br/>';
        for (var te=0; te<tEntities.length; te++) {
            // row 2
            stuff += '<div style="display:flex;width:100%;">';
            stuff += '<div class="POS_TL_Entities">';
                for (var e=0; e<tEntities.length; e++) {
                        for (var te=0; te<POS_EntityTypes.length; te++) {
                    if (tEntities[e].type.replace(/ /g,'_') == POS_EntityTypes[te]) {
                stuff += '<div class="POS_TL_Entity">';
                stuff += '<div class="POS_TL_EntityType">'+POS_EntityTypes[te].substr(0,POS_EntityTypes[te].length-1).replace(/_/g,' ')+':</div>';

                        stuff += '<div class="POS_TL_EntityName">'+tEntities[e].name+'</div>';
                    }
                }
                stuff += '</div>';
            }
            stuff += '</div>';

            stuff += '</div>';
            // row 2 end
        }
        stuff += '</div>';
        // container end
//    }
    
    stuff += tickets.length>0 ? '' : 'No Tickets!';
    
//    for (var t=0; t<tickets.length; t++) { // show oldest Tickets first, newest last
    for (var t=tickets.length-1; t>-1; t--) { // show newest Tickets first, oldest last

        var ticket = tickets[t];
        
        // container
        var tNote = ticket.note !== null ? ticket.note : '';
        stuff += '<div id="ticket_'+ticket.id+'" class="POS_TL_Summary">';
        
        // row 1
        stuff += '<div style="display:flex;width:100%;">';
        stuff += '<div id="ticketId_'+ticket.id+'" class="POS_TL_Ident" isSelected="0" onClick="POS_updateSelectedTicketIdList(\''+ticket.id+'\');">';
        stuff += '<div class="POS_TL_Number">#' + ticket.number + '</div>';
        stuff += '<div class="POS_TL_Id">ID:' + ticket.id + '</div>';
        stuff += '</div>';
        stuff += '<div style="display:flex;width:100%;" onclick="POS_loadTerminalTicket(\''+POS_Terminal.id+'\','+ticket.id+',\''+tNote+'\');">';
        stuff += '<div class="POS_TL_Entities POS_TL_EntityType">'+ticket.date+'<br/>'+ticket.lastOrderDate+'</div>';
        stuff += '<div class="POS_TL_Remaining">'+ticket.remaining.toFixed(2)+'</div>';
        stuff += '<div class="POS_TL_Total">'+ticket.remaining.toFixed(2)+'</div>';
        stuff += '</div>'
        stuff += '</div>';
        // row 1 end

        // row 2
        stuff += '<div style="display:flex;width:100%;" onclick="POS_loadTerminalTicket(\''+POS_Terminal.id+'\','+ticket.id+',\''+tNote+'\');">';
        stuff += '<div class="POS_TL_Entities">';
            for (var e=0; e<ticket.entities.length; e++) {
                    for (var te=0; te<POS_EntityTypes.length; te++) {
                if (ticket.entities[e].type.replace(/ /g,'_') == POS_EntityTypes[te]) {
            stuff += '<div class="POS_TL_Entity">';
            stuff += '<div class="POS_TL_EntityType">'+POS_EntityTypes[te].substr(0,POS_EntityTypes[te].length-1).replace(/_/g,' ')+':</div>';

                    stuff += '<div class="POS_TL_EntityName">'+ticket.entities[e].name+'</div>';
                }
            }
            stuff += '</div>';
        }
        stuff += '</div>';

        stuff += '</div>';
        // row 2 end

        // row 3
        if (ticket.tags.length>0) {
        stuff += '<div style="display:flex;width:100%;">';
        stuff += '<div class="POS_TL_Tags">';
        if (ticket.tags.length>0) {
            for (var tt=0; tt<ticket.tags.length; tt++) {
                var ttag = ticket.tags[tt];
//                stuff += ' <div>'+ttag.tagName+'</div>';
                stuff += ' <div class="POS_TL_Tag" title="'+ttag.tagName+'">'+ttag.tag.replace(/\\r/g,' ').substr(0,60)+'</div>';
            }
        }
        stuff += '</div>';
        stuff += '</div>';
        }
        // row 3 end
        
        // row 4
        if (ticket.note) {
        stuff += '<div style="display:flex;width:100%;">';
        stuff += '<div class="POS_TL_Note"><span class="POS_TL_EntityType">NOTE:</span> '+ticket.note.replace(/\r\n/g,' ')+'</div>';
        stuff += '</div>';
        }
        // row 4 end
        
        stuff += '</div>';
        // container end

    }
    
    if (callback) {
        callback(stuff);
    }
}
function POS_getTerminalTicket(terminalId, callback) {
    gql.EXEC(gql.getTerminalTicket(terminalId), function tt(response){
        if (response.errors) {
            gql.handleError(fn+' gql.getTerminalTicket',response);
        } else {
            var ticket = response.data.terminalTicket;
            if (ticket != null) {
                POS_Ticket.terminalTicket = ticket;
                POS_updateTicketOrders(ticket.orders, true);
                $('#POS_EntitySelectors').html(POS_getEntitySelectors(ticket.entities));
            } else {
                $('#POS_Orders').html('No Orders!');
            }
        }
        
        if (callback) {
            callback(ticket);
        }
    });
}
function POS_renderMenu(fetchMenu, callback) {
    // this directive determines if a GQL call is made to reload the Menu
    fetchMenu = fetchMenu !== '' ? fetchMenu : false;
    
    spu.consoleLog('POS_renderMenu (fetchMenu:'+fetchMenu+') ...');
    
    var stuff = '';
    
    var entitySelectors = '<div id="POS_EntitySelectors">'+POS_getEntitySelectors()+'</div>';
    var commands = '<div id="POS_TicketCommands">';
//        commands+= '<div id="PrintJob" class="POS_TicketCommand" style="background-color:#009900;" onClick="POS_printJobSelect();">Print</div>';
//        commands+= '<div id="MergeTickets" class="POS_TicketCommand" style="background-color:#DDAA00;" onClick="POS_processCommand(\'Merge_Tickets\');">MERGE<br/>Tickets</div>';
        commands+= '<div id="ClearOrders" class="POS_TicketCommand" style="background-color:#000099;" onClick="POS_clearOrders();">CLEAR<br />Orders</div>';
        commands+= '<div id="CloseTicket" class="POS_TicketCommand" style="background-color:#DD0000;" onClick="POS_processCommand(\'Close_Ticket\');">CLOSE</div>';
        commands+= '</div>';
    var topBar = '';
        topBar += entitySelectors;
        topBar += '<div id="POS_TicketInfo" onClick="">';
        topBar += '<div id="POS_TicketInfoLabel"></div>';
        topBar += '<div id="POS_TicketTotalValue">0.00</div>';
        topBar += '</div>';
        topBar += commands;
    $('#POS_TopBar').html(topBar);
        
    var menuCategories = '';
    var menuItems = '';

    var selectedCatId = POS_Menu.selectedCategoryId ? POS_Menu.selectedCategoryId : false;

    POS_getMenu(menuName, fetchMenu, function m(menu){
        POS_Menu = menu;
        POS_getCategories(POS_Menu, function c(data){
            menuCategories = data;

            POS_Menu.selectedCategoryId = selectedCatId ? selectedCatId : POS_Menu.categories[0].id;
            POS_getMenuItems(POS_Menu.selectedCategoryId, function mi(data){
                menuItems = data;

                stuff += '<div id="menuCategories">'+menuCategories+'</div>';
                stuff += '<div id="menuItems">'+menuItems+'</div>';

                if (callback) {
                    callback(stuff);
                }
            });
        });
    });

}

function POS_getEntitySelectors(ticketEntities) {
    var ticketEntities = typeof ticketEntities==='undefined' ? [] : ticketEntities;
    
    spu.consoleLog('Getting ticketEntity Selector buttons ...');
    var estuff = '';
    for (var e=0; e<POS_EntityTypes.length; e++) {
        var et = POS_EntityTypes[e];
        var ets = et.substr(0,POS_EntityTypes[e].length-1);
        for (var te=0; te<ticketEntities.length; te++) {
            if (et==ticketEntities[te].type.replace(/ /g,'_')) {
                POS_Ticket[ets] = ticketEntities[te].name;
            }
        }
        POS_Ticket[ets] = (typeof POS_Ticket[ets]==='undefined' ? '' : POS_Ticket[ets]);
        estuff += '<div id="select'+et.replace(/ /g,'_')+'" class="buttonEntitySelector" entityType="'+et+'" onClick="POS_showEntityGrid(\''+et.replace(/ /g,'_')+'\');">'+ets.replace(/_/g,' ')+'<br /><b style="color:#55FF55">'+(POS_Ticket[ets]!='' ? POS_Ticket[ets] : '&nbsp;')+'</b></div>';
    }
//    $('#POS_EntitySelectors').append(estuff);
    return estuff;
}
function POS_fillEntityGrids() {
    $('#POS_EntityGrids').empty();
    for (var e=0;e<POS_EntityTypes.length; e++) {
        var et  = POS_EntityTypes[e];
        var ets = et.substr(0,et.length-1);
        POS_fillEntityGrid(et);
    }
}
function POS_fillEntityGrid(entityType,entityName, callback) {
    var fn = spu.fi(arguments);
    spu.consoleLog('POS_fillEntityGrid ...');
    
    // singular name of entityType
    var ets = entityType.substr(0,entityType.length-1);

    var selectedEntityName = typeof entityName==='undefined' ? '' : entityName;
    
    var ticketEntity = typeof POS_Ticket[ets]==='undefined' ? '' : POS_Ticket[ets];

    selectedEntityName = (selectedEntityName!=='' ? selectedEntityName : ticketEntity);

    var entityScreen = entityType.replace(/_/g,' ');
    
    var stateFilter = (entityScreen=='Gift Certificates' ? 'Purchased' :'');

    // clear Entity Selector button
    if (document.getElementById('select'+entityType)) {
        document.getElementById('select'+entityType).innerHTML = ets.replace(/_/g,' ')+'<br />&nbsp;';
    }
                    
    gql.EXEC(gql.getEntityScreenItems(entityScreen, stateFilter), function(response) {
        if (response.errors) {
            gql.handleError(fn+ ' gql.getEntityScreenItems',response);
        } else {
            var entities = response.data.entityScreenItems; // name,caption,color,labelColor
            
            if (entities) {
                
            for (var e=0; e<entities.length; e++) {
                entities[e].type = entityType;
            }

            spu.consoleLog('POS_fillEntityGrid:'+entityType+' ('+entities.length+')');
            
            
            
            var egstuff = '';
            
            var entTypeDiv = entityType.replace(/ /g,'_');
            
            egstuff += '<div id="'+entTypeDiv+'" class="entityGrid" style="display:none;">';
            egstuff += '<div id="'+entTypeDiv+'_BACK" name="BACK" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#000088;font-size:50px;" onClick="POS_entityGridButtonClick(\''+entTypeDiv+'_BACK'+'\');">[ &lt; ]</div>';
            egstuff += '<div id="'+entTypeDiv+'_NONE" name="NONE" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#880000;font-size:50px;" onClick="POS_entityGridButtonClick(\''+entTypeDiv+'_NONE'+'\');">[ X ]</div>';

            jsonData = entities;
            jsonData = sortJSON(jsonData,"name",true);

            for (var e=0; e<entities.length; e++) {
                var entity = entities[e];
                var entNameDiv = entity.name.replace(/ /g,'_');
                var entTypeDiv = entity.type.replace(/ /g,'_');

                var borderColor=(selectedEntityName !== '' ? '#FF0066' : '#404040');
                
                if (selectedEntityName!=='' && selectedEntityName == entity.name && entityType == entity.type) {
                    if (document.getElementById('select'+entTypeDiv)) {
                        document.getElementById('select'+entTypeDiv).innerHTML = ets.replace(/_/g,' ')+'<br /><b style="color:#55FF55">'+ticketEntity+'</b>';
                    }
                    borderColor='#FF0066';
                } else {
                    borderColor='#404040';
                }
                
                entity.caption = entity.caption.replace(/<linebreak\/>/g,'<br />');
                
                var ebStyle = 'style="background-color:'+entity.color+';color:'+entity.labelColor+';border-color:'+borderColor+';"';
                
                //egstuff += '<div id="'+entityType+'_'+entity.name+'" name="'+entity.name+'" entityType="'+entityType+'" statusState="'+entity.statusState+'" ticketIDs="" class="entityBtn statusState_'+entity.statusStateClass+'"'+bgc+'>'+entity.name+'</div>';
                egstuff += '<div id="'+entTypeDiv+'_'+entNameDiv+'" name="'+entity.name+'" entityType="'+entityType+'" class="entityBtn" '+ebStyle+' onClick="POS_entityGridButtonClick(\''+entTypeDiv+'_'+entNameDiv+'\');">';
                egstuff += entity.caption;
                egstuff += '<div id="'+entTypeDiv+'_marker_'+entNameDiv+'" class="entitymarker"></div>';
                egstuff += '<div id="'+entTypeDiv+'_marker2_'+entNameDiv+'" class="entitymarker2"></div>';
                egstuff += '</div>';
            }

            egstuff += '</div>';

            $('#POS_EntityGrids').append(egstuff);
            
            for (var e=0; e<entities.length; e++) {
                var entity = entities[e];
                var entNameDiv = entity.name.replace(/ /g,'_');
                if (selectedEntityName!=='' && selectedEntityName == entity.name && entityType == entity.type) {
                    document.getElementById(entityType+'_marker_'+entNameDiv).style.display = 'block';
                    document.getElementById(entityType+'_marker2_'+entNameDiv).style.display = 'block';
                } else {
                    document.getElementById(entityType+'_marker_'+entNameDiv).style.display = 'none';
                    document.getElementById(entityType+'_marker2_'+entNameDiv).style.display = 'none';
                }
            }
            
            if (callback) {
                callback(entities);
            }
            
            }
        }

    });

}

function POS_getMenu(menuName,fetchMenu, callback) {
    var fn = spu.fi(arguments);
    // this directivedetermines if a GQL call is made to reload the Menu
    fetchMenu = fetchMenu !== '' ? fetchMenu : false;
    spu.consoleLog('POS_getMenu (fetchMenu:'+fetchMenu+') ...');
    
    if (!fetchMenu) {
        if (callback) {
            callback(POS_Menu);
        }
    } else {
        gql.EXEC(gql.getMenu(menuName), function(response) {
            if (response.errors) {
                gql.handleError(fn+' gql.getMenu',response);
                if(callback) {
                    callback('ERROR');
                }
            } else {
                var menu = response.data.menu;
                spu.consoleLog('POS_getMenu ('+menuName+')');
                if(callback) {
                    callback(menu);
                }
            }
        });
    }
}
function POS_getMenuItems(catId, callback){
    for (var c=0; c<POS_Menu.categories.length; c++) {
        if (POS_Menu.categories[c].id == catId) {
            var items = POS_Menu.categories[c].menuItems;
            var selCat = POS_Menu.categories[c];
            var catIdx = c;
            var categoryId = selCat.id;
            var category = selCat.name;
            var catHeader = selCat.header;
            var categoryIsFastMenu = selCat.isFastMenu;
            var catBGcolor = selCat.color;
            var catFGcolor = selCat.foreground;
            break;
        }
    }
    
    spu.consoleLog('POS_getMenuItems ('+items.length+') for ['+catId+']: '+selCat.name + ' ... ');

    itemIDs = [];
    
    var categoryBGcolor = (typeof catBGcolor == 'undefined' ? '' : catBGcolor);
    
    var menuItemColumnCount = 5;
    
    var mistuff = '';

    for (var i=0; i<items.length; i++) {
        var item = items[i];
        var isFastMenu = categoryIsFastMenu;
        itemIDs.push(item.id);
        item.name = item.name.toString().replace(/\\r/g, " ");
        if (item.header!=null) {
            item.header = item.header.toString().replace(/\\r/g, "<br />");
            item.header = item.header.toString().replace(/<br>/g, "<br />");
        }

        var bgColor = '';
        if (item.color!=null) {
            bgColor = item.color;
        } else {
            if (categoryBGcolor!='') {
                bgColor = categoryBGcolor;
            } else {
                bgColor = '#FF333333';
                bgColor = '#333333';
            }
        }

        var tColor = item.foreground;
        var itemButtonText = (item.header ? item.header : item.name);
        
        var defaultOrderTags = item.defaultOrderTags ? item.defaultOrderTags : '';
        var portion = item.portion ? item.portion : 'Normal';
        
        mistuff += '<div class="menuItem"><div id="m_'+item.id+'" name="'+item.name+'" value="'+item.name+'" defaultOrderTags="'+defaultOrderTags+'" productId="'+item.productId+'" productName="'+item.product.name+'" portion="'+portion+'" catId="'+categoryId+'" catIdx="'+catIdx+'" class="mBtn" style="background:'+bgColor+';color:'+tColor+';" price="'+item.product.price+'" onClick="POS_menuItemClicked('+item.id+');">'+itemButtonText+'</div></div>';
    }
    
    if (callback) {
        callback(mistuff);
    }
}

function POS_getTicketInfo(ticket, callback) {
    ticket = typeof ticket!=='undefined' ? ticket : POS_Ticket.terminalTicket;
    
    var stuff = '';

    stuff += '<div class="POS_TI_Summary">';

    // row 1
    stuff += '<div style="display:flex;width:100%;">';
    stuff += '<div class="POS_TI_Ident" title="'+ticket.uid+'">';
    stuff += '<div class="POS_TI_Number">#'+ticket.number+'</div>';
    stuff += '<div class="POS_TI_Id">ID:'+ticket.id + '</div>';
    stuff += '</div>';
    stuff += '<div class="POS_TI_Entities POS_TI_EntityType">'+ticket.date.substr(0,16).replace(/T/g,' ');
//    stuff += '<br/>'+ticket.lastOrderDate;
    stuff += '</div>';
    stuff += '<div class="POS_TI_Remaining">'+ticket.remainingAmount.toFixed(2)+'</div>';
    stuff += '<div class="POS_TI_Total">'+ticket.totalAmount.toFixed(2)+'</div>';
    stuff += '</div>';
    // row 1 end

    // row 2
    stuff += '<div style="display:flex;width:100%;padding-top:5px;">';
    stuff += '<div class="POS_TI_Entities">';
    for (var e=0; e<ticket.entities.length; e++) {
        for (var te=0; te<POS_EntityTypes.length; te++) {
            if (ticket.entities[e].type.replace(/ /g,'_') == POS_EntityTypes[te]) {
                stuff += '<div class="POS_TI_Entity">';
                stuff += '<div class="POS_TI_EntityType">'+POS_EntityTypes[te].substr(0,POS_EntityTypes[te].length-1).replace(/_/g,' ')+':</div>';
                stuff += '<div class="POS_TI_EntityName">'+ticket.entities[e].name+'</div>';
            }
        }
        stuff += '</div>';
    }
    stuff += '</div>';

    stuff += '</div>';
    // row 2 end

    // row 3
    if (ticket.tags.length>0) {
    stuff += '<div class="POS_TI_Tags">';
    stuff += '<div style="display:flex;flex-direction:column;width:100%;padding:5px;">';
    if (ticket.tags.length>0) {
        for (var tt=0; tt<ticket.tags.length; tt++) {
            var ttag = ticket.tags[tt];
            stuff += '<div style="display:flex;width:100%;">';
            stuff += '<div class="POS_TI_TagName">'+ttag.tagName+': </div>';
            stuff += '<div class="POS_TI_Tag" title="'+ttag.tagName+'"> '+ttag.tag.replace(/\\r/g,' ').substr(0,60)+'</div>';
            stuff += '</div>';
        }
    }
    stuff += '</div>';
    stuff += '</div>';
    }
    // row 3 end

    // row 4
//    if (ticket.note) {
//    stuff += '<div style="display:flex;width:100%;">';
//    stuff += '<div class="POS_TI_Note"><span class="POS_TI_EntityType">NOTE:</span> '+ticket.note.replace(/\r\n/g,' ')+'</div>';
//    stuff += '</div>';
//    }
    // row 4 end

    stuff += '</div>';
    // container end

    if (callback) {
        callback(stuff);
    }
    
    return stuff;
}

function POS_updateTicketNote(ticketId, callback) {
    var fn = spu.fi(arguments);

    ticketId = ticketId ? ticketId : (POS_Ticket.terminalTicket ? POS_Ticket.terminalTicket.id : '');

    if (ticketId!=='' && ticketId!=0) {

//        ticketId = ticketId ? ticketId : POS_Ticket.terminalTicket.id;
        
        var oldValue = POS_Ticket.terminalTicket ? POS_Ticket.terminalTicket.note : '';
        oldValue = typeof oldValue=='undefined' ? '' : oldValue;
        
        var ticketInfo = POS_getTicketInfo();
        
        POS_GetInput('Ticket Note','text',oldValue,ticketInfo, function inp(data){
            spu.consoleLog('Got input: '+data);
            var note = data==='ERASEINPUTVALUE' ? '' : data;
            if (note!=='CANCELINPUTVALUE') {
                $('#POS_Orders').html('<div class="info-message">Fetching Ticket Orders, please Wait...<br /><br />'+busyWheel+'</div>');
                gql.EXEC(gql.updateTicket(ticketId,'',note), function n(response){
                    if (response.errors) {
                        gql.handleError(fn+' gql.updateTicket',response);
                    } else {
                        var ticket = response.data.ticket;
                        if (POS_Ticket.terminalTicket) {
                            POS_loadTerminalTicket(POS_Terminal.id,ticketId);
//                            POS_getTerminalTicket(POS_Terminal.id);
                        }
                        $('#TicketNote').html(note.replace(/\r\n/g,' '));
                        if (callback) {
                            callback(ticket);
                        }
                    }
                });
            }
        });
        
    } else {
        spu.consoleLog('Cannot update Ticket Note, no Ticket selected!');
    }
}

function POS_GetInput(label,type,defaultValue,info, callback) {
    label = label!=='' ? label : 'Enter Value';
    type = type!=='' ? type : 'text';
    defaultValue = defaultValue ? defaultValue : '';
    info = info!=='' ? info : '';
    
    $('#inputInfo').html();
    $('#inputLabel').html(label+':');
    $('#inputType').html('<input id="inputValue" style="width:100%;" type="'+type+'" value="'+defaultValue+'" onfocus="this.value = this.value;"/>');

    if (info!='') {
        $('#inputInfo').html(info);
    } else {
        $('#inputInfo').empty();
    }
    
    $('#inputDialog').show();
    
    if (document.getElementById('inputValue')) {
        document.getElementById('inputValue').focus();
        $("#inputValue").focus();
        $("#inputValue").val(defaultValue);
    }
    
    var inputTimer = setInterval(function checkInput(){
        spu.consoleLog('Checking inputValue:' + inputValue);
        if (inputValue!='') {
            spu.consoleLog('Consuming input: '+inputValue);
            var stuff=inputValue;
            //clearInterval(inputTimer);
            clearTimers('POS_GetInput');
            inputValue = '';
            callback(stuff);
        }
    }, 1000);
    
}

function POS_printJobSelect() {
    var fn = spu.fi(arguments);
    
    var ticketInfo = POS_getTicketInfo();
    
    var stuff = '';
    stuff+='<div style="display:flex;flex-direction:column;">';
    
    stuff+='<div style="width:95%;">'+ticketInfo+'</div>';
    
    stuff+='<div style="font-weight:bold;color:#FFBB00;margin:10px;">Select Type of Print:</div>';
    stuff+='<div style="display:flex;">';
    for (var p=0; p<POS_PrintJobs.length; p++) {
        var pjDivId = POS_PrintJobs[p].replace(/ /g,'_');
        var pjName = POS_PrintJobs[p];
        var r=0,g=0,b=0;
        r = (pjName.indexOf('Kitchen')>-1 ? r : 0) + (p*30);
        g = (pjName.indexOf('Kitchen')>-1 ? 90 : 0) + (p*30);
        b = (pjName.indexOf('Bill')>-1 ? 90 : 0) + (p*30);
        var pjButtonColor = 'rgb('+r+','+g+','+b+')';
//        stuff+='<div id="printKitchen" class="inputButton" style="background-color:#009900;" onClick="POS_executePrintJob(\''+printKitchen+'\');">Kitchen</div>';
//        stuff+='<div id="printBill" class="inputButton" style="background-color:#000099;" onClick="POS_executePrintJob(\''+printBill+'\');">Bill</div>';
        stuff+='<div id="printJob_'+pjDivId+'" class="inputButton" style="background-color:'+pjButtonColor+';" onClick="POS_executePrintJob(\''+pjName+'\');">'+pjName+'</div>';
    }
    stuff+='<div id="printCancel" class="inputButton" style="background-color:#990000;" onClick="$(\'#helpMessage\').hide();">CANCEL</div>';
    stuff+='</div>';
    
    stuff+='</div>';

    if (POS_Ticket.terminalTicket) {
        showHelpMessage(stuff);
    }
}
function POS_executePrintJob(printJobName, callback) {
    var fn = spu.fi(arguments);
    
    printJobName = typeof printJobName!=='undefined' && printJobName!=='' ? printJobName : '';
    var copies = 1;
    
    if (printJobName.indexOf('Kitchen')>-1) {
        var orderStateFilters = [{stateName:"Status",state:"New"}];
//        var nextOrderStates   = [{stateName:"TPStatus",state:"Printed"}];
    }
    
    $('#helpMessage').hide();
    
    var ticketId = POS_Ticket.terminalTicket.id ? POS_Ticket.terminalTicket.id : '';
    
    if (printJobName!=='' && ticketId!=='') {
        // gql.executePrintJob(printJobName, ticketId, copies, orderStateFilters, nextOrderStates, nextTicketStates, terminal, department, ticketType, userName, ticket){
        gql.EXEC(gql.executePrintJob(printJobName, ticketId, copies, orderStateFilters), function(response){
            if (response.errors) {
                gql.handleError(fn+' gql.executePrintJob',response);
            } else {
                var printJob = response.data.printJob.name;
                spu.consoleLog('Fired Print Job: '+printJob);
            }
        });
    } else {
        spu.consoleLog('Firing Print Job FAILED! (printJob:'+printJobName+') (ticketId:'+ticketId+')');
    }
}

function POS_executeAutomationCommand(terminalId,orderUid,commandName,commandValue, callback) {
    var fn = spu.fi(arguments);
    
    gql.EXEC(gql.executeAutomationCommandForTerminalTicket(terminalId, orderUid, commandName, commandValue), function(response){
        if (response.errors) {
            gql.handleError(fn+' gql.executeAutomationCommandForTerminalTicket',response);
        } else {
            var ticket = response.data.terminalTicket;
            spu.consoleLog('Executed Automation Command ['+commandName+'] with value: '+commandValue);
            if (callback) {
                callback(ticket);
            }
        }
    });
}