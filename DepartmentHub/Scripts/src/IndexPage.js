// imports
import * as dao from './DataAccess.js'
import * as util from './Utils.js'

// global vars
let deptParam
let depts
let deptNameLookup
let generalRetentionLookup
let genRetention
let generalFunctionLookup
let deptRecords
let itemIDLookup
let row
let initialCat
let initialUserCmts
let initialFunc
let repos
let commonRecordsList
let commonRetentionLookup
let commonFunctionLookup
let isAdmin
let completeness

/*
Initial function called by main.js
Tests to see if user is admin or not
Gets data from various lists
Makes lookup objects for later use
Calls 'populateTabs' to continue script
*/
export async function run(hWebUrl, aWebUrl, deptURLParam) {

    // flag used when populating Department Select
    isAdmin = false

    // initialize DataAccess object with hostweb and appweb URLs
    dao.init(hWebUrl, aWebUrl, deptURLParam)

    // if there is a department param on URL, copies it to deptParam
    deptParam = deptURLParam

    // gets current user and list of admins. if user is an admin, all depts retrieved, else only depts relevant to user
    let userName = await util.getUserName()
    let admins = await util.getAdmins()
    if (admins.indexOf(userName) != -1) {
        isAdmin = true
        let deptArr = await util.getAllDepts()
        depts = deptArr[0]
        deptNameLookup = deptArr[1]
    }
    else {
        let deptArr = await util.getDepartments(userName)
        depts = deptArr[0]
        deptNameLookup = deptArr[1]
    }

    // retrieves General Retention, Common Records, Repository, and Completeness lists
    genRetention = await util.getGeneralRetention()
    commonRecordsList = await util.getCommonRecords()
    repos = await util.getRepos()
    completeness = await util.getCompleteness()

    // maps used for value lookup
    generalRetentionLookup = {}
    generalFunctionLookup = {}
    commonRetentionLookup = {}
    commonFunctionLookup = {}

    // creates objects used to lookup values and populate drop-down lists when user submits unique record and updates unique record in 'Edit Details' dialog box
    for (var i = 0; i < genRetention.length; i++) {
        generalRetentionLookup[genRetention[i]['Record_x0020_Category']] = genRetention[i]['Retention_x0020_Description']
        var tempList
        if (genRetention[i]['Function'] in generalFunctionLookup) {
            tempList = generalFunctionLookup[genRetention[i]['Function']]
        }
        else {
            tempList = []
        }
        tempList.push(genRetention[i]['Record_x0020_Category_x0020_ID'] + ' - ' + genRetention[i]['Record_x0020_Category'])
        tempList.sort()
        generalFunctionLookup[genRetention[i]['Function']] = tempList
    }

    // creates objects used to lookup values when user adds common records
    for (var i = 0; i < commonRecordsList.length; i++) {
        commonRetentionLookup[commonRecordsList[i]['Code']] = commonRecordsList[i]['Retention_x0020_Description']
        commonFunctionLookup[commonRecordsList[i]['Code']] = commonRecordsList[i]['Function']
    }

    // if user is not listed as Dept Liaison for any dept, print out alert on each tab and end script
    if (depts == "None") {
        $('#dept-retention').html('</br><div class="alert alert-info" role="alert">You are not a part of any department</div>')
        $('#common-records').html('</br><div class="alert alert-info" role="alert">You are not a part of any department</div>')
        $('#unique-records').html('</br><div class="alert alert-info" role="alert">You are not a part of any department</div>')
        return
    }

    // like the name indicates, the tabs are populated
    populateTabs()
}

/*
Calls function to populate initial tab
Sets on-tab-change event to call respective function based on tab clicked
*/
function populateTabs() {

    // function to populate the first tab seen by user
    populateDeptRetentionTab()

    // adds on-click event when changing tabs - loads respective tab
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href")
        if (target == '#dept-retention') {
            populateDeptRetentionTab()
        }
        else if (target == '#common-records') {
            populateCommonRecordsTab()
        }
        else if (target == '#unique-records') {
            $('#finished').prop("disabled", "disabled")
            populateUniqueRecordsTab()
        }
    })
}

