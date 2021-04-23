sap.ui.define([
    "sap/ui/model/json/JSONModel"
  ], function(JSONModel) {
    "use strict";
  
    
  const spellsKey = 'com.lonwyr.myranorBot.spells.';
  const emptySpells = {
      spells: [],
      editSpells: false
  };

    return JSONModel.extend("com.lonwyr.MyranorBot.model.SpellsModel", {
        loadSpells: function (slot) {
            try {
                const spellsData = window.localStorage.getItem(spellsKey + slot);
                this.setData(JSON.parse(spellsData) || emptySpells);
            } catch {
                this.setData(emptySpells);
            }
            
        },
        storeSpells: function (slot) {
            window.localStorage.setItem(spellsKey + slot, JSON.stringify(this.getData()));
        },
        addSpell: function (newSpell) {
            var aSpells = this.getProperty("/spells");
            aSpells.push(newSpell);

            this.setProperty("/spells", aSpells);
        },
        removeSpell: function (path) {
            let aSpells = this.getProperty(path.substring(0, path.lastIndexOf("/")));
            const index = parseInt(path.substring(path.lastIndexOf("/")+1));
            aSpells.splice(index, 1);
            this.setProperty("/spells", aSpells);
        }
    });
  });