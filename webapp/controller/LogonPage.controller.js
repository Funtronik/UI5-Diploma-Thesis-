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

            if (sLogin === 'serwis@hicron.com' && sPassword === 'Hicron11')
            {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("Launchpad");
            }
        }
    });
});