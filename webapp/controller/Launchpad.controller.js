sap.ui.define([
    "sap/ui/core/mvc/Controller"
 ], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {
        onInit: function() {
           var globalData =  sap.ui.getCore().getModel('data');
            this.getView().setModel(globalData);
        },
        onAfterRendering: function() {
             var olist = this.getView().byId('list');
             var oModel = sap.ui.getCore().getModel('data');
        },
        onShowHello : function () {
           // show a native JavaScript alert
           alert("Hello World");
        }
     });
 });