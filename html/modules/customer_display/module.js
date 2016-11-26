/* global spu, module, CD_welcomeMessage, CD_venueName, CD_ChangeDueTimeOut, getClientGMToffset, CD_openMessage, WPisOpen, CD_closedMessage, moment, dateFormats, paymentTypeName, processedAmount, changeAmount, tenderedAmount, CD_enableFeedback */

////////////////////////////////
//
// nav_customer_display
//
////////////////////////////////
spu.consoleLog('Loading Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

function init_module() {
    spu.consoleLog('Initializing Module JS for: '+module.replace(/_/,' ').toUpperCase()+' ...');

    $('#CD_watermark').html(CD_venueName);

    $('#CD_feedbackQuestion').html(CD_feedbackQuestion);
    
    var buttons = '';
    
    for (var b=0; b<CD_feedbackButtons.length; b++) {
        var button = CD_feedbackButtons[b];
        
        for (var key in button) {
            var attrName = key;
            var attrValue = button[key];
            if (attrName==='tag') {
                var tag = attrValue;
            } else {
                var buttonId = attrName;
                var buttonCaption = attrValue;
            }
        }
        
        buttons += '<div id="CD_feedbackButton_'+buttonId+'"';
        buttons += ' class="inputButton"';
        buttons += ' onClick="CD_processFeedback(\''+buttonId+'\')">';
        buttons += buttonCaption;
        buttons += '</div>';
    }
    $('#CD_feedbackButtons').html(buttons);

    $('#CD_feedback').hide();
    
    var idlestuff = '';
    idlestuff += '<br />'+CD_welcomeMessage+'<br />';
    idlestuff += '<br /><span class="CD_venueName">'+CD_venueName+'</span>';
    idlestuff += '<br /><br /><br />';
    idlestuff += (WPisOpen ? CD_openMessage : CD_closedMessage);
    $('#CD_idle').html(idlestuff);
    $('#CD_idle').show();
    
    CD_clearDisplay();
}

function CD_clearDisplay(ticketId) {
    var fn = spu.fi(arguments);
    
    spu.consoleLog('Clearing Customer Display...');

    $('#CD_ticketHeader').hide();
    $('#CD_ticketTotalValue').hide();
    $('#CD_ticketDiscounts').hide();

//    $('#CD_feedback').hide();
    $('#CD_orderContainer').hide();
    $('#CD_orders').hide();
    
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

        var ticketDate = moment(ticketData.date, dateFormats).add(offsetHours,'hours').format('YYYY-MM-DD HH:mm');

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

        for (var o=ticketData.orders.length-1; o>-1; o--) { // show newest Orders first, oldest last
//        for (var o=0; o<ticketData.orders.length; o++) { // show oldest Orders first, newest last
            var order = ticketData.orders[o];
            orderUID++;
            order.orderUID = orderUID;
            var price = Number(order.price).toFixed(2);
            order.priceTotal = (Number(order.quantity) * Number(order.price));
            var orderQuantity = Number(order.quantity).toFixed(0);

            var portion = (order.portion!='Normal' ? '<span style="color:#00AAEE;font-size:16px;"> ('+order.portion+')</span>' : '');

            stuff += '<div class="CD_order'+(o===(ticketData.orders.length-1) ? ' CD_orderNewest' : '')+'">';
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
            //stuff += '<div class="CD_orderState">'+oStates+'</div>';

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

            stuff += '</div>';

            savingsttl = (Number(discountttl) + Number(giftttl));
        }

        $("#CD_orders").html(stuff);
        
        // if listing oldest Orders First (newest last), uncomment these lines
        // if listing newsest Orders First (oldest last), comment-out these lines
//        $("#CD_orders").scrollTop($("#CD_orders")[0].scrollHeight);
//        jumpBottom("#CD_orders");


        var headerstuff = '';
        headerstuff += '<div id="ticket_'+ticketData.id+'">';
        headerstuff += '<div class="CD_paymentLine">';
        headerstuff += '<div class="CD_paymentLabel">';
        headerstuff += ticketDate+' ';
        headerstuff += (ticketData.number ? '<b>#'+ticketData.number+'</b>' : '');
        headerstuff += (ticketData.number ? ' <span style="font-size:small;">(Id:'+ticketData.id+')</span>' : '');
        headerstuff += '</div>';
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
        paystuff += '<div class="CD_paymentLine"><div class="CD_paymentLabel">OWING: </div><div class="CD_paymentAmt">'+(Number(remainingAmount)<0 ? '-' : remainingAmount)+'</div></div>';
        paystuff += (changeAmount>0 ? '<div class="CD_paymentLine"><div class="CD_paymentLabel">CHANGE: </div><div class="CD_paymentAmt">'+(Number(changeAmount)>0 ? changeAmount : '-')+'</div></div>' : '');
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
//            $('#CD_watermark').hide();
        } else {
            $('#CD_ticketDiscounts').hide();
//            $('#CD_watermark').show();
        }
        
        if (Number(remainingAmount)<=0) {
            CD_showFeedbackScreen(ticketData.id,Number(remainingAmount),totalAmount);
        }
        
        
        //spu.consoleLog(evContent);
        spu.consoleLog(ticketData);
    } else {
        spu.consoleLog('No ticketData to display !!!');
    }
}

