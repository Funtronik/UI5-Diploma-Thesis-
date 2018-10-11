sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "app/webapp/utils/formatter",
    "sap/ui/model/json/JSONModel",
    "app/model"
], function (Controller, formatter, JSONModel,models) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {
        formatter: formatter,
        globalData: null,

        _TilesIDs: { //this._TilesIDs[costam]
            "Livingroom": "idLivingroomTile",
            "Bedroom": "idBedroomTile"
        },
        _SwitchIDs: {
            "Livingroom": "idLivingroomSwitch",
            "Bedroom": "idBedroomSwitch"
        },
        onAfterRendering: function (oEvent) {
            this.reloadData();
            var that = this;
            this.intervalID = setInterval(
                (function (self) {
                    return function () {
                        self.reloadData();
                    }
                })(this), 10000
            );
        },
        reloadData: function () {
            this.globalData = sap.ui.getCore().getModel('data');
            this.getView().setModel(this.globalData);

            var lightList = this.globalData.getProperty("/lights"),
                thatView = this.getView(),
                that = this,
                convertState = function (val) {
                    if (val === '0') return false;
                    else if (val === '1') return true;
                };

            $.each(lightList, function (index, value) {
                // if (lightList[index].name === "Livingroom") {
                var oSwitch = thatView.byId(that._SwitchIDs[lightList[index].name]);
                if (oSwitch) {// do only if bound
                    oSwitch.setState(convertState(lightList[index].state));
                }
                var oTile = thatView.byId(that._TilesIDs[lightList[index].name]);
                if (oTile)
                {
                    var date = new Date(lightList[index].changed);
                    oTile.getTileContent()[0].setFooter(date.toLocaleString());
                }
            })
        },
        onTileSwitchLamp: function (oEvent) {

        },
        onTileClick: function (oEvent) {

        },

        reloadRepo: function () {
            $.ajax({
                type: "get",
                url: "./scripts/lolo.py",
                succes: function () {
                    console.log('Udało sie');;
                },
                error: function () {
                    console.log('Nie pykło');
                }
            });
        },
    });
});