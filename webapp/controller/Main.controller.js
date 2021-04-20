sap.ui.define([
  "com/lonwyr/MyranorBot/controller/BaseController",
  "com/lonwyr/MyranorBot/controller/Attributes",
  "com/lonwyr/MyranorBot/controller/Combat",
  "sap/ui/core/Fragment",
  "sap/m/GroupHeaderListItem",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Controller,
    AttributesController,
    CombatController,
    Fragment,
    GroupHeaderListItem,
    Roller
  ) {
  "use strict";

  const skillCategories = {
    "KÖRPERLICH": 1,
    "GESELLSCHAFTLICH": 2,
    "NATUR": 3,
    "WISSEN": 4,
    "SPRACHEN": 5,
    "HANDWERKLICH": 6
  }

  let popoverPromise;
  let resultDialogPromise;
  let impressumPromise;

  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("character")
    return bindingContext.getProperty()
  }

  function getAttributes(clickEvent, checkAttributes) {
    const attributes = clickEvent.getSource().getBindingContext("character").getModel().getProperty("/attributes")
    return checkAttributes.map(checkAttribute => {
      return {
        name: checkAttribute,
        value: attributes.find(attribute => attribute.name === checkAttribute).value
      }
    })
  }

  return Controller.extend("com.lonwyr.MyranorBot.controller.Main", Object.assign({
    formatAttributeName: function (attribute) {
      return this.getResourceBundle("i18n").getText(attribute);
    },
    getGroupHeader: function (group) {
      return new GroupHeaderListItem({
				title: group.key,
				upperCase: false
			})
    },
    compareSkills: function (a, b) {
      const comparision = skillCategories[a] - skillCategories[b]

      if (comparision < 0) {
        return -1
      }

      if (comparision > 0) {
        return 1
      }

      return 0
    },
    onRollAttribute: function (clickEvent) {
      const attribute = getProperty(clickEvent)
      return Roller.checkAttribute(attribute)
    },
    openSkillPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const skill = getProperty(clickEvent)
      const checkParameters = {
        id: skill.id,
        name: skill.name,
        value: skill.value,
        modifier: 0,
        attributes: getAttributes(clickEvent, skill.attributes)
      }
      this.getModel("check").setData(checkParameters)

      // create popover
			if (!popoverPromise) {
				popoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollSkillPopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			popoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    onRollSkill: function () {
      popoverPromise.then(oPopover => oPopover.close())
      let checkData = this.getModel("check").getData();
      checkData.modifier = parseInt(checkData.modifier) || 0
      return Roller.checkSkill(checkData).then((result) => {
        this.getModel("check").setProperty("/result", JSON.parse(result));

        if (!resultDialogPromise) {
          resultDialogPromise = Fragment.load({
            id: this.oView.getId(),
            name: "com.lonwyr.MyranorBot.fragment.Roll3D20ResultDialog",
            controller: this
          }).then(oDialog => {
            this.oView.addDependent(oDialog)
            return oDialog
          })
        }
        resultDialogPromise.then(function(oDialog) {
          oDialog.open()
        })
      })
    },
    onRollSpell: function (clickEvent) {
      const spell = getProperty(clickEvent)
      const checkParameters = {
        id: spell.id,
        name: spell.name,
        value: spell.value,
        modifier: 0,
        specialization: false,
        attributes: getAttributes(clickEvent, spell.attributes)
      }
      return Roller.checkSpell(checkParameters)
    },/*
    onSlotSelectionChange: function () {
      const selectedSlot = this.byId('slotSelection').getSelectedKey();
      MessageToast.show(selectedSlot);
      // TODO: switch slot
    },*/
    formatResultDialogState: function (status) {
        switch (status) {
          case "success":
            return ValueState.Success
        }
    },
    formatSlotButtonVisibility: function (slots, slotNr) {
      return slots && slots.includes(slotNr);
    },
    openImpressum: function (clickEvent) {
      const button = clickEvent.getSource()
      
      // create popover
			if (!impressumPromise) {
				impressumPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.Impressum",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			impressumPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    closeResultDialog: function () {
      resultDialogPromise.then(dialog => dialog.close());
    }
  }, AttributesController, CombatController));
});
