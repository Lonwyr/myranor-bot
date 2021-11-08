sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ], function(JSONModel) {
    "use strict";
  
    
  const statusKey = 'com.lonwyr.myranorBot.status.';
  const emptyStatus = {
      stats: {
        LeP: 0,
        AuP: 0,
        AsP: 0,
        lowLepIgnored: false,
        lowAupIgnored: false
      },
      wounds: {
        useZones: true,
        genericWounds: {
            count: 0,
            ignored: false
        },
        zones: {
            head: {
                count: 0,
                ignored: false
            },
            leftArm: {
                count: 0,
                ignored: false
            },
            rightArm: {
                count: 0,
                ignored: false
            },
            body: {
                count: 0,
                ignored: false
            },
            belly: {
                count: 0,
                ignored: false
            },
            leftLeg: {
                count: 0,
                ignored: false
            },
            rightLeg: {
                count: 0,
                ignored: false
            }
        }
      }
  };

    return JSONModel.extend("com.lonwyr.MyranorBot.model.StatusModel", {
        loadStatus: function (slot) {
            try {
                const statusData = window.localStorage.getItem(statusKey + slot);
                this.setData(JSON.parse(statusData) || JSON.parse(JSON.stringify(emptyStatus)));
            } catch {
                this.setData(emptyStatus);
            }
            
        },
        storeStatus: function (slot) {
            window.localStorage.setItem(statusKey + slot, JSON.stringify(this.getData()));
        },

        setZoneMode: function (useZones) {
            this.setProperty("/wounds/useZones", useZones);
            this.setProperty("/wounds/zones", JSON.parse(JSON.stringify(emptyStatus.wounds.zones)));
        }
    });
  });