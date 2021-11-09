sap.ui.define([
  "sap/ui/core/Fragment",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Fragment,
    Roller
  ) {
  "use strict";

  return {
    storeStatus: function () {
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("status").storeStatus(activeSlot);
    },

    onZoneModeSwitch: function (event) {
      const switcher = event.getSource();
      this.getModel("status").setZoneMode(event.getParameter("state"));
      this.storeStatus();
    },
    
    setStatusIgnored: function (event) {
      const path = event.getSource().getBindingPath("state");
      this.getModel("status").setProperty(path, !event.getParameter("state"));
      this.storeStatus();
    },

    formatLepModVisibility: function (current, max) {
      const energyStatus = current/max;
      
      return energyStatus < 1/2;
    },

    formatAuPModVisibility: function (current, max) {
      const energyStatus = current/max;
      
      return energyStatus < 1/3;
    },

    formatLepState: function (current, max) {
      const energyStatus = current/max;
      if (energyStatus >= 1/2) {
        return "Success";
      }
      if (energyStatus >= 1/3) {
        return "Warning";
      }
      return "Error";
    },

    formatLepText: function (current, max) {
      let text = current + " /" + max;
      const energyStatus = current/max;
      
      if (current < 5) {
        text += " (< 5)"
      } else if (energyStatus > 1/2) {
      } else if (energyStatus >= 1/3) {
        text += " (< 1/2)";
      } else if (energyStatus >= 1/4) {
        text += " (< 1/3)";
      } else {
        text += " (< 1/4)";
      }

      return text;
    },

    formatAupState: function (current, max) {
      const energyStatus = current/max;
      if (energyStatus >= 1/3) {
        return "Success";
      }
      if (energyStatus >= 1/4) {
        return "Warning";
      }
      return "Error";
    },

    formatAupText: function (current, max) {
      let text = current + " /" + max;
      const energyStatus = current/max;
      if (energyStatus >= 1/3) {}
      else if (energyStatus >= 1/4) {
        text += " (< 1/3)";
      } else {
        text += " (< 1/4)";
      }

      return text;
    },

    formatAspText: function (current, max) {
       return current + " /" + max;
    },

    setEnergy: function (event) {
      const path = event.getSource().getBindingPath("value");
      this.getModel("status").setProperty(path, event.getParameter("value"));
      this.storeStatus();
    }
  }
});
