import * as indexPage from './IndexPage.js'
import { getQueryStringParameter } from './Utils.js'

ExecuteOrDelayUntilScriptLoaded(init, "sp.js");

// global vars
var hostWebUrl = '';
var appWebUrl = '';
var deptParam = '';

function init() {
    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        // parses hostweb and appweb URLs from page URL
        hostWebUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
        appWebUrl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        deptParam = decodeURIComponent(getQueryStringParameter("dept"));
        // deptParam used so that reload of page shows same dept already selected
        if (deptParam == "undefined") {
            // main function that drives page - no dept was selected
            indexPage.run(hostWebUrl, appWebUrl, '')
        }
        else {
            // main function that drives page - a dept was already selected
            indexPage.run(hostWebUrl, appWebUrl, deptParam);
        }
    });
}