/*
Calls function to create modals
Loads drop-down list of depts based on if you are Record Liaison of one or multiple depts, or if you are an admin
*/
function populateDeptRetentionTab() {

    // divs to organize content in Dept Retention tab
    $('#dept-retention').html('<div id="dept-ret-dropdown"></div>')
    $('#dept-retention').append('<div id="dept-ret-table"></div>')
    $('#dept-retention').append('<div id="ret-table-alert"></div>')
    $('#dept-retention').append('<div id="dept-ret-buttons"></div>')
    $('#dept-retention').append('<div id="update-dialog" title="Update Record"></div>')

    // function which defines layout of 'Edit Details' modal and 'Delete' modal
    setModals()

    // if user is listed on Administrator list, all depts are viewable
    if (isAdmin) {
        var optionsStr = ''
        optionsStr += '<option disabled selected>Select a department</option>'
        for (var i = 0; i < depts.length; i++) {
            if (deptParam == depts[i]) {
                optionsStr += '<option value=' + depts[i] + ' selected>' + depts[i] + ' - ' + deptNameLookup[depts[i]] + '</option>'
            }
            else {
                optionsStr += '<option value=' + depts[i] + '>' + depts[i] + ' - ' + deptNameLookup[depts[i]] + '</option>'
            }
        }
        $('#retention-dropdown').html(optionsStr)

        // loads dept retention schedule if dept was previously selected and page reloaded, else alerts user to select a department
        if ($('#retention-dropdown option:selected').text() != 'Select a department') {
            loadRetentionSchedule(deptParam)
        }
        else {
            $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">Please select a department above</div>')
        }

        // when user selects dept, retention schedule is loaded for selected dept, and dept appended to URL to remember dept number on page reload
        $('#retention-dropdown').on('change', function () {
            var dept = $(this).val().slice(0, 3)
            var currentURL = location.href
            if (currentURL.indexOf('&dept=') != -1) {
                currentURL = currentURL.slice(0, -9)
            }
            location.replace(currentURL + '&dept=' + dept)
        })
    }

    // loads retention schedule immediately if user is liaison of only one department
    else if (depts.length == 1) {
        deptParam = depts[0]
        $('#retention-dropdown').html('<option value=' + deptParam + ' selected>' + deptParam + ' - ' + deptNameLookup[deptParam] + '</option>')
        loadRetentionSchedule(deptParam)
    }

    // populates drop-down list with depts of which user is a liaison and adds on-change event
    else {
        var optionsStr = ''
        optionsStr += '<option disabled selected>Select a department</option>'
        for (var i = 0; i < depts.length; i++) {
            if (deptParam == depts[i]) {
                optionsStr += '<option value=' + depts[i] + ' selected>' + depts[i] + ' - ' + deptNameLookup[depts[i]] + '</option>'
            }
            else {
                optionsStr += '<option value=' + depts[i] + '>' + depts[i] + ' - ' + deptNameLookup[depts[i]] + '</option>'
            }
        }

        // loads dept retention schedule if dept was previously selected and page reloaded, else alerts user to select a department
        $('#retention-dropdown').html(optionsStr)
        if ($('#retention-dropdown option:selected').text() != 'Select a department') {
            loadRetentionSchedule(deptParam)
        }
        else {
            $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">Please select a department above</div>')
        }

        // when user selects dept, retention schedule is loaded for selected dept, and dept appended to URL to remember dept number on page reload
        $('#retention-dropdown').on('change', function () {
            var dept = $(this).val().slice(0, 3)
            var currentURL = location.href
            if (currentURL.indexOf('&dept=') != -1) {
                currentURL = currentURL.slice(0, -9)
            }
            location.replace(currentURL + '&dept=' + dept)
        })
    }
}

/*
'Edit Details' and 'Delete' dialog boxes are formatted
The content for the text boxes and drop-down lists are added dynamically when clicked
*/
function setModals() {

    // the 'Edit Details' dialog box is formatted
    $('#dept-retention').append('<div id="myModal" class="modal fade" role="dialog"> \
                              <div class="modal-dialog"> \
                                <div class="modal-content"> \
                                  <div class="modal-header"> \
                                    <h4 class="modal-title">Edit</h4> \
                                  </div> \
                                  <div class="modal-body"> \
                                    <form class="form-horizontal"> \
                                      <div class="form-group" style="display:none"> \
                                        <label class="control-label col-sm-3" for="r-code">Code: </label> \
                                        <div class="col-sm-7"> \
                                          <input type="text" class="form-control" id="r-code" disabled> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-type">Record Type: </label> \
                                        <div class="col-sm-7"> \
                                          <input type="text" class="form-control" id="r-type"> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-func">Function: </label> \
                                        <div class="col-sm-7"> \
                                          <select class="form-control" id="r-func"></select> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-cat">Record Category: </label> \
                                        <div class="col-sm-7"> \
                                          <select class="form-control" id="r-cat" disabled></select> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-ret">Retention: </label> \
                                        <div class="col-sm-7"> \
                                          <textarea style="resize:none" class="form-control" id="r-ret" disabled></textarea> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-exc">Exception: </label> \
                                        <div class="col-sm-7"> \
                                          <textarea style="resize:none" class="form-control" id="r-exc" disabled></textarea> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="cmts-plan">Comments / Plan: </label> \
                                        <div class="col-sm-7"> \
                                          <textarea style="resize:none" class="form-control" id="cmts-plan"></textarea> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="admin-msg">Message to Administrator: </label> \
                                        <div class="col-sm-7"> \
                                          <textarea style="resize:none" class="form-control" id="admin-msg"></textarea> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="admin-cmts">Message from Administrator: </label> \
                                        <div class="col-sm-7"> \
                                          <textarea style="resize:none" class="form-control" id="admin-cmts" disabled></textarea> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="r-repo">Repository: </label> \
                                        <div class="col-sm-7"> \
                                          <select class="form-control" id="r-repo"></select> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <div style="padding-left: 11em"> \
                                          <label><input type="checkbox" value="" id="archival"> Archival</label> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <div style="padding-left: 11em"> \
                                          <label><input type="checkbox" value="" id="vital"> Vital</label> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <div style="padding-left: 11em"> \
                                          <label><input type="checkbox" value="" id="confidential"> Highly Confidential</label> \
                                        </div> \
                                      </div> \
                                      <div class="form-group"> \
                                        <label class="control-label col-sm-3" for="blank"></label> \
                                        <div class="col-sm-7"> \
                                          <span style="font-size: .75em; color:gray">*Changing function, category, or user comments to admin will set the record as pending and will require admin approval.</span>\
                                        </div> \
                                      </div> \
                                    </form> \
                                  </div> \
                                  <div class="modal-footer"> \
                                    <button type="button" class="btn btn-default" id="saveRecord">Save</button> \
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> \
                                  </div> \
                                </div> \
                              </div> \
                            </div>')

    // the 'Delete' dialog box is formatted
    $('#dept-retention').append('<div id="delete-modal" class="modal fade" role="dialog"> \
                              <div class="modal-dialog"> \
                                <div class="modal-content"> \
                                  <div class="modal-header"> \
                                    <h4 class="modal-title">Delete Record</h4> \
                                  </div> \
                                  <div class="modal-body"> \
                                    <h3>Are you sure you want to delete this record?</h3> \
                                    </br><h5>All user comments will be lost.</p> \
                                  </div> \
                                  <div class="modal-footer"> \
                                    <button type="button" class="btn btn-default" id="ok-delete">OK</button> \
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button> \
                                  </div> \
                                </div> \
                              </div> \
                            </div>')
}

