<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css" />
    <link rel="stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/build/main.bundle.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.20/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.20/vfs_fonts.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Department Retention Schedule <span id="forWord"></span><div id="title"></div>
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">
    <br />
    <br />
    <div style="padding-left:18%">For help, please call 801-422-2828.</div>
    <a style="padding-left:18%" href="https://urim-department.byu.edu/records_transfers" class="btn btn-link">Return to homepage</a>
    <br />
    <br />
    <br />
    <form class="form-horizontal">
        <div class="form-group dept-margin">
            <label class="control-label col-sm-1" for="retention-dropdown">Department:</label>
            <div class="col-sm-5">
                <select class="form-control" id="retention-dropdown">
                </select> 
            </div>
        </div>
    </form>
    <br />
    <br />
    <form class="form-horizontal">
        <div class="form-group chkbx-margin">
            <label><input type="checkbox" value="" id="DRS-complete-chkbx" disabled> DRS Complete</label>
            <br />
            <label><input type="checkbox" value="" id="review-complete-chkbx" disabled> Annual Review Complete</label>
        </div>
    </form>
    <br />
    <div class="container-fluid">
        <ul class="nav nav-tabs" id="nav-tabs">
            <li class="active"><a data-toggle="tab" href="#dept-retention">Department Retention Schedule</a></li>
            <li><a data-toggle="tab" href="#common-records">Add Common Records</a></li>
            <li><a data-toggle="tab" href="#unique-records">Add Unique Records</a></li>
        </ul>
        <div class="tab-content">
            <div id="dept-retention" class="tab-pane fade in active">
            </div>
            <div id="common-records" class="tab-pane fade">
            </div>
            <div id="unique-records" class="tab-pane fade">
            </div>
        </div>
    </div>
    <br />
    <br />
    <br />
    <br />
    <br />
</asp:Content>
