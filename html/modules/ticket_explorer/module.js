////////////////////////////////
//
// nav_ticket_explorer
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');
    
    $('#TE_DisplayTicket').hide();
    TE_changeTicketExplorerFilters('REP_PeriodPicker');
}

$('#TE_Tickets').on('click', '.TE_TicketPreview', function(){

    var btn = this.id; // Employees_Jenery, Employees_Ovania, ...
    var btnName = btn.replace(/Tickets_/g,'');
    var ticketId = btn.replace(/Tickets_/g,'');
    spu.consoleLog('TE Ticket Clicked:'+btn+' ('+btnName+')');
    
    for (var e=0; e<TE_Tickets.length; e++) {
        var tkt = 'Tickets_' + TE_Tickets[e].uid;

        if (document.getElementById(tkt)) {
            document.getElementById(tkt).setAttribute('isSelected','0');
            document.getElementById(tkt).style.borderColor = '';
        }
    }
    
    TE_selectedTickets = [];
    
    if (document.getElementById(btn)) {
        var isSel = (document.getElementById(btn).getAttribute('isSelected') == '1' ? '0' : '1');
        document.getElementById(btn).setAttribute('isSelected',isSel);
        if (isSel == 1) {
            document.getElementById(btn).style.borderColor = '#FFBB00';
            for (var e=0; e<TE_Tickets.length; e++) {
                if (ticketId == TE_Tickets[e].id) {
                    TE_selectedTickets.push(ticketId);
                    break;
                }
            }
            spu.consoleLog('Selected TE Ticket: '+btnName);
            
            TE_displayTicketExplorerTicket(btnName);
            jumpTop();

        } else {
            document.getElementById(btn).style.borderColor = '';
            spu.consoleLog('DE-Selected TE Ticket: '+btnName);
            $('#TE_Ticket').empty();
        }
    }

});



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
    var fn = spu.fi(arguments);

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
            gql.handleError(fn+" gql.getTickets", response);
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
//    alert('execcmd1:'+name+'/'+value);
    if (inSambaPOS) {
        var name = 'HUB Display Ticket in SambaPOS';
        var value = $('#TicketExplorerTicket').attr('ticketId');
//        alert('execcmd2:'+name+'/'+value);
        spu.executeAutomationCommand(name,value);
    }
}
