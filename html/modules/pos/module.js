////////////////////////////////
//
// nav_pos
//
////////////////////////////////
function init_nav() {
    // do some stuff
}
spu.consoleLog('Initializing '+module.replace(/_/,' ').toUpperCase()+' ...');


$('#categories').on('click', '.cBtn', function(){
    var selectedDivId = this.id;
    POS_Menu.selectedCategoryDivId = selectedDivId;
    POS_Menu.selectedCategoryId = selectedDivId.replace(/c_/,'');
    POS_Menu.selectedCatName = this.getAttribute("name");
    POS_Menu.selectedCatBGcolor = this.getAttribute("bgColor");
    POS_Menu.selectedCatIsFastMenu = this.getAttribute("isFastMenu");
    
    spu.consoleLog('Category clicked: ['+POS_Menu.selectedCategoryId+'] ('+POS_Menu.selectedCatName+'), isFast:'+POS_Menu.selectedCatIsFastMenu);
    
    if (POS_Menu.selectedCatIsFastMenu!=1) {
        // get menuItems for the Category
        POS_updateMenuItems(POS_Menu.selectedCategoryId, POS_Menu.selectedCatName, POS_Menu.selectedCatBGcolor, POS_Menu.selectedCatIsFastMenu);

        // iterate Category Markers
        for (var c=0; c<POS_Menu.categories.length; c++) {
            var markerId = 'cm_'+POS_Menu.categories[c].id;
            if (document.getElementById(markerId)) {
                // clear Category Marker
                document.getElementById(markerId).style.backgroundColor="#363636";
                if ('cm_'+POS_Menu.selectedCategoryId == markerId) {
                    // set Category Marker
                    document.getElementById(markerId).style.backgroundColor="#FFBB55";
                }
            }

        }
        
    }
});

$('#menuItems').on('click', '.mBtn', function(){
    POS_menuItemClicked(this.id);    
});
$('#menuFast').on('click', '.mBtn', function(){
    POS_menuItemClicked(this.id);    
});

function POS_menuItemClicked(m) {
    var miDivId        = m;
    var miId           = miDivId.replace(/m_/,'');
    var elem           = document.getElementById(miDivId);
    
    var miName         = elem.getAttribute("name");
    var miQuantity     = 1;
    var miPrice        = elem.getAttribute('price');
    var productId      = elem.getAttribute('productId');
    var portion        = elem.getAttribute('portion');
    var orderLineTotal = Number(miQuantity * miPrice).toFixed(2);
    
    var oStates = [];
    oStates.push({stateName:"Status",state:"New"});
    oStates.push({stateName:"KDStatus",state:"FNotPrinted"});
    
    orders.push({id:miId,divid:miDivId,name:miName,quantity:miQuantity,productId:productId,portion:portion,price:miPrice,orderStates:oStates,isSelected:1});

    POS_updateTicketOrders();
    spu.consoleLog('Order Added: '+miName);

    for (var o=0; o<orders.length; o++) {
        if (document.getElementById('o_'+o)) {
            document.getElementById('o_'+o).setAttribute("isSelected", "0");
            document.getElementById('o_'+o).style.backgroundColor = '';
        }
    }
    document.getElementById('o_'+(orders.length-1)).setAttribute("isSelected", "1");
    document.getElementById('o_'+(orders.length-1)).style.backgroundColor = '#224455';
    
    
    // load Order Tag screen
    POS_getOrderTagGroups(miName,productId,portion, function t(oTagGroups){
        if (oTagGroups.length>0) {
            POS_showOrderTagGroups(oTagGroups, 'o_'+(orders.length-1));
        } else {
            POS_closeOrderTagDisplay();
        }
    });
    
}

