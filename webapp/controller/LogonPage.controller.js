sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.LogonPage", {

        onAfterRendering() {
        },
        onLoginAuth: function (oEvent) {
           var sLogin = this.getView().byId('idLoginInput').getValue(),
            sPassword = this.getView().byId('idPasswordInput').getValue();

            if (sLogin.toLowerCase() === 'admin' && sPassword === 'admin')
            {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("launchpad");
            }
        }
    });
});