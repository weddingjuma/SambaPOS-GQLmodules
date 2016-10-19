<?php
$currentUser = $_SESSION['s_currentuser'];

if ($bypassauth) {
    $currentUser = 'Admin';
    $currentTerminal = 'Server';
}

// populate PHP vars for:
//
// $WPID
// $amcButtons
// $customReports
// $taskTypes
// $taskTypeCustomFields

include $bpath['inc'].('sambaposDBqueries.php');
?>

<!-- <script type="text/javascript" src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js'></script> -->
<script type="text/javascript" src='zjs/lib/jquery.min.js'></script>

<script type="text/javascript" src='zjs/lib/moment.min.js'></script>

<!-- <script src="http://crypto-js.googlecode.com/svn/tags/3.0.2/build/rollups/md5.js"></script> -->
<script type="text/javascript" src="zjs/lib/sha512.js"></script>

<!-- <script type="text/javascript" src='http://ajax.aspnetcdn.com/ajax/signalr/jquery.signalr-2.2.0.min.js'></script> -->
<script type="text/javascript" src='zjs/lib/jquery.signalr.min.js'></script>

<script type="text/javascript" src='zconfigs/config.js'></script>
<script type="text/javascript" src='zjs/globalvars.js'></script>
<script type="text/javascript" src='zjs/sputils.js'></script>
<script type="text/javascript" src='zjs/gqlqueries.js'></script>
<script type="text/javascript" src='zjs/zreportvars.js'></script>
<script type="text/javascript" src='zjs/zjscommon.js'></script>

<script type="text/javascript">

currentUser = '<?php echo $currentUser; ?>';

<?php
// write out JS vars for:
//
// amcBtns_ticketCommands
// amcBtns_orderCommands
// amcBtns_ticketRow1
// amcBtns_ticketRow2
// customReports
// taskTypes

include $bpath['inc'].('sambaposJSvars.php');
?>

</script>
