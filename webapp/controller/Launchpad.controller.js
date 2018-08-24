sap.ui.define([
    "sap/ui/core/mvc/Controller"
 ], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {

        onAfterRendering() {
            var dupa="";
        },
        onShowHello : function () {
           // show a native JavaScript alert
           alert("Hello World");
        }
     });
 });