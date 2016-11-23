/* global spu, module, CD_welcomeMessage, CD_venueName, CD_ChangeDueTimeOut, getClientGMToffset, CD_openMessage, WPisOpen, CD_closedMessage, moment, dateFormats, paymentTypeName, processedAmount, changeAmount, tenderedAmount */

////////////////////////////////
//
// nav_customer_display
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');
    
    CD_clearDisplay();
}

function CD_clearDisplay() {
    spu.consoleLog('Clearing Customer Display...');

    $('#CD_orderContainer').hide();
    $('#CD_orders').hide();
    $('#CD_ticketTotalValue').hide();
    $('#CD_ticketDiscounts').hide();
    $('#CD_ticketHeader').hide();

    $("#CD_orders").empty();
    $('#CD_ticketTotalValue').empty();
    $('#CD_ticketDiscounts').empty();
    $('#CD_ticketHeader').empty();
    
    $('#CD_idle').show();
    
    var idlestuff = '';
    idlestuff += CD_welcomeMessage+'<br /><br /><span class="CD_venueName">'+CD_venueName+'</span>';
    idlestuff += '<br /><br /><br />';
    idlestuff += (WPisOpen ? CD_openMessage : CD_closedMessage);
    $('#CD_idle').html(idlestuff);
    $('#CD_idle').show();
}
var CD_clearDisplay_delayed = spu.debounce(CD_clearDisplay,CD_ChangeDueTimeOut);

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

        $('#CD_orderContainer').show();
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

//        $("#CD_orders").empty();
        $("#CD_orders").html(stuff);
//        $("#CD_orders").scrollTop($("#CD_orders")[0].scrollHeight);
        jumpBottom("#CD_orders");

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
