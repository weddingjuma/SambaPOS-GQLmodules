////////////////////////////////
//
// nav_pos
//
////////////////////////////////
function init_nav() {
    // do some stuff
}
spu.consoleLog('Initializing '+module.replace(/_/,' ').toUpperCase()+' ...');

//initialize menu
updateCategories();
updateEntities("Tables");
updateEntities("Customers");
$('#orders').empty();
//orders = [];
updateTicketOrders();
selectedOrderCount = 0;
amcButtons('ticketCommands');
amcButtons('orderCommands');
amcButtons('ticketRow1');
amcButtons('ticketRow2');




$('#categories').on('click', '.cBtn', function(){
    var highlightID = this.id;
    selectedCategoryId = highlightID;
    var catName = this.getAttribute("name");
    var catBGcolor = this.getAttribute("bgColor");
    var catIsFastMenu = this.getAttribute("isFastMenu");
    
    spu.consoleLog('Category clicked:'+catName+', isFast:'+catIsFastMenu);
    
    if (catIsFastMenu!=1) {
        // get menuItems for the Category
        spu.consoleLog('Getting Menu Items for: '+catName);
        updateMenuItems(catName, catBGcolor, catIsFastMenu);

        // clear all Category Markers
        for (var c=0; c<categoryIDs.length; c++) {
            highlightID = 'cm_'+categoryIDs[c];
            if (document.getElementById(highlightID)) {
                //spu.consoleLog("hiding:"+highlightID);
                document.getElementById(highlightID).style.backgroundColor="#363636";
            }

        }
        // set selected Category Marker
        highlightID = this.id.replace(/c_/,"");
        highlightID = 'cm_'+highlightID;
        if (document.getElementById(highlightID)) {
            document.getElementById(highlightID).style.backgroundColor="#FFBB55";
        }
        
    }
});

$('#menuItems').on('click', '.mBtn', function(){
    var miId = this.id;
    var miName = this.getAttribute("name");
    var miQuantity = 1;
    var miPrice = this.getAttribute('price');
    var orderLineTotal = Number(miQuantity * miPrice).toFixed(2);
    var oStates = [];
    oStates.push({stateName:"Status",state:"New"});
    oStates.push({stateName:"KDStatus",state:"FNotPrinted"});
    orders.push({id:miId,name:miName,quantity:miQuantity,price:miPrice,orderStates:oStates});
    var addedOrderId = updateTicketOrders();
    spu.consoleLog('Order Added: '+miName + '('+addedOrderId+')');
    
    // load Order Tag screen
    gql.EXEC(gql.getOrderTagGroups(miName), function(response) {
        if (response.errors) {
            gql.handleError("getOrderTagGroups", response.errors);
        } else {
            showOrderTagGroups(response.data.orderTagGroups, addedOrderId);
        }
    });
    
});
$('#menuFast').on('click', '.mBtn', function(){
    var miName = this.getAttribute("name");
    var miQuantity = 1;
    var miPrice = this.getAttribute('price');
    var orderLineTotal = Number(miQuantity * miPrice).toFixed(2);
    var oStates = [];
    oStates.push({stateName:"Status",state:"New"});
    oStates.push({stateName:"KDStatus",state:"FNotPrinted"});
    orders.push({name:miName,quantity:miQuantity,price:miPrice,orderStates:oStates});
    updateTicketOrders();
    spu.consoleLog('Order Added: '+miName);
    
    // load Order Tag screen
    gql.EXEC(gql.getOrderTagGroups(miName), function(response) {
        if (response.errors) {
            gql.handleError("getOrderTagGroups", response.errors);
        } else {
            showOrderTagGroups(response.data.orderTagGroups);
        }
    });
    
});

