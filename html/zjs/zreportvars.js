function getReportVars(reportName,callback) {
    
    var dataArray = [];
    
    //                           reportName,user,dateFilter,startDate,endDate,parameters
    gql.EXEC(gql.getCustomReport(reportName,currentUser), function rep(report){
        
        var report = report.data.report;
        var table = report.tables[0];
        var columns = table.columns;
        
        var rows = table.rows;
        var rowCount = rows.length;
        
        for (var r=0; r<rowCount; r++) {
            var row = rows[r];
            var cells = row.cells;
            var cellCount = cells.length;
            var dataRow = {};
            for (var c=0; c<cellCount; c++) {
                var dataName = columns[c].header;
                var dataValue = cells[c];
                
                switch (dataName) {
                    case 'Template':
                        var template = hex2string(dataValue);
                        template = template.replace(/\r\n/g,'LINEBREAK');
                        template = template.replace(/"/g,'\"');
                        // get columnCount and ColWidths
                        var headBeg = template.indexOf('[');
                        var headEnd = template.indexOf(']');
                        var head = template.substring(headBeg,headEnd+1);
                        var colStart = head.indexOf(':');
                        var cols = head.substr(colStart+1,(head.length-colStart-2));
                        var hasParms = (template.indexOf('$') > -1 ? '1' : '0');
                        dataRow.hasParms = hasParms;
                        dataRow.head = head;
                        dataRow.cols = cols;
                        dataRow.template = template;
                        break;
                    default:
                        dataRow[dataName] = dataValue;
                        break;
                }
            }

            dataArray.push(dataRow);
        }
        
        switch (reportName) {
            case 'Automation Commands':
                break;
            case 'PHP Custom Reports':
                break;
            case 'PHP Task Types':
                break;
            case 'PHP Task Type Custom Fields':
                break;
            case 'PHP Users':
                break;
            default:
                break;
        }
        
        if (callback) {
            callback(dataArray);
        }
    });
    
    return dataArray;
}