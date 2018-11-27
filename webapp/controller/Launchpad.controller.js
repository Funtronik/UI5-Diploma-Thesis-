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
            rollerBlinderTileCall: 0,

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
                this.getDate();
                this.getHour();
                //interval section
                this.intervalID = setInterval(
                    (function (self) {
                        return function () {
                            self.getHour();
                            self.onRefreshMQTTDevices();
                            self.reloadData();
                        };
                    })(this), 10 * 1000 //    [sek] * 1000
                );

                this.intervalID = setInterval(
                    (function (self) {
                        return function () {
                            self.checkMQTTDevicesTimeOut();
                        };
                    })(this), 60 * 1000 //    [sek] * 1000
                );
            },
            checkMQTTDevicesTimeOut: function () {
                var today = new Date();
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "HH:mm"
                });
                var currentDateTime = oDateFormat.format(today);

                $.each(devices, function (key, value) {
                    var line = devices[key];
                    if (line.LastSeen !== currentDateTime) {
                        line.deviceStatus = false;
                    }
                });
            },
            getDate: function () {
                var oDate = this.getView().byId('idHeaderDate');
                var today = new Date();
                var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({
                    pattern: "dd - MMMM - yyyy"
                });
                oDate.setText(oDateFormat.format(today));
            },
            getHour: function () {
                var oHour = this.getView().byId('idHeaderHour');
                var today = new Date();
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "HH:mm"
                });
                oHour.setText(oDateFormat.format(today));
            },
            getAirConditions: function () {
                var t = this;
                var data;
                var url = "https://api.gios.gov.pl/pjp-api/rest/aqindex/getIndex/944";

                $.ajax({
                    url: url,
                    dataType: 'jsonp',
                    headers: {
                        'Access-Control-Allow-Credentials': true,
                        'Access-Control-Allow-Origin': '*'
                    },
                    success: function (result) {
                        // process result
                        console.log(result);
                    },
                    error: function (e) {
                        // log error in browser
                        console.log('Error:' + e.message);
                    }
                });
            },
            onRefreshMQTTDevices: function () {
                this.sendMQTTMessage("null", "MQTTQ/Status");
            },
            onMQTTConnect: function () {
                console.log("Connected to MQTT");
                mqtt.subscribe("MQTTA/Status");
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
                try {
                    mqtt.connect(options);
                } catch (e) {
                    console.log(e);
                }
            },
            sendMQTTMessage: function (message, destination) {
                if (!mqtt.isConnected()) {
                    try {
                        this.MQTTconnect();
                        return;
                    } catch (e) {
                        console.log("Cannot connect to MQTT");
                        return;
                    }
                }
                var mess = new Paho.MQTT.Message(message);
                mess.destinationName = destination;
                mqtt.send(mess);
            },
            reloadData: function () {
                // section for MySQL database
                this.globalData = sap.ui.getCore().getModel('data');
                this.getView().setModel(this.globalData);
                var RoomTemperatures = this.globalData.getProperty("/RoomTemperatures");
                var OutsideTemperatures = this.globalData.getProperty("/OutsideTemperatures");
                // section for MQTT devices
                var JSONModel = new sap.ui.model.json.JSONModel();
                JSONModel.setProperty('/MQTTDevices', devices);
                JSONModel.setProperty('/RoomTemperatures', RoomTemperatures);
                JSONModel.setProperty('/OutsideTemperatures', OutsideTemperatures);
                this.getView().setModel(JSONModel);

                // set switches state
                var oLivingroomSwitch = this.getView().byId('idLivingroomSwitch'),
                    oBedroomSwitch = this.getView().byId('idBedroomSwitch');

                $.each(devices, function (key, value) {
                    var line = devices[key];
                    switch (line.deviceName) {
                        case "LivingroomLight":
                            line.LogicState ? oLivingroomSwitch.setState(true) : oLivingroomSwitch.setState(false);
                            break;
                        case "BedroomLight":
                            line.LogicState ? oBedroomSwitch.setState(true) : oBedroomSwitch.setState(false);
                            break;
                    }
                });

                // set Tiles Information
                var oLivingroomTile = this.getView().byId('idLivingroomTile'),
                    oBedroomTile = this.getView().byId('idBedroomTile');

                $.each(devices, function (key, value) {
                    var line = devices[key];
                    switch (line.deviceName) {
                        case 'LivingroomLight':
                            oLivingroomTile.getTileContent()[0].setFooter("Last seen: " + line.LastSeen);
                            break;
                        case '':
                            oBedroomTile.getTileContent()[0].setFooter("Last seen: " + line.LastSeen);
                            break;
                    }
                });

                // set Roller Blinders Tiles information
                var oLeftWindowRoller = this.getView().byId('idLeftWindowRoller');
                var oMiddleWindowRoller = this.getView().byId('idMiddleWindowRoller');
                var oRightWindowRoller = this.getView().byId('idRightWindowRoller');

                $.each(devices, function (key, value) {
                    var line = devices[key];
                    switch (line.deviceName) {
                        case 'LeftRollerBlinder':
                            oLeftWindowRoller.getTileContent()[0].getContent().setValue(line.LogicState + "%");
                            oLeftWindowRoller.getTileContent()[0].setFooter("Last seen: " + line.LastSeen);
                            break;
                        case 'MiddleRollerBlinder':
                            oMiddleWindowRoller.getTileContent()[0].getContent().setValue(line.LogicState + "%");
                            oMiddleWindowRoller.getTileContent()[0].setFooter("Last seen: " + line.LastSeen);
                            break;
                        case 'RightRollerBlinder':
                            oRightWindowRoller.getTileContent()[0].getContent().setValue(line.LogicState + "%");
                            oRightWindowRoller.getTileContent()[0].setFooter("Last seen: " + line.LastSeen);
                            break;
                    }
                });

                // set Header atrubites
                if (RoomTemperatures) {
                    var oHeaderInsideTempChart = this.getView().byId('idInsideTempHeaderChart'),
                        oHeaderInsideTempChartItem = oHeaderInsideTempChart.getItems()[0];
                    oHeaderInsideTempChartItem.setFraction(parseFloat(RoomTemperatures[RoomTemperatures.length - 1].temp));
                }
                if (OutsideTemperatures) {
                var oHeaderOutsideTempChart = this.getView().byId('idOutsideTempHeaderChart'),
                    oHeaderOutsideTempChartItem = oHeaderOutsideTempChart.getItems()[0];
                oHeaderOutsideTempChartItem.setFraction(parseFloat(OutsideTemperatures[OutsideTemperatures.length - 1].temp));
            }
        },
        onTileSwitchLamp: function (oEvent) {
            var oControl = oEvent.oSource.oParent.oParent;
            var oControlTitle = oControl._oTitle.getProperty('text');
            var switchState = oEvent.oSource.getState();
            switch (oControlTitle) {
                case 'Livingroom':
                    this.sendMQTTMessage(switchState ? "1" : "0", "MyHome/LivingroomLight");
                    break;
                case 'Bedroom':
                    this.sendMQTTMessage(switchState ? "1" : "0", "MyHome/BedroomLight");
                    break;
            }
        },
        onMessageArrived: function (message) {
            var properties = JSON.parse(message.payloadString),
                bFound = false;
            if (properties.sensorType === 'Light' || properties.sensorType === 'RollerBlinder' || properties.sensorType === 'Sensor') {
                if (devices.length > 0) {
                    $.each(devices, function (key, value) {
                        if (value) {
                            var line = devices[key];
                            if (line.deviceName === properties.deviceName) {
                                devices[key].deviceStatus = true;

                                var today = new Date();
                                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                                    pattern: "HH:mm"
                                });
                                var currentDateTime = oDateFormat.format(today);
                                devices[key].LastSeen = currentDateTime;

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
        onTileClickWindow: function (oEvent) {
            this._oPersonalizationDialog = sap.ui.xmlfragment("app.webapp.view.fragments.RollerBlinderSet", this);
            var oModel = this.getView().getModel();
            this._oPersonalizationDialog.setModel(oModel);
            var oParent = oEvent.getSource();
            var callerTile;
            switch (oParent.sId) {
                case "idLeftWindowRoller":
                    this.rollerBlinderTileCall = 0;
                    break;
                case "idMiddleWindowRoller":
                    this.rollerBlinderTileCall = 1;
                    break;
                case "idRightWindowRoller":
                    this.rollerBlinderTileCall = 2;
                    break;
            }
            var DialogNumericContent = this._findElementIn('idDialogNumericContent', this._oPersonalizationDialog.findElements(true));
            DialogNumericContent.setValue(this.getView().byId(oParent.sId).getTileContent()[0].getContent().getValue());
            this.getView().addDependent(this._oPersonalizationDialog);
            this._oPersonalizationDialog.open();
        },
        onSubmitDialog: function () {
            var object = this._findElementIn('idDialogNumericContent', this._oPersonalizationDialog.findElements(true));
            var sValue = object.getValue();
            this.onExitDialog();
            switch (this.rollerBlinderTileCall) {
                case 0:
                    this.sendMQTTMessage(sValue, "MyHome/LeftRollerBlinder");
                    break;
                case 1:
                    this.sendMQTTMessage(sValue, "MyHome/MiddleRollerBlinder");
                    break;
                case 2:
                    this.sendMQTTMessage(sValue, "MyHome/RightRollerBlinder");
                    break;
            }
        },
        onCancelDialog: function () {
            this.onExitDialog();
        },
        onDialogButton: function (oEvent) {
            var object = this._findElementIn('idDialogNumericContent', this._oPersonalizationDialog.findElements(true));
            var oButton = oEvent.getSource();
            var value = object.getValue();
            switch (oButton.sId) {
                case "idDialogUp":
                    object.setValue(parseInt(value) + 5);
                    break;
                case "idDialogDown":
                    object.setValue(parseInt(value) - 5);
                    break;
            }
        },
        onExitDialog: function () {
            if (this._oPersonalizationDialog) {
                this._oPersonalizationDialog.close();
                this._oPersonalizationDialog.destroy();
            }
            this.rollerBlinderTileCall = 0;
        }
    });
});