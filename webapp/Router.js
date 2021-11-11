sap.ui.define([
    "sap/f/routing/Router"
  ], function(
        Router
    ) {
    "use strict";
        return Router.extend("com.lonwyr.MyranorBot.Router", {
            navTo: function (sName, oParameters, oComponentTargetInfo, bReplace) {
                Router.prototype.navTo.call(this, sName, oParameters, oComponentTargetInfo, bReplace);
            }
        });
  });
  