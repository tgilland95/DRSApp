import * as dao from './DataAccess.js'

export function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}

export async function getUserName() {
    // gets user object from DataAccess function
    let user = await dao.getCurrentUser();
    let userNameString = user.d.LoginName
    let userNameArr = userNameString.split('\\');
    let userName = userNameArr.slice(-1)[0]
    // parses the username and returns it
    return userName;
}

export async function getAdmins() {
    let adminObj = await dao.getAdmins()
    let adminList = adminObj.d.results
    let admins = []
    for (var i = 0; i < adminList.length; i++) {
        admins.push(adminList[i]['NetID'])
    }
    return admins
}

export async function getAllDepts() {
    let deptObject = await dao.getAllDepts()
    var results = deptObject.d.results
    if (results.length == 0) {
        $('#retention-dropdown').prop('disabled', true)
        return ['None', 'None']
    }
    var userDepts = []
    var nameLookup = {}
    for (var i = 0; i < results.length; i++) {
        var deptNum = results[i]['Department_x0020_Number']
        var deptName = results[i]['Department_x0020_Name']
        userDepts.push(deptNum)
        nameLookup[deptNum] = deptName
    }
    userDepts.sort()
    return [userDepts, nameLookup]
}

export async function getDepartments(userName) {
    // gets department object from DataAccess function
    let deptObject = await dao.getUserDepartments(userName)
    var results = deptObject.d.results;
    // the user isn't assigned to any departments
    if (results.length == 0) {
        var noDeptArr = ['None', 'None']
        $('#retention-dropdown').prop('disabled', true)
        return noDeptArr
    }
    // goes through result list and parses all depts, then adds them to userDepts array
    // allows for multiple entries of the same person
    var userDepts = []
    var nameLookup = {}
    for (var i = 0; i < results.length; i++) {
        var deptNum = results[i]['Department_x0020_Number']
        var deptName = results[i]['Department_x0020_Name']
        userDepts.push(deptNum)
        nameLookup[deptNum] = deptName
    }
    userDepts.sort()
    return [userDepts, nameLookup]
}

export async function getGeneralRetention() {
    let genRetentionObj = await dao.getGeneralRetention();
    var genRetention = genRetentionObj.d.results
    if (genRetention.length == 0) {
        return 'None'
    }
    return genRetention
}

export async function getRecordsByDept(dept) {
    let deptRecords = await dao.getDeptRecords(dept)
    var recordsList = deptRecords.d.results
    if (recordsList.length == 0) {
        return "None"
    }
    return recordsList
}

export async function getCommonRecords() {
    var commonRecords = await dao.getCommonRecords()
    var recordsList = commonRecords.d.results
    if (recordsList.length == 0) {
        return "None"
    }
    return recordsList
}

export async function getCompleteness() {
    let completenessObj = await dao.getCompleteness()
    var completeness = completenessObj.d.results
    return completeness
}

export async function updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, flag, newRepo, archival, vital, highlyConfidential) {
    await dao.updateRecord(itemID, newFunc, newType, newCatID, newCat, newRet, newCmtsPlan, newAdminMsg, flag, newRepo, archival, vital, highlyConfidential)
}

export async function updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, flag) {
    await dao.updateCommonRecord(itemID, newCmtsPlan, newAdminMsg, newRepo, archival, vital, highlyConfidential, flag)
}

export async function deleteRecord(row, id) {
    await dao.deleteRecord(row, id)
}

export async function messageRead(id) {
    await dao.messageRead(id)
}

export async function setDRS(id, drsComplete) {
    await dao.setDRS(id, drsComplete)
}

export async function setReview(id, reviewComplete) {
    await dao.setReview(id, reviewComplete)
}

export async function addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, flag) {
    await dao.addCommonRecord(dept, rowNum, tempCode, tempFunc, tempType, tempArch, flag)
}

export async function addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo) {
    await dao.addUniqueRecord(dept, code, recType, recFunc, recCat, adminMsg, commentsPlan, highlyConfidential, vital, archival, recRepo)
}

export async function getSize(dept) {
    let result = await dao.getSize(dept)
    if (result.d.results.length == 0) {
        return [0, -1]
    }
    else {
        var size = parseInt(result.d.results[0]["Unique_x0020_Code"])
        var itemID = result.d.results[0]["ID"]
        return [size, itemID]
    }
}

export async function updateSize(itemID, size) {
    await dao.updateSize(itemID, size)
}

export async function addSize(dept, size) {
    await dao.addSize(dept, size)
}

export async function getRepos() {
    let result = await dao.getRepos()
    return result.d.results
}