/*
Checks if dept parameter has completed DRS / Annual Review to populate checkboxes
Adds on-click event to checkboxes to set/unset DRS Complete and Annual Review completed
Retreives records submitted by given dept
If no records exits, an alert appears
Formats table used to display records for user
Adds button to download pdf
Defines on-change and on-click events for buttons and drop-down lists
*/
async function loadRetentionSchedule(dept) {

    // retrieves all dept records for given dept
    deptRecords = await util.getRecordsByDept(dept)

    // searches through completeness list to find correct record based on Dept Number
    var element
    for (var i = 0; i < completeness.length; i++) {
        if (completeness[i]['Department_x0020_Number'] == dept) {
            element = i
            break
        }
    }

    // list id number of completeness record used to update record
    var theID = completeness[element]['ID']

    // checks DRS Complete / Annual Review Complete based on list data
    if (completeness[element]['DRS_x0020_Completed'] == 'Yes') {
        $('#DRS-complete-chkbx').prop('checked', true)
    }
    if (completeness[element]['Annual_x0020_Review_x0020_Comple'] == 'Yes') {
        $('#review-complete-chkbx').prop('checked', true)
    }

    // allows user to check/uncheck boxes
    $('#DRS-complete-chkbx').attr('disabled', false)
    $('#review-complete-chkbx').attr('disabled', false)

    // adds on-click event to set DRS Complete in Completeness list
    $('#DRS-complete-chkbx').click(function () {
        var drsComplete
        if ($(this).is(':checked')) {
            drsComplete = 'Yes'
        }
        else {
            drsComplete = 'No'
        }
        setDRS(theID, drsComplete)
    })

    // adds on-click event to set Annual Review Complete in Completeness list
    $('#review-complete-chkbx').click(function () {
        var reviewComplete
        if ($(this).is(':checked')) {
            reviewComplete = 'Yes'
        }
        else {
            reviewComplete = 'No'
        }
        setReview(theID, reviewComplete)
    })

    // alerts user if no records have been submitted for given department
    if (deptRecords == "None") {
        $('#dept-ret-table').empty()
        $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">No records have been identified for this department. \
                                                                                Please select the "Add Common Records" tab first to select \
                                                                                records found in your department. Then add records unique to your \
                                                                                department by selecting the "Add Unique Records" tab.</div>')
        return
    }

    // department has at least one record
    $('#ret-table-alert').empty()

    // retreives list data row by row from Dept Retention Schedule and adds each attribute to a new HTML row
    var tableRows = ''
    itemIDLookup = {}
    for (var i = 0; i < deptRecords.length; i++) {

        // unique ID we use to distinguish all records
        var code = deptRecords[i]['Code']

        // common record codes begin with C - flag to know if record is common or not
        var isCommon = false
        if (code.charAt(0) == 'C') {
            isCommon = true
        }
        var recCatID = deptRecords[i]['Record_x0020_Category_x0020_ID']
        var tempGenRec

        // iterates through General Retention to find corresponding record to get correct metadata
        for (var j = 0; j < genRetention.length; j++) {
            if (isCommon) {
                break
            }
            tempGenRec = genRetention[j]
            if (tempGenRec['Record_x0020_Category_x0020_ID'] == recCatID) {
                break
            }
        }
        itemIDLookup[code] = deptRecords[i]['ID']
        var recordType = deptRecords[i]['Record_x0020_Type']
        var recordFunction
        var recordCategory
        var retention

        // set vars to empty if no Record Category was chosen
        if (recCatID == null) {
            recCatID = ''
            recordFunction = ''
            recordCategory = ''
            retention = ''
        }
        else {

            // look up values from Common Records list if record is common
            if (code.charAt(0) == 'C') {
                retention = commonRetentionLookup[code]
                recordFunction = commonFunctionLookup[code]
                recordCategory = ''
            }

            // look up values from General Retention list if record is unique
            else {
                retention = tempGenRec['Retention_x0020_Description']
                recordCategory = tempGenRec['Record_x0020_Category']
                recordFunction = tempGenRec['Function']
            }
        }

        // retreives other values from Department Retention Schedule
        var exception = deptRecords[i]['Retention_x0020_Exception']
        if (exception == null) {
            exception = ''
        }
        var commentsPlan = deptRecords[i]['CommentsPlan']
        if (commentsPlan == null) {
            commentsPlan = ''
        }
        var status = deptRecords[i]['Status']
        var archival = deptRecords[i]['Archival']
        var vital = deptRecords[i]['Vital']
        var highlyConfidential = deptRecords[i]['Highly_x0020_Confidential']
        var repository = deptRecords[i]['Repository']
        var newMessage = deptRecords[i]['New_x0020_Message']

        // formats HTML rows to add to Dept Retention table
        tableRows += '<tr><td style="display:none">' + code + '</td>'
        tableRows += '<td style="display:none">' + recordFunction + '</td>'
        tableRows += '<td>' + recordType + '</td>'
        tableRows += '<td style="display:none">' + recCatID + '</td>'
        tableRows += '<td style="display:none">' + recordCategory + '</td>'
        tableRows += '<td>' + retention + '</td>'
        tableRows += '<td>' + exception + '</td>'
        tableRows += '<td>' + commentsPlan + '</td>'
        if (newMessage == 'Yes') {
            tableRows += '<td><button type="button" class="btn-xs btn-success editDetails">New Message</button></td>'
        }
        else {
            tableRows += '<td><button type="button" class="btn-xs btn-primary editDetails">Edit</button></td>'
        }
        tableRows += '<td><button type="button" class="btn-xs btn-primary deleteRecord">Delete</button></td>'
        tableRows += '<td>' + status + '</td>'
        tableRows += '<td style="display:none">' + archival + '</td>'
        tableRows += '<td style="display:none">' + vital + '</td>'
        tableRows += '<td style="display:none">' + highlyConfidential + '</td>'
        tableRows += '<td style="display:none">' + repository + '</td></tr>'
    }

    // defines HTML table and columns, and adds rows defined above
    $('#dept-ret-table').html('</br>')
    var tableStr = '<div style="overflow-x:scroll" width="1500px"><table class="table table-striped" id="pendingTable" style="width:100%"><thead><tr><th style="display:none">Code</th><th style="display:none">Function</th> \
                  <th>Record Type</th><th style="display:none">Category ID</th><th style="display:none">Record Category</th><th><div style="width:10em">Retention</div></th> \
                  <th><div style="width:10em">Exception</div></th><th><div style="width:10em">Comments / Plan</div></th><th></th><th></th><th>Status</th><th style="display:none">Archival</th> \
                  <th style="display:none">Vital</th><th style="display:none">Highly Confidential</th><th style="display:none">Repository</th></tr></thead><tbody>' + tableRows + '</tbody></table></br></div>'

    // adds table to div defined above, and adds download button below table
    $('#dept-ret-table').append(tableStr)
    $('#dept-ret-table').append('</br></br>')
    $('#dept-ret-buttons').empty()
    $('#dept-ret-buttons').append('<button type="button" class="btn-sm btn-primary pdf">Download</button>')

    // adds on-click event to Download button which creates PDF
    $('.pdf').click(function () {
        makePDF()
    })

    // adds on-change event to #r-cat value in 'Edit Details' dialog box
    $('#r-cat').on('change', function () {

        // extracts Record Category ID from #r-cat to find associated record in General Retention Schedule
        var newCatID = $(this).val().substring(0, 5)
        var tempRecord
        for (var i = 0; i < genRetention.length; i++) {
            tempRecord = genRetention[i]
            if (newCatID == tempRecord['Record_x0020_Category_x0020_ID']) {
                break
            }
        }

        // if the Record Category changes to empty string, set function and retention to empty string
        if ($('#r-cat').val() == '' || $('#r-cat').val() == null) {
            $('#r-func').val('')
            $('#r-ret').val('')
        }

        // else, get the associated Function and Retention and add them to the associated textboxes
        else {
            $('#r-func').val(tempRecord['Function'])
            $('#r-ret').val(tempRecord['Retention_x0020_Description'])
        }
    })

    // adds on-click function to 'Edit Details', populates it with associated table data, and adds buttons to Save or Cancel
    $('.editDetails').click(function () {

        // changes color and text of button if there is a message from the Admin
        if ($(this).attr('class') == 'btn-xs btn-success editDetails') {
            $(this).removeClass('btn-success')
            $(this).addClass('btn-primary')
            $(this)[0].innerText = 'Edit'
        }

        // changes global variable to row which was selected
        row = $(this).closest('tr')

        // empties out textboxes/drop-downs and disables drop-downs just in case the record is common
        $('#r-cat').empty()
        $('#r-repo').empty()
        $('#r-func').empty()
        $('#r-code').empty()
        $('#r-type').empty()
        $('#r-ret').empty()
        $('#r-cat').prop('disabled', 'disabled')
        $('#archival').prop('checked', false)
        $('#vital').prop('checked', false)
        $('#confidential').prop('checked', false)

        // removes alert if there is one, and displays dialog box
        $('#ret-table-alert').empty()
        $('#myModal').modal('show')

        // creates list of categories and category IDs for the dropdown, and sorts them
        var categoryList = []
        for (var i = 0; i < genRetention.length; i++) {
            categoryList.push(genRetention[i]['Record_x0020_Category_x0020_ID'] + ' - ' + genRetention[i]['Record_x0020_Category'])
        }
        categoryList.sort()

        // saves variables from table to compare with updated values upon submit
        var temp_id = $(this).closest('tr').children()[3].innerText
        var temp_func = $(this).closest('tr').children()[1].innerText
        var temp_repo = $(this).closest('tr').children()[14].innerText

        // loads values in dialog (if present in table)
        $('#r-code').val($(this).closest('tr').children()[0].innerText)
        $('#r-type').val($(this).closest('tr').children()[2].innerText)
        $('#r-ret').val($(this).closest('tr').children()[5].innerText)

        // creates options for function drop-down, and loads value in drop-down if record has a function defined
        var funcOptions = ''
        funcOptions += '<option disabled selected="selected">Select a function</option>'
        funcOptions += '<option></option>'
        var funcList = Object.keys(generalFunctionLookup)
        funcList.sort()
        for (var i = 0; i < funcList.length; i++) {
            if (temp_func == funcList[i]) {
                funcOptions += '<option selected="selected">'
            }
            else {
                funcOptions += '<option>'
            }
            funcOptions += funcList[i]
            funcOptions += '</option>'
        }
        $('#r-func').empty()
        $('#r-func').append(funcOptions)

        // creates options for repo drop-down, and loads value in drop-down if record has a repo defined
        var repoOptions = ''
        repoOptions += '<option disabled selected="selected">Select a repository</option>'
        for (var i = 0; i < repos.length; i++) {
            if (temp_repo == repos[i]['Repository']) {
                repoOptions += '<option selected="selected">'
            }
            else {
                repoOptions += '<option>'
            }
            repoOptions += repos[i]['Repository']
            repoOptions += '</option>'
        }
        $('#r-repo').empty()
        $('#r-repo').append(repoOptions)

        // checks table for archival, vital, and highly confidential - checks corresponding boxes accordingly
        var archival = $(this).closest('tr').children()[11].innerText
        var vital = $(this).closest('tr').children()[12].innerText
        var highlyConfidential = $(this).closest('tr').children()[13].innerText
        if (archival == 'Yes') {
            $('#archival').prop('checked', true)
        }
        if (vital == 'Yes') {
            $('#vital').prop('checked', true)
        }
        if (highlyConfidential == 'Yes') {
            $('#confidential').prop('checked', true)
        }

        // enables Record Category drop-down and populates it if Function has been selected
        if ($('#r-func').val() != 'Select a function' && $('#r-func').val() != '' && $('#r-func').val() != null) {
            $('#r-cat').prop('disabled', false)
            var catOptions = '<option selected="selected" disabled>Select a category</option><option></option>'
            for (var i = 0; i < generalFunctionLookup[temp_func].length; i++) {
                if (generalFunctionLookup[temp_func][i].substring(0, 5) == temp_id) {
                    catOptions += '<option selected="selected">'
                }
                else {
                    catOptions += '<option>'
                }
                catOptions += generalFunctionLookup[temp_func][i]
                catOptions += '</option>'
            }
            $('#r-cat').empty()
            $('#r-cat').append(catOptions)
        }

        // unsets flag used to notify user of admin message
        messageRead(itemIDLookup[$('#r-code').val()])

        // iterates through dept retention schedule for selected record
        var temp_record
        for (var i = 0; i < deptRecords.length; i++) {
            temp_record = deptRecords[i]
            if (temp_record['Code'] == $('#r-code').val()) {
                break
            }
        }

        // uses metadata from selected record to populate fields
        $('#r-exc').val(temp_record['Retention_x0020_Exception'])
        $('#cmts-plan').val(temp_record['CommentsPlan'])
        $('#admin-msg').val(temp_record['Message_x0020_To_x0020_Admin'])
        $('#admin-cmts').val(temp_record['Message_x0020_From_x0020_Admin'])

        // uses these values to check if Status needs to be set ot 'Pending'
        initialCat = $('#r-cat').val()
        initialUserCmts = $('#admin-msg').val()
        initialFunc = $('#r-func').val()

        // if common record, don't allow user to change Record Type, Category, or Function
        if ($(this).closest('tr').children()[0].innerText.charAt(0) == 'C') {
            $('#r-type').prop('disabled', true)
            $('#r-cat').prop('disabled', true)
            $('#r-func').prop('disabled', true)
        }
        // if unique record, allow user to change Record Type and Function
        else {
            $('#r-type').prop('disabled', false)
            $('#r-func').prop('disabled', false)
        }
    })

    // adds on-change event to function dropdown
    $('#r-func').change(function () {

        // empties retention and record category
        $('#r-ret').val('')
        $('#r-cat').empty()

        // if new function chosen is empty string, disable category drop-down and empty it
        if ($('#r-func').val() == '') {
            $('#r-cat').prop('disabled', true)
            $('#r-cat').val('')
            return
        }

        // new function chosen is not empty - make options for categories and add them to drop-down
        $('#r-cat').prop('disabled', false)
        var catOptions = '<option selected="selected" disabled>Select a category</option><option></option>'
        for (var i = 0; i < generalFunctionLookup[$('#r-func').val()].length; i++) {
            catOptions += '<option>'
            catOptions += generalFunctionLookup[$('#r-func').val()][i]
            catOptions += '</option>'
        }
        $('#r-cat').append(catOptions)
    })

    // adds on-click event to Save button on dialog box
    $('#saveRecord').click(function () {

        // retrieves all new values from dialog
        var itemID = itemIDLookup[$('#r-code').val()]
        var newFunc = $('#r-func option:selected').val()
        var newType = $('#r-type').val()
        var newCatID
        var newCat
        if ($('#r-cat option:selected').val() == 'Select a category' || $('#r-cat option:selected').val() == '' || $('#r-cat option:selected').val() == undefined) {
            newCatID = ''
            newCat = ''
        }
        else {
            newCatID = $('#r-cat option:selected').val().substring(0, 5)
            newCat = $('#r-cat option:selected').val().substring(8)
        }
        var newRet = $('#r-ret').val()
        var newCmtsPlan = $('#cmts-plan').val()
        var newAdminMsg = $('#admin-msg').val()
        var newRepo = $('#r-repo option:selected').val()
        var archival = 'No'
        var vital = 'No'
        var highlyConfidential = 'No'
        if ($('#archival').is(':checked')) {
            archival = 'Yes'
        }
        if ($('#vital').is(':checked')) {
            vital = 'Yes'
        }
        if ($('#confidential').is(':checked')) {
            highlyConfidential = 'Yes'
        }

        // if user added new message to admin, Status will be set to 'Pending'
        var notifyAdmin = 0
        if (($('#r-cat option:selected').val() != initialCat && $('#r-cat option:selected').val() != 'Select a category') || newAdminMsg != initialUserCmts || newFunc != initialFunc) {
            notifyAdmin = 1
        }

        // checks if record is common
        if ($('#r-code').val().charAt(0) == 'C') {

            // calls function to update common record, close modal, and end script
            $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">Processing...</div>')
            updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, notifyAdmin)
            $('#myModal').modal('hide')
            return
        }

        // calls function to update unique record and close modal
        $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">Processing...</div>')
        updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, notifyAdmin, newRepo, archival, vital, highlyConfidential)
        $('#myModal').modal('hide')
    })

    // adds on-click function to Delete button which opens modal and updates current row selected
    $('.deleteRecord').click(function () {
        $('#delete-modal').modal('show')
        row = $(this).closest('tr')
    })

    // adds on-click function to 'Ok' button in Delete modal
    $('#ok-delete').click(function () {

        // retrieves ID of the record, deletes the row, and closes the modal
        var id = itemIDLookup[row.children()[0].innerText]
        $('#ret-table-alert').html('</br><div class="alert alert-info" role="alert">Processing...</div>')
        deleteRecord(row, id)
        $('#delete-modal').modal('hide')
    })
}

