var mqtt, devices;

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "app/webapp/utils/formatter",
    "sap/ui/model/json/JSONModel",
    "app/model"
], function (Controller, formatter, JSONModel, models) {
    "use strict";
    return Controller.extend("app.webapp.controller.Launchpad", {
        formatter: formatter,
        globalData: null,
        reconnectTimeout: 200,
        host: "192.168.1.80",
        port: 9001,

        _TilesIDs: { //this._TilesIDs[costam]
            "Livingroom": "idLivingroomTile",
            "Bedroom": "idBedroomTile"
        },
        _SwitchIDs: {
            "Livingroom": "idLivingroomSwitch",
            "Bedroom": "idBedroomSwitch"
        },
        _findElementIn: function _findElementIn(id, arrayCtrls) {
            //Pass in an array of controls and return element by id
            for (var i = 0; i < arrayCtrls.length; i++) {
                if (arrayCtrls[i].getId() === id) {
                    return arrayCtrls[i];
                }
            }
        },
        onInit: function (oEvent) {
            this.MQTTconnect();
            devices = [];
        },
        onAfterRendering: function (oEvent) {
            this.reloadData();
            //interval section
            var that = this;
            this.intervalID = setInterval(
                (function (self) {
                    return function () {
                        self.onRefreshMQTTDevices();
                        self.reloadData();
                    };
                })(this), 30 * 1000 //    [sek] * 1000
            );
        },
        onRefreshMQTTDevices: function () {
            var message = new Paho.MQTT.Message("test");
            message.destinationName = "MQTTQ/testled";
            mqtt.send(message);

            message = new Paho.MQTT.Message("test");
            message.destinationName = "MQTTQ/rollerBlinder";
            mqtt.send(message);
        },
        onMQTTConnect: function () {
            // var message = new Paho.MQTT.Message("hello");
            // message.destinationName = "dupa";
            console.log("Connected to MQTT");
            mqtt.subscribe("MQTTA/testled");
            mqtt.subscribe("MQTTA/testled2");
            mqtt.subscribe("MQTTA/rollerBlinder");
        },
        onConnectionLost: function (responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);
            }
        },
        MQTTconnect: function () {
            mqtt = new Paho.MQTT.Client(this.host, this.port, "clientjs");
            mqtt.onMessageArrived = this.onMessageArrived;
            mqtt.onConnectionLost = this.onConnectionLost;
            var options = {
                timeout: 5,
                keepAliveInterval: 30,
                onSuccess: this.onMQTTConnect
            };
            mqtt.connect(options);
        },
        reloadData: function () {
            // section for MySQL database
            this.globalData = sap.ui.getCore().getModel('data');
            this.getView().setModel(this.globalData);
            var temperatures = this.globalData.getProperty("/temperatures");

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
                if (oSwitch) { // do only if bound
                    oSwitch.setState(convertState(lightList[index].state));
                }
                var oTile = thatView.byId(that._TilesIDs[lightList[index].name]);
                if (oTile) {
                    var date = new Date(lightList[index].changed);
                    oTile.getTileContent()[0].setFooter(date.toLocaleString());
                }
            });
            // section for MQTT devices
            console.table(devices);
            var JSONModel = new sap.ui.model.json.JSONModel();
            JSONModel.setProperty('/MQTTDevices', devices);
            JSONModel.setProperty('/temperatures', temperatures);
            this.getView().setModel(JSONModel);
        },
        onTileSwitchLamp: function (oEvent) {
            var oControl = oEvent.oSource.oParent.oParent;
            var oControlTitle = oControl._oTitle.getProperty('text');
            var switchState = oEvent.oSource.getState();
            var message = new Paho.MQTT.Message(switchState ? "1" : "0");
            message.destinationName = "MyHome/testled";
            mqtt.send(message);
        },
        onTileClick: function (oEvent) {

        },
        onMessageArrived: function (message) {
            // console.log("onMessageArrived:"+message.payloadString);
            var properties = JSON.parse(message.payloadString),
                bFound = false;
            //console.table(properties);
            if (properties.sensorType === 'Light') {
                if (devices.length > 0) {
                    $.each(devices, function (key, value) {
                        if (value) {
                            var line = devices[key];
                            if (line.deviceName === properties.deviceName) {
                                devices[key].deviceStatus = true;
                                devices[key].LastSeen = Date();
                                bFound = true;
                                return;
                            }
                        }
                    });
                } else {
                    devices.push(properties);
                    devices[devices.length - 1].deviceStatus = true;
                    bFound = true;
                }
                if (!bFound) {
                    devices.push(properties);
                    devices[devices.length - 1].deviceStatus = true;
                }
            }
            if (properties.sensorType === 'RollerBlinder') {
                if (devices.length > 0) {
                    $.each(devices, function (key, value) {
                        if (value) {
                            var line = devices[key];
                            if (line.deviceName === properties.deviceName) {
                                devices[key].deviceStatus = true;
                                devices[key].LastSeen = Date();
                                devices[key].LogicState = properties.LogicState;
                                bFound = true;
                                return;
                            }
                        }
                    });
                } else {
                    devices.push(properties);
                    devices[devices.length - 1].deviceStatus = true;
                    bFound = true;
                }
                if (!bFound) {
                    devices.push(properties);
                    devices[devices.length - 1].deviceStatus = true;
                }
            }

        },
        onTileClickRightWindow: function () {
            this._oPersonalizationDialog = sap.ui.xmlfragment("app.webapp.view.fragments.RollerBlinderSet", this);
            var oModel = this.getView().getModel();
            this._oPersonalizationDialog.setModel(oModel);

            this.getView().addDependent(this._oPersonalizationDialog);
            this._oPersonalizationDialog.open();
        },
        onSubmitDialog: function () {
            var object = this._findElementIn('idDialogNumericContent', this._oPersonalizationDialog.findElements(true));
            this.onExitDialog();
        },
        onCancelDialog: function () {
            this.onExitDialog();
        },
        onDialogButton: function(oEvent){
            var object = this._findElementIn('idDialogNumericContent', this._oPersonalizationDialog.findElements(true));
            var oButton = oEvent.getSource();
            var value = object.getValue();
            if (oButton.sId === "idDialogUp"){
                object.setValue(parseInt(value) + 5);
            }else if (oButton.sId === "idDialogDown") {
                object.setValue(parseInt(value)  - 5);
            }
        },
        onExitDialog: function(){
            if (this._oPersonalizationDialog) {
                this._oPersonalizationDialog.close();
				this._oPersonalizationDialog.destroy();
			}
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