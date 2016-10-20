<?php
$ra = $_SERVER["REMOTE_ADDR"];
$is4 = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) ? true : false;
$is6 = filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) ? true : false;

function dtr_pton( $ip ){
    if(filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)){
        return current( unpack( "A4", inet_pton( $ip ) ) );
    }
    elseif(filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)){
        return current( unpack( "A16", inet_pton( $ip ) ) );
    }
    throw new \Exception("Please supply a valid IPv4 or IPv6 address");
    return false;
}

$data = '{';
$data.= '"ra":"' . $ra . '"';
$data.= ',"v4":"' . ($is4 ? $ra : $ra) . '"';
$data.= ',"v6":"' . ($is6 ? dtr_pton($ra) : $ra) . '"';
$data.= '}';

$dObj = new StdClass();
$dObj->ra = $ra;
$dObj->v4 = ($is4 ? $ra : $ra);
$dObj->v6 = ($is6 ? dtr_pton($ra) : $ra);

//echo 'or:'.$data;
//
//// convert object => json
//echo 'en:'.json_encode($data);
//
//// convert json => object
//echo 'de:'.json_decode($data);

//print_r('pf:'.$data);

//print_r($data);
//echo json_encode($dObj);
echo $data;
?>