$('#orders').on('click', '.orderContainer', function(){
    spu.consoleLog('Order Selected: '+this.id);

    var oId      = this.id;
    var elem     = document.getElementById(oId);
    
    var miName = elem.getAttribute("name");
    var productId = elem.getAttribute("productId");
    var portion = elem.getAttribute("portion");

    var quantity = elem.getAttribute("quantity");
    var product  = elem.getAttribute("product");
    var price    = elem.getAttribute("price");
    var orderLineTotal    = elem.getAttribute("orderLineTotal");
    
    var isSelected = (elem.getAttribute("isSelected")=='1' ? '0' : '1');
    for (var o=0; o<orders.length; o++) {
        if (document.getElementById('o_'+o)) {
            document.getElementById('o_'+o).setAttribute("isSelected", "0");
            document.getElementById('o_'+o).style.backgroundColor = '';
        }
    }
    this.setAttribute("isSelected", isSelected);
    isSelected = elem.getAttribute("isSelected");
    if (isSelected=='1') {
        selectedOrderCount++;
        this.style.backgroundColor = '#224455';
    } else {
        selectedOrderCount--;
        this.style.backgroundColor = '';
    }
    spu.consoleLog('ORDERLINE:'+quantity+'x '+product+' '+price+' S:'+isSelected+' bgColor:'+elem.style.backgroundColor);
    spu.consoleLog('selectedOrderCount:'+selectedOrderCount);


    //if (selectedOrderCount>0) {
    if (isSelected=='1') {
        $('#selectCustomers').hide();
        $('#selectTables').hide();
        $('#ticketCommands').hide();
        $('#orderCommands').show();
        // load Order Tag screen
        POS_getOrderTagGroups(miName,productId,portion, function t(oTagGroups){
            if (oTagGroups.length>0) {
                POS_showOrderTagGroups(oTagGroups, oId);
            } else {
                POS_closeOrderTagDisplay();
            }
        });
    } else {
        $('#orderCommands').hide();
        $('#selectCustomers').show();
        $('#selectTables').show();
        $('#ticketCommands').show();
        POS_closeOrderTagDisplay();

    }
    
    //document.getElementById(oId).click();

});


$('#entityGrids').on('click', '.entityBtn', function(){
    var et  = this.getAttribute("entityType");
    // singular name of Entity Type
    var ets = et.substr(0,et.length-1);
    var selectedEntity = POS_Ticket[ets];
    var entityName  = this.getAttribute("name");
    var et  = this.getAttribute("entityType");
    var entityStatusState = this.getAttribute("statusState");
    
    spu.consoleLog("SELECTED:"+et+":"+entityName+":"+entityStatusState);
    
    if (document.getElementById(et)) {
        $('#'+et).hide();
    }
    
    if (document.getElementById('select'+et)) {
        if (entityName=='BACK') {
            // do nothing
        } else if (entityName=='NONE') {
            document.getElementById('select'+et).innerHTML = ets;
            if (document.getElementById(et+'_'+selectedEntity)) {
                document.getElementById(et+'_'+selectedEntity).style.backgroundColor = '';
            }
            POS_Ticket[ets] = '';
        } else {
            document.getElementById('select'+et).innerHTML = ets+"<br /><b style='color:#55FF55'>"+entityName+"</b>";
            if (selectedEntity != entityName) {
                if (document.getElementById(et+'_'+selectedEntity)) {
                    document.getElementById(et+'_'+selectedEntity).style.backgroundColor = '';
                }
            }
            POS_Ticket[ets] = entityName;
            this.style.backgroundColor = '#660066';
        }
    }
});





