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

  let spellDialogPromise;
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
      let model = this.getModel("spell");
      const instructionName = model.getProperty("/instruction");
      const instructions = this.getModel("magic").getProperty("/instructions");
      const instruction = instructions[instructionName];

      const targetSelect = this.byId("targets");
      let targetBinding = targetSelect.getBinding("items");
      targetBinding.filter(new Filter("",
        targetOption => instruction.targetsCategories.includes(targetOption.category)
      ));

      const maxDurationtSelect = this.byId("maxDuration");
      let maxDurationBinding = maxDurationtSelect.getBinding("items");
      maxDurationBinding.filter(new Filter("",
        maxDurationOption => instruction.durations.includes(maxDurationOption.category)
      ));

      const structureSelect =  this.byId("structure");
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
        inCreation: true,
        parameters: {
          castingTime: "1",
          targets: "1",
          range: "1",
          maxDuration: "1",
          structure: this.getModel("magic").getProperty("/instructions/" + instructions[0]).structures[0].modificator
        },
        modificators: []
      }
      this.getModel("spell").setData(checkParameters)

      // create popover
			if (!spellDialogPromise) {
				spellDialogPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.SpellDialog",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			spellDialogPromise.then(oPopover => {
        this.rebindInstructionDependentSpellParameters("spell")
				oPopover.open()
			})
    },

    addParameterToSpell: function () {
      let data = this.getModel("spell").getData();
      data.modificators.push({
        name: "",
        enabled: true,
        value: 0
      });
      this.getModel("spell").setData(data)
    },

    removeParameterFormSpell: function (event) {
      var list = event.getSource(),
      item = event.getParameter("listItem"),
      path = item.getBindingContext("spell").getPath(),
      model = item.getBindingContext("spell").getModel();

      // after deletion put the focus back to the list
      list.attachEventOnce("updateFinished", list.focus, list);

      const mod = model.getProperty(path);
      let mods = model.getProperty("/modificators");
      mods = mods.filter(modListItem => modListItem !== mod)
      model.setProperty("/modificators", mods)
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

    closeSpellDialog: function () {      
      const spell = this.getModel("spell").getData();
      if (spell.inCreation) {
        delete spell.inCreation;
        this.getModel("spells").addSpell(spell);
      }
      spellDialogPromise.then(oPopover => oPopover.close());
    },

    onEditSpell: function (event) {
      const editSpellData = event.getSource().getBindingContext("spells").getProperty();
       // create popover
			if (!spellDialogPromise) {
				spellDialogPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.SpellDialog",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			spellDialogPromise.then(oPopover => {
         this.getModel("spell").setData(editSpellData);
         this.rebindInstructionDependentSpellParameters("spell")
				oPopover.open();
			})
    },

    onDeleteSpell: function (event) {
      const deleteSpellPath = event.getSource().getBindingContext("spells").getPath();
      this.getModel("spells").removeSpell(deleteSpellPath)
    },

    updateSpellModificator: function () {
      this.getModel("spell").updateBindings(true);
      this.getModel("spells").updateBindings(true);
    },

    openSpellPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const bindingContext = clickEvent.getSource().getBindingContext("spells")
      const spell = bindingContext.getProperty()
      const characterSource = this.getModel("character").getProperty("/spells").find(source => source.id === spell.source)

      const checkData = {
        name: spell.name,
        attributes: characterSource.attributes,
        value: characterSource.value,
        modificators: spell.modificators,
        quality: spell.quality,
        checkProperties: characterSource.attributes,
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
      const characterAttributes = this.getModel("character").getProperty("/attributes");
      checkData.attributes = checkData.attributes.map(att => characterAttributes.find(characterAttribute => characterAttribute.name === att));
      checkData.attributes.forEach(attr => attr.value += this.getWoundModifier(attr.name));
      checkData.modifier = parseInt(checkData.spontaneousModificator) + checkData.spellModificator - checkData.quality;
      checkData.modifier += checkData.modificators.reduce((a, b) => a + (b.enabled ? parseInt(b.value) : 0), 0);
      checkData.modifier += this.getEnergyModifier();

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

    openAventuricSpellPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const bindingContext = clickEvent.getSource().getBindingContext("character")
      const spell = bindingContext.getProperty()

      const checkData = {
        name: spell.name,
        attributes: spell.attributes,
        checkProperties: spell.attributes,
        value: spell.value,
        aventuric: true,
        modificators: [],
        spellModificator: 0,
        quality: 0,
        spontaneousModificator: 0,
        specialization: false
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

    closeSpellResultDialog: function () {
      spellResultDialogPromise.then(dialog => dialog.close());
    }
  }
});
