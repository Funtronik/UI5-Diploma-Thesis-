sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"app/model"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("app.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.getData();
			this.intervalID = setInterval(
                (function(self) {         //Self-executing func which takes 'this' as self
                    return function() {   //Return a function in the context of 'self'
                        self.getData(); //Thing you wanted to run as non-window 'this'
                    }
                })(this),
                10000     //normal interval, 'this' scope not impacted here.
            ); 
		},
		getData: function()
		{
			sap.ui.getCore().setModel(models.createDataModel(), 'data');
		}
	});
});