function POS_closeTicket() {
    spu.consoleLog('Closing Ticket...');
    
    var entSelected = false;
    for (var e=0; e<POS_EntityTypes.length; e++) {
        var et = POS_EntityTypes[e];
        var ets = et.substr(0,POS_EntityTypes[e].length-1);
        if (POS_Ticket[ets]) {
            entSelected = true;
            break;
        }
    }
    
    if(!orders || orders.length == 0) {
        if (document.getElementById('infoMessage')) {
            document.getElementById('infoMessage').innerHTML = 'No Orders to Submit.';
            document.getElementById('infoMessage').style.display = 'flex';
            //$('#infoMessage').show();
        }
    } else if(!entSelected) {
        if (document.getElementById('infoMessage')) {
            document.getElementById('infoMessage').innerHTML = 'Select a Table and/or Customer.';
            //document.getElementById('infoMessage').style.display = 'flex';
            $('#infoMessage').show();
        }
    } else {
        POS_createTicket(orders, function(tid) {
            var nextTicketStates = [];
                nextTicketStates.push({stateName:"Status",state:"Unpaid"});
            var orderStateFilters = [];
                orderStateFilters.push({stateName:"KDStatus",state:"FNotPrinted"});
            var nextOrderStates = [];
                nextOrderStates.push({stateName:"KDStatus",currentState:"FNotPrinted",state:"FPrinted"});

            //spu.consoleLog('Printing Ticket:'+tid);
            // printJobName, ticketId, orderStateFilters, nextOrderStates, nextTicketStates, copies, userName
            //gql.EXEC( gql.executePrintJob('BB Print Tasks - ANY',tid, orderStateFilters) );
            //gql.EXEC( gql.executePrintJob('BB Print Tasks HTML - ANY', tid, orderStateFilters, nextOrderStates) );

            for (var e=0; e<POS_EntityTypes.length; e++) {
                var et = POS_EntityTypes[e];
                var ets = et.substr(0,POS_EntityTypes[e].length-1);

                POS_updateEntityColor(et, POS_Ticket[ets]);

                POS_Ticket[ets] = '';
            }
           
            orders = [];
            POS_updateTicketOrders();
        });

    }
}