/*
Creates a title, a heading, and table headers for a PDF document
Iterates through department records to populate table rows
Defines the PDF layout
Adds ability to download the PDF upon creation
*/
function makePDF() {

    // creates title, headers, and a heading for the PDF
    var titleString = '\nDepartment Retention Schedule for Dept# ' + deptParam + ' - ' + deptNameLookup[deptParam]
    var headers = [{ text: 'Record Type', style: 'tableHeader' }, { text: 'Retention', style: 'tableHeader' }, { text: 'Exception', style: 'tableHeader' }, { text: 'Archival', style: 'tableHeader' }, { text: 'Comments / Plan', style: 'tableHeader' }]
    var theBody = []
    var date = new Date()
    var dateStr = date.toDateString()
    theBody.push(headers)

    // iterates through rows of table to retrieve values - adds value to PDF row if not empty
    var rows = $('#dept-ret-table tr')
    for (var i = 1; i < rows.length; i++) {
        var tempRow = []
        var cells = $(rows[i])[0].childNodes
        if ($(cells)[2].innerText == '' || $(cells)[2].innerText == 'null' || $(cells)[2].innerText == null) {
            tempRow.push(' - ')
        }
        else {
            tempRow.push($(cells)[2].innerText)
        }
        if ($(cells)[5].innerText == '' || $(cells)[5].innerText == 'null' || $(cells)[5].innerText == null) {
            tempRow.push(' - ')
        }
        else {
            tempRow.push($(cells)[5].innerText)
        }
        if ($(cells)[6].innerText == '' || $(cells)[6].innerText == 'null' || $(cells)[6].innerText == null) {
            tempRow.push(' - ')
        }
        else {
            tempRow.push($(cells)[6].innerText)
        }
        if ($(cells)[11].innerText == 'Yes') {
            tempRow.push('Yes')
        }
        else {
            tempRow.push('No')
        }

        // Adds repo, vital, and highly confidential to Comments section if not empty/checked
        var comments = ''
        var hasComment = false
        var hasRepo = false
        var isVital = false
        var isConf = false
        if ($(cells)[7].innerText != '' && $(cells)[7].innerText != 'null' && $(cells)[7].innerText != null) {
            hasComment = true
            comments += $(cells)[7].innerText
        }
        if ($(cells)[14].innerText != '' && $(cells)[14].innerText != 'null' && $(cells)[14].innerText != null && $(cells)[14].innerText != 'Select a repository') {
            hasRepo = true
            if (hasComment) {
                comments += '\n'
            }
            if ($(cells)[14].innerText != 'Other (please specify in the Comments section)') {
                comments += 'Stored in: ' + $(cells)[14].innerText
            }
        }
        if ($(cells)[12].innerText == 'Yes') {
            isVital = true
            if (hasComment || hasRepo) {
                comments += '\n'
            }
            comments += 'Vital record'
        }
        if ($(cells)[13].innerText == 'Yes') {
            isConf = true
            if (hasComments || hasRepo || isVital) {
                comments += '\n'
            }
            comments += 'Highly Confidential'
        }
        if (!hasComment && !hasRepo && !isVital && !isConf) {
            tempRow.push(' - ')
        }
        else {
            tempRow.push(comments)
        }

        // adds PDF row to body object
        theBody.push(tempRow)
    }

    // document definition for PDF, adding in table body I created above
    var dd = {
        title: 'Department Retention Schedule',
        footer: function (currentPage, pageCount) {
            return { text: currentPage.toString() + ' of ' + pageCount, alignment: 'center' }
        },
        pageOrientation: 'landscape',
        content: [
            { text: 'University Records & Information Management\nDate Printed: ' + dateStr, style: 'header' },
            { text: titleString, style: 'title' },
            '\n\n',
            {
                columns: [
                    { width: '*', text: '' },
                    {
                        style: 'table',
                        width: 'auto',
                        table: {
                            widths: ['*', '*', 75, 30, '*'],
                            body: theBody
                        },
                        layout: 'lightHorizontalLines'
                    },
                    { width: '*', text: '' }
                ]
            },
        ],
        styles: {
            header: {
                fontSize: 10,
                margin: 5

            },
            title: {
                fontSize: 16,
                alignment: 'center'
            },
            table: {
                fontSize: 9
            },
            tableHeader: {
                fontSize: 9,
                bold: true
            }
        }
    }

    // after creation, PDF will be downloaded automatically
    pdfMake.createPdf(dd).download('DRS.pdf')
}

