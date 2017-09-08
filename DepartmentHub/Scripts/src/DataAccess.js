var hostWebUrl = ''
var appWebUrl = ''
var deptParam = ''

export function init(hWebUrl, aWebUrl, deptURLParam) {
    hostWebUrl = hWebUrl;
    appWebUrl = aWebUrl;
    deptParam = deptURLParam;
}

export function getCurrentUser() {
    return $.ajax({
        url: "../_api/web/currentuser?$select=*",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getAdmins() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Administrators')/items?" +
                "@target='" + hostWebUrl + "'",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getSize(dept) {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Unique Codes')/items?@t" +
                "arget='" + hostWebUrl + "'&$filter=Department_x0020_Number eq '" + dept + "'",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getRepos() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Repositories')/items?@t" +
                "arget='" + hostWebUrl + "'&$select=Repository",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getAllDepts() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Completeness" +
                "')/items?@target='" + hostWebUrl + "'&$select=*&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getGeneralRetention() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('General Retention Sched" +
                "ule')/items?@target='" + hostWebUrl + "'&$select=*&$orderby=Function,Record_x0020_Category_x0020_ID&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getUserDepartments(userName) {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Information'" +
                ")/items?@target='" + hostWebUrl + "'&$filter=Record_x0020_Liaison_x0020_Net_x eq '" + userName + "'&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getCommonRecords() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Common Records')/items?" +
                "@target='" + hostWebUrl + "'&$select=*&$orderby=Function,Record_x0020_Type&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getCompleteness() {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Completeness" +
                "')/items?@target='" + hostWebUrl + "'&$select=*&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function getDeptRecords(dept) {
    return $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items?@target='" + hostWebUrl + "'&$filter=Department_x0020_Number eq '" + dept + "'&$orderby=Record_x0020_Type&$top=1000",
        method: "GET",
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    })
}

export function updateSize(itemID, size) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Unique_x0020_CodesListItem"
        },
        "Unique_x0020_Code": size
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Unique Codes')/items(" + itemID + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json; odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            return
        }
    })
}

export function setDRS(id, drsComplete) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Department_x0020_CompletenessListItem"
        },
        "DRS_x0020_Completed": drsComplete
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Completeness" +
                "')/items(" + id + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            return
        },
        failure: function () {
            return
        }
    })
}

export function setReview(id, reviewComplete) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Department_x0020_CompletenessListItem"
        },
        "Annual_x0020_Review_x0020_Comple": reviewComplete
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Completeness" +
                "')/items(" + id + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            return
        },
        failure: function () {
            return
        }
    })
}

export function messageRead(itemID) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
        },
        "New_x0020_Message": "No"
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items(" + itemID + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            return
        },
        failure: function () {
            return
        }
    })
}

export function updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, flag, newRepo, archival, vital, highlyConfidential) {
    var data
    if (flag == 1) {
        data = {
            "__metadata": {
                "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
            },
            "Function": newFunc,
            "Record_x0020_Type": newType,
            "Record_x0020_Category_x0020_ID": newCatID,
            "CommentsPlan": newCmtsPlan,
            "Message_x0020_To_x0020_Admin": newAdminMsg,
            "Status": "Pending",
            "Repository": newRepo,
            "Archival": archival,
            "Vital": vital,
            "Highly_x0020_Confidential": highlyConfidential
        }
    } else {
        data = {
            "__metadata": {
                "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
            },
            "Function": newFunc,
            "Record_x0020_Type": newType,
            "Record_x0020_Category_x0020_ID": newCatID,
            "CommentsPlan": newCmtsPlan,
            "Message_x0020_To_x0020_Admin": newAdminMsg,
            "Repository": newRepo,
            "Archival": archival,
            "Vital": vital,
            "Highly_x0020_Confidential": highlyConfidential
        }
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items(" + itemID + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            location.reload()
        },
        failure: function () {
            $('#ret-table-alert').html('</br><div class="alert alert-warning" role="alert">Server error. Record not upda' +
                    'ted.</div>')
        }
    })
}