$('#orders').on('click', '.orderContainer', function(){
    var oId      = this.id;
    var quantity = this.getAttribute("quantity");
    var product  = this.getAttribute("product");
    var price    = this.getAttribute("price");
    var orderLineTotal    = this.getAttribute("orderLineTotal");
    var isSelected = (this.getAttribute("isSelected")=='1' ? '0' : '1');
    this.setAttribute("isSelected", isSelected);
    isSelected = this.getAttribute("isSelected");
    if (isSelected=='1') {
        selectedOrderCount++;
        this.style.backgroundColor = '#224455';
    } else {
        selectedOrderCount--;
        this.style.backgroundColor = '';
    }
    spu.consoleLog('ORDERLINE:'+quantity+'x '+product+' '+price+' S:'+isSelected+' bgColor:'+this.style.backgroundColor);
    spu.consoleLog('selectedOrderCount:'+selectedOrderCount);

    if (selectedOrderCount>0) {
        $('#selectCustomers').hide();
        $('#selectTables').hide();
        $('#ticketCommands').hide();
        $('#orderCommands').show();
    } else {
        $('#orderCommands').hide();
        $('#selectCustomers').show();
        $('#selectTables').show();
        $('#ticketCommands').show();
    }
    
    //document.getElementById(oId).click();
    
});

$('#selectCustomers').on('click', function(){
    var entityType = this.getAttribute("entityType");
    if (document.getElementById(entityType)) {
        $('#'+entityType).show();
    }
});

$('#selectTables').on('click', function(){
    var entityType = this.getAttribute("entityType");
    if (document.getElementById(entityType)) {
        $('#'+entityType).show();
    }
});

$('#Customers').on('click', '.entityBtn', function(){
    // singular name of Entity Type
    var eType = 'Customer';
    var ticketEntity = ticketCustomer;
    var entityName  = this.getAttribute("name");
    var entityType  = this.getAttribute("entityType");
    var entityStatusState = this.getAttribute("statusState");
    spu.consoleLog("SELECTED:"+entityType+":"+entityName+":"+entityStatusState);
    if (document.getElementById(entityType)) {
        //document.getElementById(entityType).style.display = 'none';
        $('#'+entityType).hide();
    }
    if (document.getElementById('select'+entityType)) {
        if (entityName=='BACK') {
            // do nothing
        } else if (entityName=='NONE') {
            document.getElementById('select'+entityType).innerHTML = eType;
            if (document.getElementById(entityType+'_'+ticketEntity)) {
                document.getElementById(entityType+'_'+ticketEntity).style.backgroundColor = '';
            }
            ticketCustomer = '';
        } else {
            document.getElementById('select'+entityType).innerHTML = eType+"<br /><b style='color:#55FF55'>"+entityName+"</b>";
            if (ticketEntity != entityName) {
                if (document.getElementById(entityType+'_'+ticketEntity)) {
                    document.getElementById(entityType+'_'+ticketEntity).style.backgroundColor = '';
                }
            }
            ticketCustomer = entityName;
            this.style.backgroundColor = '#660066';
        }
    }
});

$('#Tables').on('click', '.entityBtn', function(){
    // singular name of Entity Type
    var eType = 'Table';
    var ticketEntity = ticketTable;
    var entityName  = this.getAttribute("name");
    var entityType  = this.getAttribute("entityType");
    var entityStatusState = this.getAttribute("statusState");
    spu.consoleLog("SELECTED:"+entityType+":"+entityName+":"+entityStatusState);
    if (document.getElementById(entityType)) {
        //document.getElementById(entityType).style.display = 'none';
        $('#'+entityType).hide();
    }
    if (document.getElementById('select'+entityType)) {
        if (entityName=='BACK') {
            // do nothing
        } else if (entityName=='NONE') {
            document.getElementById('select'+entityType).innerHTML = eType;
            if (document.getElementById(entityType+'_'+ticketEntity)) {
                document.getElementById(entityType+'_'+ticketEntity).style.backgroundColor = '';
            }
            ticketTable = '';
        } else {
            document.getElementById('select'+entityType).innerHTML = eType+"<br /><b style='color:#55FF55'>"+entityName+"</b>";
            if (ticketEntity != entityName) {
                if (document.getElementById(entityType+'_'+ticketEntity)) {
                    document.getElementById(entityType+'_'+ticketEntity).style.backgroundColor = '';
                }
            }
            ticketTable = entityName;
            this.style.backgroundColor = '#660066';
        }
    }
});