// deletes record based on ID passed in
async function deleteRecord(row, id) {
    await util.deleteRecord(row, id)
}

// updates unique record based on ID and metadata passed in
async function updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, flag, newRepo, archival, vital, highlyConfidential) {
    await util.updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, flag, newRepo, archival, vital, highlyConfidential)
}

// updates common record based on ID and metadata passed in
async function updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, flag) {
    await util.updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, flag)
}

// unsets flag which alerts user of new message from admin
async function messageRead(itemID) {
    await util.messageRead(itemID)
}

// sets/unsets flag which specifies if dept completed their DRS
async function setDRS(id, drsComplete) {
    await util.setDRS(id, drsComplete)
}

// sets/unsets flag which specifies if dept completed their Annual Review
async function setReview(id, reviewComplete) {
    await util.setReview(id, reviewComplete)
}

/*
*/
async function populateCommonRecordsTab() {
    // divs in department records tab
    $('#common-records').append('<div id="common-records-alert"></div>')
    $('#common-records').append('<div id="common-records-search"></div>')
    $('#common-records').append('<div id="common-table"></div>')
    $('#common-records').append('<div id="common-buttons"></div>')
    $('#common-records').append('<div id="add-common-dialog" title="Are you sure?"></div>')
    $('#common-records').append('<div id="delete-common-dialog" title="Are you sure?"></div>')

    if (depts.length > 1) {
        if ($('#retention-dropdown option:selected').text() != 'Select a department') {
            addCommonRecordsTable(deptParam)
        }
        else {
            $('#common-records-alert').html('</br><div class="alert alert-info" role="alert">Please select a department above</div>')
        }
    }
    else {
        addCommonRecordsTable(deptParam)
    }
}

