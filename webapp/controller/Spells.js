sap.ui.define([
  "sap/ui/core/Fragment",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Fragment,
    Roller
  ) {
  "use strict";

  let addSpellDialogPromise;
  let editSpellDialogPromise;
  let spellResultDialogPromise;
  
  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("magic")
    return bindingContext.getProperty()
  }

  return {
    switchSpellsToView: function () {
      this.getModel("spells").setProperty("/editSpells", false);
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("spells").storeSpells(activeSlot);
    },
    switchSpellsToEdit: function () {
      this.getModel("spells").setProperty("/editSpells", true);
    },
    openAddSpellDialog: function () {
      const spells = this.getModel("character").getProperty("/spells");
      const instructions = this.getModel("character").getProperty("/instructions");
      const checkParameters = {
        name: "",
        description: "",
        instruction: instructions[0],
        source: spells[0].id,
        quality: 0,
        specialization: false,
        parameters: {
          castingTime: "1",
          targets: "1",
          range: "1",
          maxDuration: "1",
          structure: "1"
        },
        modificators: [{
          name: "permanente Modifikatoren",
          value: 0
        }]
      }
      this.getModel("newSpell").setData(checkParameters)

      // create popover
			if (!addSpellDialogPromise) {
				addSpellDialogPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.AddSpellDialog",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			addSpellDialogPromise.then(function(oPopover) {
				oPopover.open()
			})
    },
    updateSpellModificator: function () {
      this.getModel("newSpell").updateBindings(true);
    },
    formatSpellName: function (spell, characterSpells) {
      if (!spell ||!characterSpells) {
        return "";
      }
      return characterSpells.find(item => item.id === spell).name;
    },
    formatZfW: function (source, characterSources, specialization) {
      if (!source || !characterSources || !specialization) {
        return "";
      }
      return "ZfW " + (characterSources.find(item => item.id === source).value + (specialization ? 2 : 0));
    },
    calculateSpellModificator: function (spellParameters, parameters, modificators) {
      if (!spellParameters || !parameters || !modificators) {
        return 0;
      }

      let modificator = 0
        for (const category in parameters) {
          const parameterItem = parameters[category].find(item => {return item.id === spellParameters[category]})
          modificator += parameterItem.modificator
        }
        modificator += modificators.reduce((a, b) => a + parseInt(b.value), 0)
        return modificator
    },
    formatSpellParameter: function (id, category) {
      if (!id || !category) {
        return "";
      }
      return category.find(item => {return item.id === id}).description
    },
    closeAddSpellDialog: function () {
      const newSpell = this.getModel("newSpell").getData();
      this.getModel("spells").addSpell(newSpell);
      addSpellDialogPromise.then(oPopover => oPopover.close());
    },
    onEditSpell: function (event) {
      const editSpellData = event.getSource().getBindingContext("spells").getProperty();
       // create popover
			if (!editSpellDialogPromise) {
				editSpellDialogPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.EditSpellDialog",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			editSpellDialogPromise.then(oPopover => {
         this.getModel("editSpell").setData(editSpellData);
				oPopover.open();
			})
    },
    closeEditSpellDialog: function () {
      editSpellDialogPromise.then(oPopover => oPopover.close());
    },
    updateEditSpellModificator: function () {
      this.getModel("editSpell").updateBindings(true);
      this.getModel("spells").updateBindings(true);
    }
  }
});
