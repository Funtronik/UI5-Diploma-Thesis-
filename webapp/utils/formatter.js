sap.ui.define([], function () {
	"use strict";
	return {
		getInfoStatus: function(status)
            {
                if (status === "1") return "Success"
                else if (status === "0") return "Error"
                else return "Warning"
            },
            getStatusName: function(status)
            {
                if (status === "1") return "ON"
                else if (status === "0") return "OFF"
                else return "ERROR"
            }
	};
});