async function addCommonRecordsTable(dept, searchTerm) {
    // uses REST API to retrieve all common records from hostweb
    deptRecords = await util.getRecordsByDept(dept)
    var deptIDList = []
    var idLookup = {}
    for (var i = 0; i < deptRecords.length; i++) {
        deptIDList.push(deptRecords[i]['Code'])
        idLookup[deptRecords[i]['Code']] = deptRecords[i]['ID']
    }
    var tableRows = ''
    // creates all rows for common records table
    for (var i = 0; i < commonRecordsList.length; i++) {
        tableRows += '<tr id="commonrow' + i + '"><td style="display:none">' + commonRecordsList[i]['Code'] + '</td>'
        if (deptIDList.indexOf(commonRecordsList[i]['Code']) > -1) {
            tableRows += '<td><input title="To delete a record, go to the Department Retention Schedule tab" type="checkbox" id="chkbx' + i + '" checked disabled></td>'
        }
        else {
            tableRows += '<td><input type="checkbox" id="chkbx' + i + '"></td>'
        }
        tableRows += '<td>' + commonRecordsList[i]['Function'] + '</td>'
        tableRows += '<td>' + commonRecordsList[i]['Record_x0020_Type'] + '</td>'
        tableRows += '<td>' + commonRecordsList[i]['Retention_x0020_Description'] + '</td>'
        var arch = commonRecordsList[i]['Archival']
        if (arch == 'No') {
            arch = ''
        }
        tableRows += '<td>' + arch + '</td></tr>'

    }
    // adds table to Common Records tab
    $('#common-table').empty()
    $('#common-table').html('</br><table class="table table-striped" id="common-table"><thead><tr><th style="display:none">Code</th><th>Select</th><th>Function</th><th>Record Type</th> \
                                <th>Retention Description</th><th>Archival</th></tr></thead><tbody>' + tableRows + '</tbody></table>')
    // adds buttons below
    addCommonSubmitButton(deptRecords, deptIDList, commonRecordsList.length, idLookup, dept)
}

