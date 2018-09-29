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
                lightList = this.globalData.getProperty("/lights"),
             getInfoStatus = function(status)
            {
                if (status === "1") return "Success"
                else if (status === "0") return "Error"
                else return "Warning"
            };
            $.each(lightList, function (index, value) {
                if (lightList[index].name === "livingroom") {
                   var lightName = lightList[index].name;
                   var lightStatus = lightList[0].status;

                   oLivingroomTile.setTitle(lightName);
                   oLivingroomTile.setInfoState(getInfoStatus(lightStatus));
                }
            })
        },
        // getInfoStatus: function(status){
        //     if (status === "1") return "Success"
        //     else if (status === "0") return "Error"
        //     else return "Warning"
        // },
        reloadRepo: function() {
            $.ajax({
                type: "POST",
                url: "./scripts/lolo.py"
            });
        },
        //Test3
    });
});