export function updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, flag) {
    var data
    if (flag == 1) {
        data = {
            "__metadata": {
                "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
            },
            "CommentsPlan": newCmtsPlan,
            "Message_x0020_To_x0020_Admin": newAdminMsg,
            "Repository": newRepo,
            "Archival": archival,
            "Vital": vital,
            "Highly_x0020_Confidential": highlyConfidential,
            "Status": "Pending"
        }
    } else {
        data = {
            "__metadata": {
                "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
            },
            "CommentsPlan": newCmtsPlan,
            "Message_x0020_To_x0020_Admin": newAdminMsg,
            "Repository": newRepo,
            "Archival": archival,
            "Vital": vital,
            "Highly_x0020_Confidential": highlyConfidential
        }
    }

    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items(" + itemID + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "MERGE",
            "If-Match": "*"
        },
        success: function () {
            location.reload()
        },
        failure: function () {
            $('#ret-table-alert').html('</br><div class="alert alert-warning" role="alert">Server error. Record not upda' +
                    'ted.</div>')
        }
    })
}

export function deleteRecord(row, itemID) {
    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items(" + itemID + ")?@target='" + hostWebUrl + "'",
        method: "POST",
        headers: {
            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            "X-HTTP-Method": "DELETE",
            "If-Match": "*"
        },
        success: function () {
            location.reload()
        },
        failure: function () {
            $('#ret-table-alert').html('</br><div class="alert alert-warning" role="alert">Server error. Record not dele' +
                    'ted.</div>')
        }
    })
}

export function addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
        },
        "Department_x0020_Number": dept,
        "Code": code,
        "Function": recFunc,
        "Record_x0020_Type": recType,
        "Record_x0020_Category_x0020_ID": recCat,
        "CommentsPlan": commentsPlan,
        "Message_x0020_To_x0020_Admin": adminMsg,
        "Highly_x0020_Confidential": highlyConfidential,
        "Vital": vital,
        "Archival": archival,
        "Repository": recRepo,
        "Status": "Pending"
    }
    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function () {
            $('#rec-type').val('')
            $('#rec-func').val('Select a function')
            $('#rec-cat').val('Select a category')
            $('#retention').val('')
            $('#adminMsg').val('')
            $('#commentsPlan').val('')
            $('#confidential-chkbx').prop('checked', false)
            $('#vital-chkbx').prop('checked', false)
            $('#archival-chkbx').prop('checked', false)
            $('#unique-alert').html('</br><div class="alert alert-success" role="alert">Record added!</div>')
            setTimeout(function () {
                $('#unique-alert').empty()
            }, 1500)
        },
        failure: function () {
            $('#unique-alert').html('</br><div class="alert alert-warning" role="alert">Server error. Record not adde' +
                    'd.</div>')
            setTimeout(function () {
                $('#unique-alert').empty()
            }, 2500)
        }
    })
}

export function addSize(dept, size) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Unique_x0020_CodesListItem"
        },
        "Department_x0020_Number": dept,
        "Unique_x0020_Code": size
    }
    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Unique Codes')/items?@t" +
                "arget='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function () {
            return
        }
    })
}

export function addCommonRecord(dept, rowNum, code, func, type, arch, flag) {
    var data = {
        "__metadata": {
            "type": "SP.Data.Department_x0020_Retention_x0020_ScheduleListItem"
        },
        "Department_x0020_Number": dept,
        "Code": code,
        "Function": func,
        "Record_x0020_Type": type,
        "Record_x0020_Category_x0020_ID": 'common',
        "Status": "Approved",
        "Archival": arch,
        "Vital": "No",
        "Highly_x0020_Confidential": "No"
    }
    $.ajax({
        url: "../_api/SP.AppContextSite(@target)/web/lists/getbytitle('Department Retention Sc" +
                "hedule')/items?@target='" + hostWebUrl + "'",
        method: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(data),
        headers: {
            "accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function () {
            $('#submit-alert').html('</br><div class="alert alert-success" role="alert">Records updated!</div>')
            $('#chkbx' + rowNum).attr('disabled', true)
            if (flag == 1) {
                location.reload()
            }
        },
        failure: function () {
            $('#submit-alert').html('</br><div class="alert alert-warning" role="alert">Server error. Records not upd' +
                    'ated.</div>')
            setTimeout(function () {
                $('#submit-alert').empty()
            }, 2500)
        }
    })
}