function addCommonSubmitButton(deptRecords, deptIDList, length, idLookup, dept) {
    // adds buttons to Common Records tab below table
    $('#common-buttons').empty()
    $('#common-buttons').append('<div id="submit-alert"></div></br>')
    $('#common-buttons').append('<div class="btn-group"><button type="button" class="btn btn-primary" id="common-submit">Submit</button></div>')
    // adds events to button clicks
    $('#common-submit').click(function () {
        $('#submit-alert').html('')
        var addRows = []
        for (var i = 0; i < length; i++) {
            if ($('#commonrow' + i).find('input:checkbox')[0].checked) {
                if (deptIDList.indexOf($('#commonrow' + i).children()[0].innerText) == -1) {
                    addRows.push(i)
                }
            }
        }

        if (addRows.length > 0) {
            $('#submit-alert').html('')
            for (var i = 0; i < addRows.length; i++) {
                var rowNum = addRows[i]
                var tempCode = $('#commonrow' + rowNum).children()[0].innerText
                var tempFunc = $('#commonrow' + rowNum).children()[2].innerText
                var tempType = $('#commonrow' + rowNum).children()[3].innerText
                var tempRet = $('#commonrow' + rowNum).children()[4].innerText
                var tempArch = $('#commonrow' + rowNum).children()[5].innerText
                if (tempArch == '') {
                    tempArch = 'No'
                }
                $('#submit-alert').html('</br><div class="alert alert-info" role="alert">Processing...</div>')
                if (i == addRows.length - 1) {
                    addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, 1)
                }
                else {
                    addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, 0)
                }
            }
        }
        else {
            $('#submit-alert').html('<div class="alert alert-info" role="alert">There were no records selected to be added.</div>')
        }
    })
}

async function addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, flag) {
    await util.addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, flag)
}

function populateUniqueRecordsTab() {
    // adds divs for different parts of unique records tab
    $('#unique-records').append('<div id="unique-records-alert"></div>')
    $('#unique-records').append('<div id="unique-fields"></div>')
    $('#unique-records').append('<div id="unique-alert"></div>')
    $('#unique-records').append('<div id="unique-buttons"></div>')
    // user is a part of more than one department
    if (depts.length > 1) {
        if ($('#retention-dropdown option:selected').text() != 'Select a department') {
            addUniqueFields(deptParam)
        }
        else {
            $('#unique-records-alert').html('</br><div class="alert alert-info" role="alert">Please select a department above</div>')
        }
    }
    else {
        addUniqueFields(deptParam)
    }
}