$('#amc_Close_Ticket').click( function () {
    spu.consoleLog('Closing Ticket...');
    if(!orders || orders.length == 0) {
        if (document.getElementById('infoMessage')) {
            document.getElementById('infoMessage').innerHTML = 'No Orders to Submit.';
            document.getElementById('infoMessage').style.display = 'flex';
            //$('#infoMessage').show();
        }
    } else if(!ticketTable && !ticketCustomer) {
        if (document.getElementById('infoMessage')) {
            document.getElementById('infoMessage').innerHTML = 'Select a Table and/or Customer.';
            //document.getElementById('infoMessage').style.display = 'flex';
            $('#infoMessage').show();
        }
    } else {
        createTicket(orders,ticketTable,ticketCustomer, function(tid) {
            var nextTicketStates = [];
                nextTicketStates.push({stateName:"Status",state:"Unpaid"});
            var orderStateFilters = [];
                orderStateFilters.push({stateName:"KDStatus",state:"FNotPrinted"});
            var nextOrderStates = [];
                nextOrderStates.push({stateName:"KDStatus",currentState:"FNotPrinted",state:"FPrinted"});
            spu.consoleLog('Printing Ticket:'+tid);
            // printJobName, ticketId, orderStateFilters, nextOrderStates, nextTicketStates, copies, userName
            //gql.EXEC( gql.executePrintJob('BB Print Tasks - ANY',tid, orderStateFilters) );
            //gql.EXEC( gql.executePrintJob('BB Print Tasks HTML - ANY', tid, orderStateFilters, nextOrderStates) );
        });
        updateEntityColor('Customers',ticketCustomer);
        updateEntityColor('Tables',ticketTable);
        orders = [];
        updateTicketOrders();
    }
});

//$('#orderTagCloseButton').click( function () {
//    updateCategories();
//    if (document.getElementById(selectedCategoryId)) {
//        document.getElementById(selectedCategoryId).click();
//    }
//});

$('#amc_NV_Main_Menu').click( function () {
    loadNAV('main_menu');
});

function closeOrderTagDisplay() {
    $('#menuFast').show();
    $('#menuNormal').show();
    $('#orderTagDisplay').empty();
    $('#orderTagDisplay').hide();
}

function showOrderTagGroups(orderTagGroups, addedOrderId) {
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

                otStuff += '<div id="orderTagCloseButton" onClick="closeOrderTagDisplay();">CLOSE</div>';

                $('#menuFast').hide();
                $('#menuNormal').hide();
                $('#orderTagDisplay').empty();
                $('#orderTagDisplay').append(otStuff);
                $('#orderTagDisplay').show();
                
                //$('#'+addedOrderId).click();
                //document.getElementById(addedOrderId).click();
            }

}



function updateEntityColor(entityType,entityName){
    if(!entityName) return;
    gql.EXEC(gql.updateEntityState(entityType,entityName,'Status','New Orders'), function(response) {
        if (response.errors) {
            gql.handleError("updateEntityColor", response.errors);
        } else {
            if (document.getElementById('Customers_'+entityName)) {
                var ent = document.getElementById('Customers_'+entityName);
                ent.style.backgroundColor = 'Orange';
            }
            if (document.getElementById('Tables_'+entityName)) {
                var ent = document.getElementById('Tables_'+entityName);
                ent.style.backgroundColor = 'Orange';
            }
        }
    });
}


function createTicket(orders,ticketTable,ticketCustomer,callback){
    //var ticketID = 0;
    gql.EXEC(gql.addTicket(orders,ticketTable,ticketCustomer), function(response) {
        if (response.errors) {
            gql.handleError("createTicket", response.errors);
        } else {
            var ticketID = response.data.addTicket.id;
            if (document.getElementById('Customers_'+ticketCustomer)) {
                document.getElementById('Customers_'+ticketCustomer).style.backgroundColor = '';
                var tids = document.getElementById('Customers_'+ticketCustomer).getAttribute("ticketIDs");
                tids = (tids.length>0 ? tids+','+ticketID : ticketID);
                document.getElementById('Customers_'+ticketCustomer).setAttribute("ticketIDs",tids);
                document.getElementById('Customers_'+ticketCustomer).setAttribute("statusState",'New Orders');
                document.getElementById('Customers_'+ticketCustomer).setAttribute("class",'entityBtn statusState_New_Orders');
            }
            if (document.getElementById('Tables_'+ticketTable)) {
                document.getElementById('Tables_'+ticketTable).style.backgroundColor = '';
                var tids = document.getElementById('Tables_'+ticketTable).getAttribute("ticketIDs");
                tids = (tids.length>0 ? tids+','+ticketID : ticketID);
                document.getElementById('Tables_'+ticketTable).setAttribute("ticketIDs",tids);
                document.getElementById('Tables_'+ticketTable).setAttribute("statusState",'New Orders');
                document.getElementById('Tables_'+ticketTable).setAttribute("class",'entityBtn statusState_New_Orders');
            }
            refreshTicket();
            if (document.getElementById('selectCustomers')) {
                document.getElementById('selectCustomers').innerHTML = "Customer";
            }
            if (document.getElementById('selectTables')) {
                document.getElementById('selectTables').innerHTML = "Table";
            }
           ticketTable = '';
           ticketCustomer = '';
           spu.consoleLog('Created Ticket:'+ticketID);
           return callback(ticketID);
        }
    });
}

