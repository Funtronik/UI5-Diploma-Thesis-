sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		//createDeviceModel
		createDataModel: function () {

			var json = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: './scripts/database.php',
				async: false,
				success: function (data) //on recieve of reply
				{
					try {
						json.setData(JSON.parse(data));
					} catch (e) {
						console.log("Error during fetch data: " + e);
					}
				},
				error: function (err) {
					console.log(err);
				}
			});

			return json;
		}

	};
});