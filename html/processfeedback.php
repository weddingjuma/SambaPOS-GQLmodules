<?php
// the driver version depends on your SQL installation
// SQL Express 2012 is v10
// SQL Express 2014 is v11
// SQL Express 2016 is v12
//$driver = "{SQL Server Native Client 10.0}";
$driver = "{SQL Server Native Client 11.0}";

$myUser = "sa";
$myPass = "sambapos";
$myServer= "localhost\SQLEXPRESS";
$myDB= "SambaPOS5hh";
$connection_string = "DRIVER={SQL Server};SERVER=$myServer;DATABASE=$myDB";

//connection to MSSQL database
$dbhandle = odbc_connect("Driver=$driver;Server=$myServer;Database=$myDB;", $myUser, $myPass);

if (!$dbhandle) {
    $msg1 = "Couldn't connect to SQL Server on: $myServer";
    $msg2 = odbc_errormsg();
    THROWERROR($msg1,$msg2,$msg3,TRUE);
}


// get data from the URL
$ticketId    = $_GET['ticketId'];
$feedbackTag = $_GET['feedbackTag'];


// sanitize data as best we can to prevent Injection Attacks
$ticketId    = intval($ticketId); // convert to INT to prevent Injection Attacks
// only allow certain values, to prevent Injection Attacks
switch ($feedbackTag) {
    case 'positive':
    case 'negative':
    case 'neutral':
        break;
    default:
        $feedbackTag = 'None';
}

// perform the DB Update
$res = updateFeedbackTag($ticketId,$feedbackTag);
// the result of the function call will be returned to the caller through the following "echo" statement
// it should look something like this:
// {"ticketId":"14589","tag":"positive","dbResult":"","dbResultCount":"0","dbQuery":"UPDATE [Tickets] SET [TicketTags] = REPLACE([TicketTags], '{\"TN\":\"Feedback\",\"TT\":0,\"TV\":\"None\"}', '{\"TN\":\"Feedback\",\"TT\":0,\"TV\":\"positive\"}') WHERE [Id] = 14589"}
echo $res;





// this is the function that we fire just above, on "page load"
function updateFeedbackTag($ticketId,$feedbackTag) {
settype($ticketId, "integer");
settype($feedbackTag, "feedbackTag");

// we are looking specifically for this EXACT Ticket Tag
$oldTag = '{"TN":"Feedback","TT":0,"TV":"None"}';
settype($oldTag, "string");

$newTag = '{"TN":"Feedback","TT":0,"TV":"'.$feedbackTag.'"}';
settype($newTag, "string");

// build the query - this is the "unsafe" method
//$query = "UPDATE [Tickets] SET [TicketTags] = REPLACE([TicketTags], '" . $oldTag . "', '" . $newTag . "') WHERE [Id] = ".$ticketId;

// build the query - this is the "safe" method, using parameters and a PREPARED statement, which prevents Injection Attacks
$query = "UPDATE [Tickets] SET [TicketTags] = REPLACE([TicketTags], ?, CAST(? as varchar(200))) WHERE [Id] = ?";

// execute the query
$qparms = array($oldTag,$newTag,intval($ticketId));
$dbResult = ExecQueryP($query,$qparms);
$dbResultCount = count($dbResult);

//close DB connection
if ($dbhandle) {
    odbc_close($dbhandle);
}

// build result JSON to return
$result = '{"ticketId":"'.$ticketId.'","tag":"'.$feedbackTag.'","dbResult":"'.$dbResult.'","dbResultCount":"'.$dbResultCount.'","dbQuery":"'.str_replace('"','\"',$query).'"}';

// return the resule JSON
return $result;
}












// *******************************************************
// DBops Functions
// *******************************************************

