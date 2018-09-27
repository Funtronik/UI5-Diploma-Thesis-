sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {
        globalData: null,
        onInit: function () {
            this.globalData = sap.ui.getCore().getModel('data');
            this.getView().setModel(this.globalData);
        },
        onAfterRendering: function () {
            var oLivingroomTile = this.getView().byId('idLivingroomTile'),
                status = this.globalData.getProperty("/lights");
            $.each(status, function (index, value) {
                if (status[index].name === "Livingroom") {
                    
                }
            })
        },
        reloadRepo: function() {
            $.ajax({
                type: "POST",
                url: "./scripts/lolo.py"
            });
        },
        setTileStatus: function (value) {
            if (value === "0")
                return "Error";
            else
                return "Succes";
        }
        //Test3
    });
});