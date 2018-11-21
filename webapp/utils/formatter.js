sap.ui.define([], function () {
	"use strict";
	return {
		getInfoStatus: function(status)
            {
                if (status === "1") return "Success";
                else if (status === "0") return "Error";
                else return "Warning";
            },
            getStatusName: function(status)
            {
                if (status === "1") return "ON";
                else if (status === "0") return "OFF";
                else return "ERROR";
            },
            getStatusIcon: function(status)
            {
                if (status)  return 'sap-icon://connected';
                else return 'sap-icon://disconnected';
            },
            formatData: function(date){
                try {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                      pattern: "dd/MM/yyyy HH:mm"
                    });
                    var dateTimeString = oDateFormat.format(new Date(date));
                    return dateTimeString;
                  } catch (err) {
                      console.log(err);
                    return date;
                  }
            }
	};
});