function refreshTicket(){
    gql.EXEC(gql.postTicketRefreshMessage('0'));
}

function updateCategories(){
    categoryIDs = [];
    gql.EXEC(gql.getMenuCategories(), function(response) {
        if (response.errors) {
            gql.handleError("updateCategories", response.errors);
        } else {
            var menuCategories = response.data.menuCategories;
            spu.consoleLog('updateCategories ('+menuCategories.length+')');

            var fastStuff = '';
            var catStuff = '';
            var firstNonFastCat = -1;
            
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
                }
                if (bgColor.indexOf("#")==0) {
                    bgColor = bgColor.substr(3,6);
                    var DL = darkOrLight(bgColor);
                    bgColor = "#" + bgColor;
                    var tColor = (DL=="light-text" ? "#FFFFFF" : "#000000");
                }
                //if (c==0) {
                if (c==firstNonFastCat) {
                    var categoryBGcolor = bgColor;
                }
                
                if (category.isFastMenu) {
                    //fastStuff += '<div class="catRow"><div id="c_'+catId+'" name="'+catName+'" value="'+catName+'" isFastMenu="'+menuCategories.isFastMenu+'" bgColor="'+bgColor+'" style="background-color:'+bgColor+';color:'+tColor+';" class="cBtn">';
                    updateMenuItems(menuCategories[c].name, bgColor, 1);
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
            //$('#menuFast').empty();
            //$('#menuFast').append(fastStuff);

            selectedCategoryId = 'c_'+menuCategories[firstNonFastCat].id;

            //updateMenuItems(menuCategories[0].name, categoryBGcolor, menuCategories[0].isFastMenu);
            //updateMenuItems(menuCategories[firstNonFastCat].name, categoryBGcolor, menuCategories[firstNonFastCat].isFastMenu);
            document.getElementById('c_'+menuCategories[firstNonFastCat].id).click();
        }
    });
}

