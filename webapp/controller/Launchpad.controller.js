sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {
        globalData: null, //1000 for every 10 sec.
        onInit: function () {
            
        },
        onAfterRendering: function (oEvent) {
            this.reloadData();
            var that = this;
             this.intervalID = setInterval(
                (function(self) {         //Self-executing func which takes 'this' as self
                    return function() {   //Return a function in the context of 'self'
                        self.reloadData(); //Thing you wanted to run as non-window 'this'
                    }
                })(this),
                10000     //normal interval, 'this' scope not impacted here.
            ); 
        },
        reloadData: function(){
            this.globalData = sap.ui.getCore().getModel('data');
            this.getView().setModel(this.globalData);
            
            var oLivingroomTile = this.getView().byId('idLivingroomTile'),
                lightList = this.globalData.getProperty("/lights"),
            getInfoStatus = function(status)
            {
                if (status === "1") return "Success"
                else if (status === "0") return "Error"
                else return "Warning"
            },
            getStatusName = function(status)
            {
                if (status === "1") return "ON"
                else if (status === "0") return "OFF"
                else return "ERROR"
            };
            $.each(lightList, function (index, value) {
                if (lightList[index].name === "livingroom") {
                   var lightName = lightList[index].name;
                   var lightStatus = lightList[0].state;

                   oLivingroomTile.setTitle(lightName);
                   oLivingroomTile.setInfoState(getInfoStatus(lightStatus));
                   oLivingroomTile.setInfo(getStatusName(lightStatus));
                }
            })
        },
        reloadRepo: function() {
            $.ajax({
                type: "get",
                url: "./scripts/lolo.py",
                succes: function(){
                    console.log('Udało sie');;
                },
                error: function(){
                    console.log('Nie pykło');
                }
            });
        },
    });
});