sap.ui.define([
  "sap/ui/core/Fragment",
  "sap/ui/core/Item",
	"sap/ui/model/Filter",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Fragment,
    Item,
    Filter,
    Roller
  ) {
  "use strict";

  let addSpellDialogPromise;
  let editSpellDialogPromise;
  let spellPopoverPromise;
  let spellResultDialogPromise;
  
  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("magic")
    return bindingContext.getProperty()
  }

  function getAttributes(characterAttributes, checkAttributes) {
    return checkAttributes.map(checkAttribute => {
      return {
        name: checkAttribute,
        value: characterAttributes.find(attribute => attribute.name === checkAttribute).value
      }
    })
  }

  function addParameter(model) {
    let data = model.getData();
    data.modificators.push({
      name: "",
      enabled: true,
      value: 0
    });
    model.setData(data)
  }

  function removeParameter(event, modelName) {
    var list = event.getSource(),
    item = event.getParameter("listItem"),
    path = item.getBindingContext(modelName).getPath(),
    model = item.getBindingContext(modelName).getModel();

    // after deletion put the focus back to the list
    list.attachEventOnce("updateFinished", list.focus, list);

    const mod = model.getProperty(path);
    let mods = model.getProperty("/modificators");
    mods = mods.filter(modListItem => modListItem !== mod)
    model.setProperty("/modificators", mods)
  }

  return {
    switchSpellsToView: function () {
      this.getModel("spells").setProperty("/editSpells", false)
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot")
      this.getModel("spells").storeSpells(activeSlot)
    },

    switchSpellsToEdit: function () {
      this.getModel("spells").setProperty("/editSpells", true)
    },

    rebindInstructionDependentSpellParameters: function (prefix, resetParameters) {
      let model = this.getModel(prefix);
      const instructionName = model.getProperty("/instruction");
      const instructions = this.getModel("magic").getProperty("/instructions");
      const instruction = instructions[instructionName];

      const targetSelect = this.byId(prefix + "_targets");
      let targetBinding = targetSelect.getBinding("items");
      targetBinding.filter(new Filter("",
        targetOption => instruction.targetsCategories.includes(targetOption.category)
      ));

      const maxDurationtSelect = this.byId(prefix + "_maxDuration");
      let maxDurationBinding = maxDurationtSelect.getBinding("items");
      maxDurationBinding.filter(new Filter("",
        maxDurationOption => instruction.durations.includes(maxDurationOption.category)
      ));

      const structureSelect =  this.byId(prefix + "_structure");
      const structuresBindingPath = `/instructions/${instructionName}/structures`;
      structureSelect.bindItems({
        path: structuresBindingPath,
        model: "magic",
        template: new Item({key:"{magic>modificator}", text:"{= ${magic>name} + ' (' + ${magic>modificator} + ')'}"})
      });

      if (resetParameters) {
        model.parameters.target = model.getProperty(`${targetBinding.getPath()}/${targetBinding.aIndices[0]}`).id
        model.prameters.maxDuration = model.getProperty(`${maxDurationBinding.getPath()}/${maxDurationBinding.aIndices[0]}`).id
        model.parameters.target = model.getProperty(`${structuresBindingPath}/${targetBinding.aIndices[0]}`).id
      }
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
        asp: 0,
        pAsp: 0,
        parameters: {
          castingTime: "1",
          targets: "1",
          range: "1",
          maxDuration: "1",
          structure: this.getModel("magic").getProperty("/instructions/" + instructions[0]).structures[0].modificator
        },
        modificators: []
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
			addSpellDialogPromise.then(oPopover => {
        this.rebindInstructionDependentSpellParameters("newSpell")
				oPopover.open()
			})
    },

    addParameterToNewSpell: function () {
      addParameter(this.getModel("newSpell"));
    },

    removeParameterFormNewSpell: function (event) {
      removeParameter(event, "newSpell");
    },

    addParameterToEditSpell: function () {
      addParameter(this.getModel("editSpell"));
    },

    removeParameterFormEditSpell: function (event) {
      removeParameter(event, "editSpell");
    },

    updateNewSpellModificator: function () {
      this.getModel("newSpell").updateBindings(true);
    },

    formatSpellName: function (spell, characterSpells) {
      if (!spell ||!characterSpells) {
        return "";
      }
      return characterSpells.find(item => item.id === spell).name;
    },

    formatZfW: function (source, characterSources, specialization) {
      if (!source || !characterSources || specialization === undefined) {
        return "";
      }
      return "ZfW " + (characterSources.find(item => item.id === source).value + (specialization ? 2 : 0));
    },

    calculateSpellParameters: function (spellParameters, parameters) {
      let modificator = 0;
      for (const category in parameters) {
        const parameterItem = parameters[category].find(item => {return item.id === spellParameters[category]})
        modificator += parameterItem.modificator
      }

      return modificator;
    },

    calculateSpellModificator: function (formulaQuality, spellParameters, parameters, modificators) {
      if (formulaQuality === undefined || !spellParameters || !parameters || modificators === undefined) {
        return 0;
      }

      let modificator = -1 * formulaQuality
      modificator += this.calculateSpellParameters(spellParameters, parameters)
      modificator += modificators.reduce((a, b) => a + b.enabled ? parseInt(b.value) : 0, 0)
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
         this.rebindInstructionDependentSpellParameters("editSpell")
				oPopover.open();
			})
    },
    onDeleteSpell: function (event) {
      const deleteSpellPath = event.getSource().getBindingContext("spells").getPath();
      this.getModel("spells").removeSpell(deleteSpellPath)
    },

    closeEditSpellDialog: function () {
      editSpellDialogPromise.then(oPopover => oPopover.close());
    },

    updateEditSpellModificator: function () {
      this.getModel("editSpell").updateBindings(true);
      this.getModel("spells").updateBindings(true);
    },

    updateNewSpellModificator: function () {
      this.getModel("newSpell").updateBindings(true);
    },

    openSpellPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const bindingContext = clickEvent.getSource().getBindingContext("spells")
      const spell = bindingContext.getProperty()
      const characterSource = this.getModel("character").getProperty("/spells").find(source => source.id === spell.source)

      const checkData = {
        name: spell.name, //`${spell.name} (${characterSource.name} - ${spell.instruction})`,
        attributes: characterSource.attributes,
        value: characterSource.value,
        modificators: spell.modificators,
        quality: spell.quality,
        spellModificator: this.calculateSpellParameters(spell.parameters, this.getModel("magic").getProperty("/spellParameters")),
        spontaneousModificator: 0,
        specialization: spell.specialization
      }

      this.getModel("check").setData(checkData)
      this.getModel("check").setProperty("/spontaneousModificator", 0)

      // create popover
			if (!spellPopoverPromise) {
				spellPopoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollSpellPopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			spellPopoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },

    formatSpellModifierSwitchLabel: function (name, value) {
      return `${name} (${value})`;
    },

    onRollSpell: function (clickEvent) {
      spellPopoverPromise.then(oPopover => oPopover.close())
      let checkData = Object.assign({}, this.getModel("check").getData());
      const characterAttributes = this.getModel("character").getProperty("/attributes")
      checkData.attributes = checkData.attributes.map(att => characterAttributes.find(characterAttribute => characterAttribute.name === att));
      checkData.modifier = parseInt(checkData.spontaneousModificator) + checkData.spellModificator - checkData.quality;
      checkData.modifier += checkData.modificators.reduce((a, b) => a + (b.enabled ? parseInt(b.value) : 0), 0);

      return Roller.checkSpell(checkData).then((result) => {
        this.getModel("check").setProperty("/result", JSON.parse(result));

        if (!spellResultDialogPromise) {
          spellResultDialogPromise = Fragment.load({
            id: this.oView.getId(),
            name: "com.lonwyr.MyranorBot.fragment.RollSpellResultDialog",
            controller: this
          }).then(oDialog => {
            this.oView.addDependent(oDialog)
            return oDialog
          })
        }
        spellResultDialogPromise.then(function(oDialog) {
          oDialog.open()
        })
      })
    },

    closeSpellResultDialog: function () {
      spellResultDialogPromise.then(dialog => dialog.close());
    }
  }
});