function updateMenuItems(category, categoryBGcolor, categoryIsFastMenu){
    itemIDs = [];
    category = category.toString().replace(/\\r/g, " ");
    category = category.toString().replace(/&amp;/g, "&");
    categoryBGcolor = (typeof categoryBGcolor == 'undefined' ? '' : categoryBGcolor);
    
    var menuItemColumnCount = 5;

    gql.EXEC(gql.getMenuItems(category), function(response) {
        if (response.errors) {
            gql.handleError("updateMenuItems", response.errors);
        } else {                      
            spu.consoleLog('updateMenuItems:'+category+' ('+response.data.items.length+')');

            $('#menuItems').empty();

            for (var i=0; i<response.data.items.length; i++) {
                var item = response.data.items[i];
                var isFastMenu = categoryIsFastMenu;
                itemIDs.push(item.id);
                item.name = item.name.toString().replace(/\\r/g, " ");
                if (item.header!=null) {
                    item.header = item.header.toString().replace(/\\r/g, "<br />");
                    item.header = item.header.toString().replace(/<br>/g, "<br />");
                }

                if (item.color!=null) {
                    bgColor = item.color;
                } else {
                    if (categoryBGcolor!='') {
                        bgColor = categoryBGcolor;
                    } else {
                        bgColor = '#FF333333';
                    }
                }
                if (bgColor.indexOf("#")==0) {
                    if (bgColor.length>7) {
                        bgColor = bgColor.substr(3,6);
                    } else {
                        bgColor = bgColor.substr(1,6);
                    }
                    DL = darkOrLight(bgColor);
                    bgColor = "#" + bgColor;
                    tColor = (DL=="light-text" ? "#FFFFFF" : "#000000");
                }

                var itemButtonText = (item.header ? item.header : item.name);
                if (isFastMenu==1) {
                    $('#menuFast').append('<div class="menuItem"><div id="m_'+item.id+'" name="'+item.name+'" value="'+item.name+'" class="mBtn" style="background:'+bgColor+';color:'+tColor+';height:70px;" price="'+item.product.price+'">'+itemButtonText+'</div></div>');
                } else {
                    $('#menuItems').append('<div class="menuItem"><div id="m_'+item.id+'" name="'+item.name+'" value="'+item.name+'" class="mBtn" style="background:'+bgColor+';color:'+tColor+';" price="'+item.product.price+'">'+itemButtonText+'</div></div>');
                }
            }
            //});

            if (isFastMenu!=1) {
                var allElements = $('.menuItem'),
                WRAP_BY = menuItemColumnCount;
                for (var i = 0; i < allElements.length; i += WRAP_BY) {
                    //first loop, elements 0 : 15, next loop elements 15:30 and so on
                    allElements.slice(i, i + WRAP_BY).wrapAll('<div class="menuItemButtonRow" />');
                }
            }
            
        }
    });
}

function updateTicketOrders(){
    var ttl=0.00;
    $('#orders').empty();
    for (var o=0; o<orders.length; o++) {
        var order = orders[o];
        var orderId = order.id;
        var price = Number(order.price).toFixed(2);
        var orderLineTotal = Number(order.quantity * price).toFixed(2);
        var oStates = order.states;
        var stuff = '';
        stuff += '<div id="o_'+orderId+'_'+o+'" class="orderContainer" product="'+order.name+'" quantity="'+order.quantity+'" price="'+price+'" orderLineTotal="'+orderLineTotal+'" isSelected="0">';
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

function updateEntities(entityType, callback){
    gql.EXEC(gql.getEntities(entityType), function(response) {
        if (response.errors) {
            gql.handleError("updateEntities", response.errors);
        } else {
            spu.consoleLog('updateEntities:'+entityType+' ('+response.data.entities.length+')');
            // singular name of entityType
            var eType = entityType.substr(0,entityType.length-1);
            var ticketEntity = '';
            if (entityType=="Customers") {
                ticketEntity = ticketCustomer;
            }
            if (entityType=="Tables") {
                ticketEntity = ticketTable;
            }
            
            $('#'+entityType).empty();
            $('#'+entityType).append('<div id="'+entityType+'_BACK" name="BACK" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#000088;font-size:50px;">[ &lt; ]</div>');
            $('#'+entityType).append('<div id="'+entityType+'_NONE" name="NONE" entityType="'+entityType+'" state="" class="entityBtn" style="background-color:#880000;font-size:50px;">[ X ]</div>');

            jsonData = response.data.entities;
            jsonData = sortJSON(jsonData,"name",true);

            for (var e=0; e<response.data.entities.length; e++) {
                var entity = response.data.entities[e];

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
                        document.getElementById('select'+entityType).innerHTML = eType+"<br /><b style='color:#55FF55'>"+ticketEntity+"</b>";
                    }
                }

                $('#'+entityType).append('<div id="'+entityType+'_'+entity.name+'" name="'+entity.name+'" entityType="'+entityType+'" statusState="'+entity.statusState+'" ticketIDs="" class="entityBtn statusState_'+entity.statusStateClass+'"'+bgc+'>'+entity.name+'</div>');
            }


        }
    });

}

function amcButtons(mapping) {
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
        var btnStuff = '<div id="amc_'+btn["buttonID"]+'" name="'+btn["buttonName"]+'" class="buttonMain" style="background-color:'+btn["btnBGcolor"]+';color:'+btn["btnTextColor"]+'">'+btn["buttonHeader"]+'</div>';
        $('#'+mapping).append(btnStuff);
    }
}