async function addUniqueFields(dept) {
    deptRecords = await util.getRecordsByDept(dept)
    let result = await getSize(dept)
    var size = result[0]
    var itemID = result[1]
    $('#unique-fields').html('<div class="container">')
    var options = ''
    options += '<option disabled selected>Select a function</option>'
    options += '<option></option>'
    var funcList = Object.keys(generalFunctionLookup)
    funcList.sort()
    for (var i = 0; i < funcList.length; i++) {
        options += '<option>' + funcList[i] + '</option>'
    }
    var repoOptions = ''
    repoOptions += '<option disabled selected>Select a repository</option>'
    for (var i = 0; i < repos.length; i++) {
        repoOptions += '<option>' + repos[i]['Repository'] + '</option>'
    }

    $('#unique-fields').append('</br></br><form class="form-horizontal"> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="rec-type">Record Type: <span id="red-ast">*</span></label> \
                                  <div class="col-sm-8"> \
                                    <input type="text" class="form-control" id="rec-type" placeholder="Enter record type"> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="rec-func">Proposed Function:</label> \
                                  <div class="col-sm-8"> \
                                    <select class="form-control" id="rec-func"> \
                                      ' + options + ' \
                                    </select> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="rec-cat">Proposed Category:</label> \
                                  <div class="col-sm-8"> \
                                    <select class="form-control" id="rec-cat" disabled> \
                                    </select> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="retention">Proposed Retention:</label> \
                                  <div class="col-sm-8"> \
                                    <textarea class="form-control" id="retention" rows="2" style="resize:none" disabled></textarea> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="adminMsg">Message to Administrator:</label> \
                                  <div class="col-sm-8"> \
                                    <textarea class="form-control" id="adminMsg" rows="3" style="resize:none" placeholder="Type your message"></textarea> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="commentsPlan">Comments / Plan:</label> \
                                  <div class="col-sm-8"> \
                                    <textarea class="form-control" id="commentsPlan" rows="3" style="resize:none" placeholder="Type your comment"></textarea> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <label class="control-label col-sm-2" for="rec-repo">Repository: </label> \
                                  <div class="col-sm-8"> \
                                    <select class="form-control" id="rec-repo"> \
                                      ' + repoOptions + ' \
                                    </select> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <div style="padding-left: 15em"> \
                                    <label><input type="checkbox" value="" id="archival-chkbx"> Archival</label> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <div style="padding-left: 15em"> \
                                    <label><input type="checkbox" value="" id="vital-chkbx"> Vital</label> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <div style="padding-left: 15em"> \
                                    <label><input type="checkbox" value="" id="confidential-chkbx"> Highly Confidential</label> \
                                  </div> \
                                </div> \
                                <div class="form-group"> \
                                  <div style="padding-left: 8em"><span display="inline-block" id="red-ast">*</span> means required field</div> \
                                </div> \
                              </form>')

    $('#rec-func').change(function () {
        $('#retention').val('')
        $('#rec-cat').empty()
        if ($('#rec-func').val() == '') {
            $('#rec-cat').val('')
            $('#rec-cat').prop('disabled', true)
            return
        }
        else {
            var catOptions = '<option>Select a category</option><option></option>'
            for (var i = 0; i < generalFunctionLookup[$('#rec-func').val()].length; i++) {
                catOptions += '<option>'
                catOptions += generalFunctionLookup[$('#rec-func').val()][i]
                catOptions += '</option>'
            }
            $('#rec-cat').append(catOptions)
            $('#rec-cat').prop('disabled', false)
        }
    })

    $('#rec-cat').change(function () {
        var index = $('#rec-cat').val().indexOf('-')
        var category = $('#rec-cat').val().substring(index + 2)
        $('#retention').val(generalRetentionLookup[category])
    })

    addUniqueSubmit(dept, size, itemID)
}

function addUniqueSubmit(dept, size, itemID) {
    $('#unique-buttons').empty()
    $('#unique-buttons').append('<div align="center"><button type="button" class="btn btn-primary" id="unique-submit">Submit</button> \
    &ensp;<button type="button" class="btn btn-primary" id="finished" disabled>Finished</button></div>')
    $('#unique-buttons').append('\n\n\n\n\n')
    // adds event handlers to buttons
    $('#unique-submit').click(function () {
        $('#unique-alert').empty()
        if ($('#rec-type').val() == '') {
            $('#unique-alert').html('</br><div class="alert alert-warning" role="alert">Record Type cannot be left blank</div>')
            setTimeout(function () { $('#unique-alert').empty() }, 5000)
            return
        }
        var recRepo = $('#rec-repo option:selected').val()
        if (recRepo == 'Select a repository') {
            recRepo = ''
        }
        var recFunc = $('#rec-func option:selected').val()
        if (recFunc == 'Select a function') {
            recFunc = ''
        }
        var recType = $('#rec-type').val()
        var recCat
        if ($('#rec-cat option:selected').val() == '' || $('#rec-cat option:selected').val() == null) {
            recCat = ''
        }
        else {
            recCat = $('#rec-cat option:selected').val().substring(0, 5)
        }
        var adminMsg = $('#adminMsg').val()
        var commentsPlan = $('#commentsPlan').val()
        $('#finished').prop('disabled', false)
        var archival = 'No'
        var vital = 'No'
        var highlyConfidential = 'No'
        if ($('#archival-chkbx').is(':checked')) {
            archival = 'Yes'
        }
        if ($('#vital-chkbx').is(':checked')) {
            vital = 'Yes'
        }
        if ($('#confidential-chkbx').is(':checked')) {
            highlyConfidential = 'Yes'
        }

        var code = 'U' + size
        $('#unique-alert').html('</br><div class="alert alert-info" role="alert">Processing...</div>')
        addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo)
        size++
        if (itemID == -1) {
            addSize(dept, size.toString())
        }
        else {
            updateSize(itemID, size.toString())
        }
    })

    $('#finished').click(function () {
        location.reload()
    })
}

async function getSize(dept) {
    return await util.getSize(dept)
}

async function updateSize(itemID, size) {
    await util.updateSize(itemID, size)
}

async function addSize(dept, size) {
    await util.addSize(dept, size)
}

async function addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo) {
    await util.addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo)
}