function CD_getTicket(ticketId, callback) {
    var fn = spu.fi(arguments);
    
    gql.EXEC(gql.getTicket(ticketId), function gt(response){
        if (response.errors) {
            gql.handleError(fn+' gql.getTicket',response);
        } else {
            var ticket = response.data.ticket;
            if (ticket!==null) {
                ticketId = ticket.id;
            } else {
                ticketId = 0;
            }
            if (ticketId>0) {
                var ticketFeedback = '';
                for (var t=0; t<ticket.tags.length; t++) {
                    var tag = ticket.tags[t];
                    if (tag.tagName=='Feedback') {
                        ticketFeedback = tag.tag;
                    }
                }
//                if (ticketFeedback=='' || ticketFeedback=='None') {
//                    $('#CD_orderContainer').hide();
//                    $('#CD_feedback').show();
//                }

            }
            if (callback) {
                callback(ticket);
            }
        }
    });
}
function CD_showFeedbackScreen(ticketId,remAmount,totAmount) {
    var fn = spu.fi(arguments);
    
    ticketId = ticketId ? ticketId : 0;

    // amount supplied by Event
    remAmount = typeof remAmount!=='undefined' ?  remAmount : 1;
    // amount supplied by Event
    totAmount = typeof totAmount!=='undefined' ?  totAmount : 0;
    // amount to be supplied by getTicket()
    var remainingAmount = 1;
    
    spu.consoleLog('Showing Feedback Screen ('+ticketId+') ['+remAmount+'/'+totAmount+'] ... ' + CD_enableFeedback);
    
//    $('#CD_feedback').hide();
    
    if (ticketId>0 && CD_enableFeedback) {

        CD_getTicket(ticketId, function gt(tData){
            var ticket = tData;
            if (ticket!==null) {
                ticketId = ticket.id;
                CD_FeedbackTicketId = ticketId;
                remainingAmount = ticket.remainingAmount;
            } else {
                ticketId = 0;
            }
            if (ticketId>0) {
                var ticketFeedback = '';
                for (var t=0; t<ticket.tags.length; t++) {
                    var tag = ticket.tags[t];
                    if (tag.tagName=='Feedback') {
                        ticketFeedback = tag.tag;
                    }
                }
                if ((remainingAmount<=0 || remAmount<=0) && (ticketFeedback=='' || ticketFeedback=='None')) {
                    $('#CD_feedback').show();
                    $('#CD_orderContainer').hide();
                }
            }
        });

    } else {
        spu.consoleLog('Hiding Feedback Screen ('+ticketId+') ['+remAmount+'/'+totAmount+'] ... ' + CD_enableFeedback);
        $('#CD_feedback').hide();
    }
}

function CD_processFeedback(choice) {
    var fn = spu.fi(arguments);
    
    var feedbackChoice = choice ? choice : -1;
    var ticketId = CD_FeedbackTicketId;

    spu.consoleLog(ticketId+':'+feedbackChoice);
    
//    $.get(webUrl+'/processfeedback.php?ticketId='+ticketId+'&feedbackTag='+feedbackChoice, function(data){
//        var d = JSON.parse(data);
//        spu.consoleLog(d.ticketId +':'+ d.tag);
//        spu.consoleLog(d.dbResult);
//        spu.consoleLog(d.dbResultCount);
//    });
    
    $.ajax(
        {
        url: 'processfeedback.php?ticketId='+ticketId+'&feedbackTag='+feedbackChoice
        ,success: function(data) {
            CD_FeedbackTicketId = 0;
            spu.consoleLog(data);
            var d = JSON.parse(data);
            var tag = d.tag;
            if (d.error) {
                var errhtml = '<div style="text-align:left;font-size:14px;font-weight:normal;color#FFFFFF;">';
                errhtml += d.error+'<br /><br />'+d.e1+'<br /><br />'+d.e2+'<br />'+d.e3;
                errhtml += '</div>';
                $('#CD_feedbackQuestion').html(errhtml);
            } else {
                $('#CD_feedbackQuestion').html(CD_feedbackThanks);
            }
            $('#CD_feedbackButtons').hide();
            
            setTimeout(function(){
                $('#CD_feedback').hide();
                $('#CD_feedbackQuestion').html(CD_feedbackQuestion);
                $('#CD_feedbackButtons').show();
                $('#CD_idle').show();
            },5000);
        }
        ,error: function(jqXHR, exception, data) {
            CD_FeedbackTicketId = 0;
            var errorstuff = jqXHR +'<br/><br/>'+ exception +'<br/><br/>'+ data;
            $('CD_feedbackQuestion').html('<div style="font-size:14px;font-weight:normal;color:#FF2222;">'+errorstuff+'</div>');
            $('#CD_feedbackButtons').hide();
        }
    });
	   
     return false; // this is so the browser doesn't follow the link
}
