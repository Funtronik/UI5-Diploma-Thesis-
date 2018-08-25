sap.ui.define([
    "sap/ui/core/mvc/Controller"
 ], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {

        onAfterRendering() {
            // var olist = this.getView().byId('list');
            // olist.setModel(oModel);
            // olist.getModel().refresh(true);
            var oModel = sap.ui.getCore().getModel('data');
           
        },
        onShowHello : function () {
           // show a native JavaScript alert
           alert("Hello World");
        }
     });
 });