function THROWERROR ($emsg1="",$emsg2="",$emsg3="",$halt=FALSE) {
    global $dbhandle;
    global $qparms;
    
    $err = 'FATAL';

    $emsg1 = str_replace('\\','\\\\',$emsg1);
    $emsg2 = str_replace('\\','\\\\',$emsg2);
    $emsg3 = str_replace('\\','\\\\',$emsg3);
    
    $emsg1 = str_replace('"','\"',$emsg1);
    $emsg2 = str_replace('"','\"',$emsg2);
    $emsg3 = str_replace('"','\"',$emsg3);
    
    if ($halt==TRUE) {
        //close DB connection
        if ($dbhandle) {
            odbc_close($dbhandle);
        }
        
        $errorMessage = '{"error":"'.$err.'","e1":"'.$emsg1.'","e2":"'.$emsg2.'","e3":"'.$emsg3.'"}';
        echo $errorMessage;
        die;
    }
}

function ExecQueryP($qry,$parmarray) {
    global $dbhandle;
    global $query;
    global $qparms;
    //global $qrydata;
    global $qryrowcount;
    $query=$qry;
    $qparms=$parmarray;
    
    //echo "QP:".$qparms.count($qparms);
    
    $qryresult="";
    //$qrydata="";
    //$qrydata=Array();
    $qryrowcount=0;
    $qryfieldcount=0;

    // prepare statement
    $pres = odbc_prepare($dbhandle, $query);

    if (!$pres) {
	$msg1="Could not prepare statement!";
        $msg2 ='QUERY:<br />'.$qry.'<br />';
        $msg3 ='QPARMS:<br />';
	for ($p=0; $p<count($qparms); $p++) {
            $msg3.=($p>0 ? '<br/>' : '') . $qparms[$p];
	}
        THROWERROR($msg1,$msg2,$msg3,TRUE);
    }

    $showQuery=false;
    if ($showQuery) {
        echo "<br />QUERY:<br />$query";
        echo "<br />QPARMS:<br />";
	for ($p=0; $p<count($qparms); $p++) {
            $msg2.=($p>0 ? '<br/>' : '') . $qparms[$p];
	}
        
    }
    
    // execute statement
    $qryresult = odbc_execute($pres,$qparms);
    $qryerror    = odbc_error();
    $qryerrormsg = odbc_errormsg();
    if ($qryerrormsg!='') {
        $msg1=$qryerror.' '.$qryerrormsg;
        $msg2 ='QUERY:<br />'.$qry.'<br />';
        $msg3 ='QPARMS:<br />';
	for ($p=0; $p<count($qparms); $p++) {
            $msg3.=($p>0 ? '<br/>' : '') . $qparms[$p];
	}
        THROWERROR($msg1,$msg2,$msg3,TRUE);
    }
    
    if (strpos($qry, 'INSERT')===FALSE && strpos($qry, 'DELETE')===FALSE && strpos($qry, 'UPDATE')===FALSE) {

	$ar="";
        $ar=array();
        //unset($ar);
        
        $qryfieldcount = odbc_num_fields($pres);
        //echo "fields:$qryfieldcount<br/>";
        
        while(odbc_fetch_row($pres)) {
            unset($ar);
            $ar="";
            $ar=array();
            for ($j = 1; $j <= $qryfieldcount; $j++) {       
                $field_name = odbc_field_name($pres, $j);
                //$ar[$field_name] = odbc_result($pres, $j);
                $ar[$field_name] = odbc_result($pres, $field_name);
                //echo $qryrowcount."]".$j."]".$field_name.":".$ar["$field_name"]."<br />\r\n";
                //echo "<pre><code>";print_r($ar);echo "</code></pre><br />";
                flush();
            }
            $qryrowcount++;
            $qrydata[$qryrowcount]=$ar;

            //echo "in:<br><pre><code>";print_r($qrydata);echo "</code></pre><br>";
        }
    }

    odbc_free_result($pres);
    
    //echo '<br />QResult:<pre><code>';print_r($qrydata);echo '</code></pre><br />';
    return $qrydata;
}
