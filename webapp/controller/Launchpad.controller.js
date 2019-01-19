var mqtt, devices, that;

sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "app/webapp/utils/formatter",
    "sap/ui/model/json/JSONModel",
    "app/model"
  ],
  function(Controller, formatter, JSONModel, models) {
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
      onInit: function(oEvent) {
        this.MQTTconnect();
        devices = [];
        //this.getAirConditions();
      },
      onAfterRendering: function(oEvent) {
        that = this;
        this.reloadData();
        this.getDate();
        this.getHour();
        this.getAirConditions();
        this.onRefreshMQTTDevices();

        //interval section
        this.intervalId = setInterval(this.getAirConditions, 120 * 1000);
        this.intervalId = setInterval(this.getHour, 10 * 1000);
        this.intervalId = setInterval(this.onRefreshMQTTDevices, 10 * 1000);
        this.intervalId = setInterval(this.reloadData, 10 * 1000);
        this.intervalId = setInterval(this.checkMQTTDevicesTimeOut, 60 * 1000);

        // this.intervalID = setInterval(
        //   (function(self) {
        //     return function() {
        //       self.checkMQTTDevicesTimeOut();
        //     };
        //   })(this),
        //   60 * 1000 // [sek] * 1000
        // );
      },
      checkMQTTDevicesTimeOut: function() {
        var today = new Date();
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "HH:mm"
        });
        var currentDateTime = oDateFormat.format(today);

        $.each(devices, function(key, value) {
          var line = devices[key];
          if (line.LastSeen !== currentDateTime) {
            line.deviceStatus = false;
          }
        });
      },
      getDate: function() {
        var oDate = this.getView().byId("idHeaderDate");
        var today = new Date();
        var oDateFormat = sap.ui.core.format.DateFormat.getTimeInstance({
          pattern: "dd - MMMM - yyyy"
        });
        oDate.setText(oDateFormat.format(today));
      },
      getHour: function() {
        var oHour = that.getView().byId("idHeaderHour");
        var today = new Date();
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "HH:mm"
        });
        oHour.setText(oDateFormat.format(today));
      },
      getAirConditions: function() {
        var t = that;
        var data;
        var url =
          "https://airapi.airly.eu/v2/measurements/installation?installationId=2112";

        $.ajax({
          url: url,
          contentType: "application/json",
          dataType: "json",
          headers: {
            apikey: "PbBVpyTBIEsK2SxtBV3C73VNkLvKiSxP"
          },
          success: function(result) {
            // process result
            var val = "PM25";
            var table = result.current.values;
            var index = table.findIndex(function(item, i) {
              return item.name === val;
            });
            t.getView()
              .byId("idPM25")
              .setPercentValue(table[index].value);
            t.getView()
              .byId("idPM25")
              .setDisplayValue(parseFloat(table[index].value) + "%");

            val = "PM10";
            index = table.findIndex(function(item, i) {
              return item.name === val;
            });
            t.getView()
              .byId("idPM10")
              .setPercentValue(table[index].value);
            t.getView()
              .byId("idPM10")
              .setDisplayValue(parseFloat(table[index].value) + "%");

            console.log(result);

            val = "TEMPERATURE";
            index = table.findIndex(function(item, i) {
              return item.name === val;
            });
            t.getView()
              .byId("idOutsideTempLabel")
              .setText(parseFloat(table[index].value) + "°C");

            val = "PRESSURE";
            index = table.findIndex(function(item, i) {
              return item.name === val;
            });
            t.getView()
              .byId("idPressureLabel")
              .setText(parseFloat(table[index].value) + "hPa");

              val = "HUMIDITY";
            index = table.findIndex(function(item, i) {
              return item.name === val;
            });
            t.getView()
              .byId("idHumidityLabel")
              .setText(parseFloat(table[index].value) + "%");

            var JSONModel = new sap.ui.model.json.JSONModel();
            JSONModel.setProperty("/Airly", table);
            t.getView().setModel(JSONModel);
          },
          error: function(e) {
            // log error in browser
            console.log("Error:" + e.responseText);
          }
        });
      },
      onRefreshMQTTDevices: function() {
        that.sendMQTTMessage("null", "MQTTQ/Status");
      },
      onMQTTConnect: function() {
        console.log("Connected to MQTT");
        mqtt.subscribe("MQTTA/Status");
      },
      onConnectionLost: function(responseObject) {
        if (responseObject.errorCode !== 0) {
          console.log("onConnectionLost:" + responseObject.errorMessage);
        }
      },
      MQTTconnect: function() {
        mqtt = new Paho.MQTT.Client(this.host, this.port, "clientjs");
        mqtt.onMessageArrived = this.onMessageArrived;
        mqtt.onConnectionLost = this.onConnectionLost;
        var options = {
          timeout: 1,
          keepAliveInterval: 30,
          onSuccess: this.onMQTTConnect
        };
        try {
          mqtt.connect(options);
        } catch (e) {
          console.log(e);
        }
      },
      sendMQTTMessage: function(message, destination) {
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
      reloadData: function() {
        // section for MySQL database
        that.globalData = sap.ui.getCore().getModel("data");
        that.getView().setModel(that.globalData);
        var RoomTemperatures = that.globalData.getProperty("/RoomTemperatures");

        // section for MQTT devices
        var JSONModel = new sap.ui.model.json.JSONModel();
        JSONModel.setProperty("/MQTTDevices", devices);
        JSONModel.setProperty("/RoomTemperatures", RoomTemperatures);
        that.getView().setModel(JSONModel);

        // set switches state
        var oLivingroomSwitch = that.getView().byId("idLivingroomSwitch"),
          oBedroomSwitch = that.getView().byId("idBedroomSwitch");

        $.each(devices, function(key, value) {
          var line = devices[key];
          switch (line.deviceName) {
            case "LivingroomLight":
              line.LogicState
                ? oLivingroomSwitch.setState(true)
                : oLivingroomSwitch.setState(false);
              break;
            case "BedroomLight":
              line.LogicState
                ? oBedroomSwitch.setState(true)
                : oBedroomSwitch.setState(false);
              break;
          }
        });

        // set Tiles Information
        var oLivingroomTile = that.getView().byId("idLivingroomTile"),
          oBedroomTile = that.getView().byId("idBedroomTile");

        $.each(devices, function(key, value) {
          var line = devices[key];
          switch (line.deviceName) {
            case "LivingroomLight":
              oLivingroomTile
                .getTileContent()[0]
                .setFooter("Last seen: " + line.LastSeen);
              break;
            case "":
              oBedroomTile
                .getTileContent()[0]
                .setFooter("Last seen: " + line.LastSeen);
              break;
          }
        });

        // set Roller Blinders Tiles information
        var oLeftWindowRoller = that.getView().byId("idLeftWindowRoller");
        var oMiddleWindowRoller = that.getView().byId("idMiddleWindowRoller");
        var oRightWindowRoller = that.getView().byId("idRightWindowRoller");

        $.each(devices, function(key, value) {
          var line = devices[key];
          switch (line.deviceName) {
            case "LeftRollerBlinder":
              oLeftWindowRoller
                .getTileContent()[0]
                .getContent()
                .setValue(line.LogicState + "%");
              oLeftWindowRoller
                .getTileContent()[0]
                .setFooter("Last seen: " + line.LastSeen);
              break;
            case "MiddleRollerBlinder":
              oMiddleWindowRoller
                .getTileContent()[0]
                .getContent()
                .setValue(line.LogicState + "%");
              oMiddleWindowRoller
                .getTileContent()[0]
                .setFooter("Last seen: " + line.LastSeen);
              break;
            case "RightRollerBlinder":
              oRightWindowRoller
                .getTileContent()[0]
                .getContent()
                .setValue(line.LogicState + "%");
              oRightWindowRoller
                .getTileContent()[0]
                .setFooter("Last seen: " + line.LastSeen);
              break;
          }
        });

        // set Header atrubites
        if (RoomTemperatures) {
          var oHeaderInsideTempChart = that
              .getView()
              .byId("idInsideTempHeaderChart"),
            oHeaderInsideTempChartItem = oHeaderInsideTempChart.getItems()[0];
          oHeaderInsideTempChartItem.setFraction(
            parseFloat(RoomTemperatures[RoomTemperatures.length - 1].temp)
          );
        }
      },
      onTileSwitchLamp: function(oEvent) {
        var oControl = oEvent.oSource.oParent.oParent;
        var oControlTitle = oControl._oTitle.getProperty("text");
        var switchState = oEvent.oSource.getState();
        switch (oControlTitle) {
          case "Livingroom":
            this.sendMQTTMessage(
              switchState ? "1" : "0",
              "MyHome/LivingroomLight"
            );
            break;
          case "Bedroom":
            this.sendMQTTMessage(
              switchState ? "1" : "0",
              "MyHome/BedroomLight"
            );
            break;
        }
      },
      onMessageArrived: function(message) {
        var properties = JSON.parse(message.payloadString),
          bFound = false;
        if (
          properties.sensorType === "Light" ||
          properties.sensorType === "RollerBlinder" ||
          properties.sensorType === "Sensor"
        ) {
          if (devices.length > 0) {
            $.each(devices, function(key, value) {
              if (value) {
                var line = devices[key];
                if (line.deviceName === properties.deviceName) {
                  devices[key].deviceStatus = true;

                  var today = new Date();
                  var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(
                    {
                      pattern: "HH:mm"
                    }
                  );
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
      onTileClickWindow: function(oEvent) {
        this._oPersonalizationDialog = sap.ui.xmlfragment(
          "app.webapp.view.fragments.RollerBlinderSet",
          this
        );
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
        var DialogNumericContent = this._findElementIn(
          "idDialogNumericContent",
          this._oPersonalizationDialog.findElements(true)
        );
        DialogNumericContent.setValue(
          this.getView()
            .byId(oParent.sId)
            .getTileContent()[0]
            .getContent()
            .getValue()
        );
        this.getView().addDependent(this._oPersonalizationDialog);
        this._oPersonalizationDialog.open();
      },
      onSubmitDialog: function() {
        var object = this._findElementIn(
          "idDialogNumericContent",
          this._oPersonalizationDialog.findElements(true)
        );
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
      onCancelDialog: function() {
        this.onExitDialog();
      },
      onDialogButton: function(oEvent) {
        var object = this._findElementIn(
          "idDialogNumericContent",
          this._oPersonalizationDialog.findElements(true)
        );
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
      onExitDialog: function() {
        if (this._oPersonalizationDialog) {
          this._oPersonalizationDialog.close();
          this._oPersonalizationDialog.destroy();
        }
        this.rollerBlinderTileCall = 0;
      }
    });
  }
);
