sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ], function(JSONModel) {
    "use strict";
  
    
  const combatKey = 'com.lonwyr.myranorBot.combat.';
  const emptyCombat = {
      meeleWeapons: [],
      editMeeleWeapons: false,
      selectedMeeleWeapon: undefined,
      rangedWeapons: [],
      editRangedWeapons: false,
      selectedRangedWeapon: undefined,
      dodge: 0,
      sizeClass: 0
  };

    return JSONModel.extend("com.lonwyr.MyranorBot.model.CombatModel", {
        loadCombat: function (slot) {
            try {
                const combatData = window.localStorage.getItem(combatKey + slot);
                this.setData(JSON.parse(combatData) || emptyCombat);
            } catch {
                this.setData(emptyCombat);
            }
            
        },
        storeCombat: function (slot) {
            window.localStorage.setItem(combatKey + slot, JSON.stringify(this.getData()));
        },
        addMeeleWeapon: function (slot) {
            var aMeeleWeapons = this.getProperty("/meeleWeapons");
            aMeeleWeapons.push({
                name: "",
                at: 10,
                pa: 10,
                type: "meele",
                tp: "1W6+4",
                bf: 2
            });

            this.setProperty("/meeleWeapons", aMeeleWeapons);
            this.storeCombat(slot);
        },
        addRangedWeapon: function (slot) {
            var aRangedWeapons = this.getProperty("/rangedWeapons");
            aRangedWeapons.push({
                name: "",
                at: 10,
                type: "ranged",
                tp: "1W6+4",
                bf: 2
            });

            this.setProperty("/rangedWeapons", aRangedWeapons);
            this.storeCombat(slot);
        },
        removeWeapon: function (path) {
            const weaponCategory = path.substring(0, path.lastIndexOf("/"));
            let aWeapons = this.getProperty(weaponCategory);
            const index = parseInt(path.substring(path.lastIndexOf("/")+1));
            aWeapons.splice(index, 1);
            this.setProperty(weaponCategory, aWeapons);
        }
    });
  });