function POS_getMenu(menuName,callback) {
    gql.EXEC(gql.getMenu(menuName), function(response) {
        if (response.errors) {
            gql.handleError("POS_getMenu", response.errors);
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

function POS_getCategories(menu,callback){
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

        if (category.isFastMenu) {
            //fastStuff += '<div class="catRow"><div id="c_'+catId+'" name="'+catName+'" value="'+catName+'" isFastMenu="'+menuCategories.isFastMenu+'" bgColor="'+bgColor+'" style="background-color:'+bgColor+';color:'+tColor+';" class="cBtn">';
            POS_updateMenuItems(catId, menuCategories[c].name, bgColor, 1);
            //fastStuff += '</div></div>';
        } else {
            catStuff += '<div class="catRow"><div id="c_'+catId+'" name="'+catName+'" value="'+catName+'" isFastMenu="0" bgColor="'+bgColor+'" style="background-color:'+bgColor+';color:'+tColor+';" class="cBtn">';
            catStuff += catButtonText;
            catStuff += '</div>';
            catStuff += '<div id="cm_'+catId+'" class="cBtnMarker">&nbsp;</div>';
            catStuff += '</div>';
        }
    }

    $('#categories').empty();
    $('#categories').append(catStuff);

    if (POS_Menu.selectedCategoryDivId) {
        selectedCategoryDivId = POS_Menu.selectedCategoryDivId;
    } else {
        selectedCategoryDivId = 'c_'+menuCategories[firstNonFastCat].id;
        POS_Menu.selectedCategoryDivId = selectedCategoryId;
    }
    document.getElementById(selectedCategoryDivId).click();

    if (callback) {
        callback(selectedCategoryDivId);
    }

}


function POS_updateMenuItems(catId, category, categoryBGcolor, categoryIsFastMenu){
    spu.consoleLog('Getting Menu Items for: '+category);

    itemIDs = [];
    category = category.toString().replace(/\\r/g, " ");
    category = category.toString().replace(/&amp;/g, "&");
    categoryBGcolor = (typeof categoryBGcolor == 'undefined' ? '' : categoryBGcolor);
    
    var menuItemColumnCount = 5;

    for (var c=0; c<POS_Menu.categories.length; c++) {
        if (POS_Menu.categories[c].id == catId) {
            var items = POS_Menu.categories[c].menuItems;
            break;
        }
    }
    
    spu.consoleLog('POS_updateMenuItems:'+category+' ('+items.length+')');

    $('#menuItems').empty();

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

        if (isFastMenu==1) {
            $('#menuFast').append('<div class="menuItem"><div id="m_'+item.id+'" name="'+item.name+'" value="'+item.name+'" productId="'+item.productId+'" portion="'+item.portion+'" class="mBtn" style="background:'+bgColor+';color:'+tColor+';height:70px;" price="'+item.product.price+'">'+itemButtonText+'</div></div>');
        } else {
            $('#menuItems').append('<div class="menuItem"><div id="m_'+item.id+'" name="'+item.name+'" value="'+item.name+'" productId="'+item.productId+'" portion="'+item.portion+'" class="mBtn" style="background:'+bgColor+';color:'+tColor+';" price="'+item.product.price+'">'+itemButtonText+'</div></div>');
        }
    }

    if (isFastMenu!=1) {
        var allElements = $('.menuItem'),
        WRAP_BY = menuItemColumnCount;
        for (var i = 0; i < allElements.length; i += WRAP_BY) {
            //first loop, elements 0 : 15, next loop elements 15:30 and so on
            allElements.slice(i, i + WRAP_BY).wrapAll('<div class="menuItemButtonRow" />');
        }
    }

}

function POS_closeOrderTagDisplay() {
    $('#menuFast').show();
    $('#menuNormal').show();
    $('#orderTagDisplay').hide();
}

function POS_getOrderTagGroups(miName,productId,portion, callback) {
    $('#orderTagDisplay').html('<div class="info-message">Fetching Order Tags, please Wait...<br /><br />'+busyWheel+'</div>');

    var oTagGroups;
    gql.EXEC(gql.getOrderTagGroups(miName,productId,portion), function(response) {
        if (response.errors) {
            gql.handleError("getOrderTagGroups", response.errors);
        } else {
            oTagGroups = response.data.orderTagGroups;
        }
        if (callback) {
            callback(oTagGroups);
        }
    });
}

function POS_showOrderTagGroups(orderTagGroups, addedOrderId) {
    // id,name,color,min,max,tags{id,name,color,description,header,price,rate,filter}
    var tagGroups = orderTagGroups;

    if (tagGroups.length > 0) {

        var otStuff = '';

        otStuff += '<div style="height:90%;overflow-y:auto;">';

        for (var g=0; g<tagGroups.length; g++) {
            var tagGroup = tagGroups[g];
            //spu.consoleLog('Order Tag Group: '+tagGroup.name +'-----------------------------------');

            otStuff += '<div class="orderTagGroupSection">';

            otStuff += '<div id="orderTagGroup_'+tagGroup.id+'" class="orderTagGroup">'+tagGroup.name+'</div>';

            otStuff += '<div class="orderTagButtonSection">';

            var tags = tagGroup.tags;
            for (var t=0; t<tags.length; t++) {
                var tag = tags[t];
                //spu.consoleLog('Order Tag: '+tag.name);
                otStuff += '<div id="otb_'+tag.id+'" class="orderTagButton">'+tag.name+'</div>';
            }

            otStuff += '</div>';

            otStuff += '</div>';

        }

        otStuff += '</div>';

        otStuff += '<div id="orderTagCloseButton" onClick="POS_closeOrderTagDisplay();">CLOSE</div>';

        

        
        //$('#'+addedOrderId).click();
        //document.getElementById(addedOrderId).click();
    }

//    for (var o=0; o<orders.length; o++) {
//        document.getElementById('o_'+o).backgroundColor = '';
//        document.getElementById('o_'+o).setAttribute('isSelected','0');
//    }

    if (tagGroups.length>0) {
        $('#menuFast').hide();
        $('#menuNormal').hide();
        $('#orderTagDisplay').empty();
        $('#orderTagDisplay').append(otStuff);
        $('#orderTagDisplay').show();
//        document.getElementById(addedOrderId).style.backgroundColor = '#224455';
//        document.getElementById(addedOrderId).setAttribute('isSelected','1');
    } else {
        $('#menuFast').show();
        $('#menuNormal').show();
        $('#orderTagDisplay').hide();
//        document.getElementById(addedOrderId).style.backgroundColor = '';
//        document.getElementById(addedOrderId).setAttribute('isSelected','0');
    }
}



function POS_updateEntityColor(entityType,entityName){
    if(!entityName) return;
    gql.EXEC(gql.updateEntityState(entityType,entityName,'Status','New Orders'), function(response) {
        if (response.errors) {
            gql.handleError("POS_updateEntityColor", response.errors);
        } else {
            if (document.getElementById(entityType+'_'+entityName)) {
                var ent = document.getElementById(entityType+'_'+entityName);
                ent.style.backgroundColor = 'Orange';
            }
        }
    });
}


function POS_createTicket(orders,callback){
    //var ticketID = 0;
    var ticketEntities = [];
    for (var e=0; e<POS_EntityTypes.length; e++) {
        var et = POS_EntityTypes[e];
        var ets = et.substr(0,POS_EntityTypes[e].length-1);
        if (POS_Ticket[ets]) {
            // {entityType:"Tables",name:"'+tableName+'"}
            ticketEntities.push('{entityType:"'+et+'",name:"'+POS_Ticket[ets]+'"}');
        }
    }
                
    gql.EXEC(gql.addTicket(orders,ticketEntities), function(response) {
        if (response.errors) {
            gql.handleError("POS_createTicket", response.errors);
        } else {
            
            var ticketID = response.data.addTicket.id;
            
            for (var e=0; e<POS_EntityTypes.length; e++) {
                var et = POS_EntityTypes[e];
                var ets = et.substr(0,POS_EntityTypes[e].length-1);
                if (document.getElementById(et+'_'+POS_Ticket[ets])) {
                    document.getElementById(et+'_'+POS_Ticket[ets]).style.backgroundColor = '';
                    var tids = document.getElementById(et+'_'+POS_Ticket[ets]).getAttribute("ticketIDs");
                        tids = (tids.length>0 ? tids+','+ticketID : ticketID);
                    document.getElementById(et+'_'+POS_Ticket[ets]).setAttribute("ticketIDs",tids);
                    document.getElementById(et+'_'+POS_Ticket[ets]).setAttribute("statusState",'New Orders');
                    document.getElementById(et+'_'+POS_Ticket[ets]).setAttribute("class",'entityBtn statusState_New_Orders');
                }
                
                $('#select'+et).html(ets+'<br />&nbsp;');
            }
            
            refreshTicket();
            
            spu.consoleLog('Created Ticket:'+ticketID);

            if (callback) {
                callback(ticketID);
            }
        }
    });
}

function refreshTicket(){
    gql.EXEC(gql.postTicketRefreshMessage('0'));
}


function POS_updateTicketOrders(){
    var ttl=0.00;
    $('#orders').empty();
    for (var o=0; o<orders.length; o++) {
        var order = orders[o];
        var orderId = order.id;
        var price = Number(order.price).toFixed(2);
        var orderLineTotal = Number(order.quantity * price).toFixed(2);
        var oStates = order.orderStates;
        
        var stuff = '';
        // orders.push({id:miId,divid:miDivId,name:miName,quantity:miQuantity,productId:productId,portion:portion,price:miPrice,orderStates:oStates});

        stuff += '<div id="o_'+o+'" class="orderContainer" name="'+order.name+'" product="'+order.name+'" productId="'+order.productId+'" portion="'+order.portion+'" quantity="'+order.quantity+'" price="'+price+'" orderLineTotal="'+orderLineTotal+'" isSelected="'+order.isSelected+'">';
            stuff += '<div class="orderLine">';
            stuff += '    <div class="orderQuantity">'+order.quantity+'</div>';
            stuff += '    <div class="orderName">'+order.name+'</div>';
            //stuff += '    <div class="orderPrice">'+price+'</div>';
            stuff += '    <div class="orderPrice">'+orderLineTotal+'</div>';
            stuff += '</div>';
            stuff += '<div class="orderState">';
                var os = '';
                for (var s=0; s<oStates.length; s++) {
                    //os += oStates[s]["stateName"]+':'+oStates[s]["state"];
                    os += oStates[s]["state"];
                    os += (s<(oStates.length-1) ? ',' : '');
                }
                //os = os.substr(0,os.length-1); // trim trailing comma
                stuff += os;
            stuff += '</div>';
        stuff += '</div>';
        
        $('#orders').append(stuff);
        
        ttl += Number(order.price);
    }
    
    ttl = ttl.toFixed(2);
    $('#ticketTotalValue').html(ttl);
    
    
    return 'o_'+orderId+'_'+o;
}

function POS_fillEntityGrid(entityType, callback){
    gql.EXEC(gql.getEntities(entityType), function(response) {
        if (response.errors) {
            gql.handleError("POS_getEntities", response.errors);
        } else {
            var entities = response.data.entities;
            spu.consoleLog('POS_getEntities:'+entityType+' ('+entities.length+')');
            
            // singular name of entityType
            var ets = entityType.substr(0,entityType.length-1);
            
            var ticketEntity = '';
            ticketEntity = POS_Ticket[ets];
            
            var egstuff = '';
            
            egstuff += '<div id="'+entityType+'" class="entityGrid" style="display:none;">';
            egstuff += '<div id="'+entityType+'_BACK" name="BACK" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#000088;font-size:50px;">[ &lt; ]</div>';
            egstuff += '<div id="'+entityType+'_NONE" name="NONE" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#880000;font-size:50px;">[ X ]</div>';

            jsonData = entities;
            jsonData = sortJSON(jsonData,"name",true);

            for (var e=0; e<entities.length; e++) {
                var entity = entities[e];

                for (var s=0; s<entity.states.length; s++) {
                    var ST = entity.states[s];
                    if (ST.stateName=="Status") {
                        entity.statusState = ST.state;
                        entity.statusStateClass = ST.state.replace(/ /g,'_');
                        //spu.consoleLog(entity.type+":"+entity.name+" Status State:"+ST.state+entity.statusState);
                    }
                }

                var bgc='';
                if (orders.length>0 && ticketEntity==entity.name) {
                    bgc=' style="background-color:#660066"';
                    if (document.getElementById('select'+entityType)) {
                        document.getElementById('select'+entityType).innerHTML = ets+"<br /><b style='color:#55FF55'>"+ticketEntity+"</b>";
                    }
                }

                egstuff += '<div id="'+entityType+'_'+entity.name+'" name="'+entity.name+'" entityType="'+entityType+'" statusState="'+entity.statusState+'" ticketIDs="" class="entityBtn statusState_'+entity.statusStateClass+'"'+bgc+'>'+entity.name+'</div>';
            }

            egstuff += '</div>';
            
            $('#entityGrids').append(egstuff);
        }
        if (callback) {
            callback(entities);
        }
    });

}

function POS_getEntitySelectors() {
    spu.consoleLog('Getting TEntity Selector buttons...');
    var estuff = '';
    for (var e=0; e<POS_EntityTypes.length; e++) {
        var et = POS_EntityTypes[e];
        var ets = et.substr(0,POS_EntityTypes[e].length-1);
        estuff += '<div id="select'+et+'" class="buttonMain" entityType="'+et+'" onClick="POS_showEntityGrid(\''+et+'\');">'+ets+'<br />...</div>';
    }
    $('#ticketEntitySelectors').append(estuff);
}

function POS_showEntityGrid(entityType) {
    spu.consoleLog('Showing Entity Grid: '+entityType);
    $('#'+entityType).show();
}

function POS_amcButtons(mapping) {
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
    
    $('#'+mapping).empty();
    for (var b=0; b<amcButtons.length; b++) {
        var btn = amcButtons[b];
        var btnStuff = '<div id="amc_'+btn["buttonID"]+'" name="'+btn["buttonName"]+'" class="buttonMain" onclick="POS_processCommand(\''+btn["buttonID"]+'\');" style="background-color:'+btn["btnBGcolor"]+';color:'+btn["btnTextColor"]+'">'+btn["buttonHeader"]+'</div>';
        $('#'+mapping).append(btnStuff);
    }
}

function POS_processCommand(cmd) {
    spu.consoleLog('Processing POS Command: '+cmd);
    switch(cmd) {
        case 'Close_Ticket':
            POS_closeTicket();
            break;
        case 'NV_Main_Menu':
            navigateTo('module','main_menu','main_menu');
            break;
        default:
            spu.consoleLog('Unhandled POS Command: '+cmd);
    }
}