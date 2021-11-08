sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/UIComponent",
  "com/lonwyr/MyranorBot/model/formatter",
  "com/lonwyr/MyranorBot/utils/HttpHelper"
], function(Controller, History, UIComponent, formatter, HttpHelper) {
  "use strict";

  return Controller.extend("com.lonwyr.MyranorBot.controller.BaseController", {

    formatter: formatter,

    onInit: function () {
      if (!HttpHelper.isUserTokenSet()) {
        this.getRouter().navTo("RouteLogin");
      }
    },

    formatWoundsVisibility: function (woundsCount, affectedProperties, checkProperties) {
      const hasWound = woundsCount > 0;
      const woundRelevant = Object.keys(affectedProperties).some(attr => checkProperties.includes(attr));
      return hasWound && woundRelevant;
    },

    getEnergyModifier: function (isSingeD20Check) {
      let mod = 0;
      const statusData = this.getModel("status").getProperty("/stats");
      const characterSatsData = this.getModel("character").getProperty("/stats");

      if (!statusData.lowLepIgnored) {
        const lepEnergyStatus = statusData.LeP/characterSatsData.LeP;
        
        if (lepEnergyStatus < 1/4) {
          mod += 3;
        } else if (lepEnergyStatus < 1/3) {
          mod += 2;
        } else if (lepEnergyStatus < 1/2) {
          mod += 1;
        }
      }

      if (!statusData.lowAupIgnored) {
        const aupEnergyStatus = statusData.AuP/characterSatsData.AuP;
        
        if (aupEnergyStatus < 1/4) {
          mod += 2;
        } else if (aupEnergyStatus < 1/3) {
          mod += 1;
        }
      }

      return isSingeD20Check ? mod : mod * 3;
    },

    getWoundModifier: function(checkAttribute) {
      const statusData = this.getModel("status").getProperty("/wounds");
      const woundsData = this.getModel("wounds").getData();

      if (!statusData.useZones) {
        if(statusData.genericWounds.ignored || !Object.keys(woundsData.genericWounds).indexOf(checkAttribute) === -1) {
          return 0;
        } else {
          return statusData.genericWounds.count * woundsData.genericWounds[checkAttribute];
        }
      }
      
      let modifier = 0
      Object.keys(statusData.zones).forEach(key => {
        const zoneWounds = statusData.zones[key]
        if (!zoneWounds.ignored) {
          modifier += zoneWounds.count * (woundsData.zones[key][checkAttribute] || 0)
        }
      });

      return modifier
    },
    
    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    /**
     * Method for navigation to specific view
     * @public
     * @param {string} psTarget Parameter containing the string for the target navigation
     * @param {Object.<string, string>} pmParameters? Parameters for navigation
     * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
     */
    navTo: function(psTarget, pmParameters, pbReplace) {
      this.getRouter().navTo(psTarget, pmParameters, pbReplace);
    },

    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },

    onNavBack: function() {
      var sPreviousHash = History.getInstance().getPreviousHash();

      if (sPreviousHash !== undefined) {
        window.history.back();
      } else {
        this.getRouter().navTo("RouteMain", {}, true /*no history*/ );
      }
    }

  });

});
