sap.ui.define([
  "sap/ui/core/Fragment",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Fragment,
    Roller
  ) {
  "use strict";

  let attackPopoverPromise;
  let attackResultDialogPromise;
  let defensePopoverPromise;
  let defenseResultDialogPromise;
 
  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("combat")
    return bindingContext.getProperty()
  }
  return {
    switchMeeleToEdit: function () {
      this.getModel("combat").setProperty("/editMeeleWeapons", true);
    },
    switchMeeleToView: function () {
      this.getModel("combat").setProperty("/editMeeleWeapons", false);
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("combat").storeCombat(activeSlot);
    },
    addMeeleWeapon: function () {
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("combat").addMeeleWeapon(activeSlot);
    },
    removeWeapon: function (event) {
      const listItem = event.getParameter("listItem");
      const path = listItem.getBindingContext("combat").getPath();

      this.getModel("combat").removeWeapon(path);
    },
    switchRangedToEdit: function () {
      this.getModel("combat").setProperty("/editRangedWeapons", true);
    },
    switchRangedToView: function () {
      this.getModel("combat").setProperty("/editRangedWeapons", false);
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("combat").storeCombat(activeSlot);
    },
    addRangedWeapon: function () {
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      this.getModel("combat").addRangedWeapon(activeSlot);
    },
    openDodgePopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const checkParameters = {
        name: "Ausweichen",
        modifier: 0,
        type: "dodge",
        value: parseInt(this.getModel("combat").getProperty("/dodge"))
      }
      this.getModel("check").setData(checkParameters)

     // create popover
			if (!defensePopoverPromise) {
				defensePopoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollDefensePopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			defensePopoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    openAttackPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const weapon = getProperty(clickEvent)
      const checkParameters = {
        name: weapon.name,
        type: weapon.type,
        checkProperties: ["AT"],
        value: parseInt(weapon.at),
        tp: weapon.tp,
        sizeClass: this.getModel("combat").getProperty("/sizeClass"),
        modifier: 0,
        sizeTarget: 0,
        sizeDifference: 0
      }
      this.getModel("check").setData(checkParameters)

      // create popover
			if (!attackPopoverPromise) {
				attackPopoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollAttackPopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			attackPopoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    onRollAttack: function () {
      attackPopoverPromise.then(oPopover => oPopover.close());
      let checkData = this.getModel("check").getData();
      checkData.modifier = parseInt(checkData.modifier) || 0;
      if (checkData.type === "meele") {
        checkData.sizeDifference = checkData.sizeClass - (checkData.sizeTarget || 0)
      }
      checkData.value = checkData.value - checkData.modifier
        + this.getWoundModifier("AT") 
        - this.getEnergyModifier(true);
      return Roller.checkAttack(checkData).then((result) => {
        this.getModel("check").setProperty("/result", JSON.parse(result));

        if (!attackResultDialogPromise) {
          attackResultDialogPromise = Fragment.load({
            id: this.oView.getId(),
            name: "com.lonwyr.MyranorBot.fragment.RollAttackResultDialog",
            controller: this
          }).then(oDialog => {
            this.oView.addDependent(oDialog)
            return oDialog
          })
        }
        attackResultDialogPromise.then(function(oDialog) {
          oDialog.open()
        })
      })
    },
    formatDamageRoll: function (results = [], tp) {
    const re = /[+-]\d*/g;
    const mod = tp.match(re)[0];
    return `[${results.join('+')}]${mod}`;

    },
    closeAttackResultDialog: function () {
      attackResultDialogPromise.then(dialog => dialog.close());
    },
    openDefensePopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const weapon = getProperty(clickEvent)
      const checkParameters = {
        name: weapon.name,
        type: weapon.type,
        checkProperties: ["PA"],
        value: parseInt(weapon.pa)
      }
      this.getModel("check").setData(checkParameters)

      // create popover
			if (!defensePopoverPromise) {
				defensePopoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollDefensePopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			defensePopoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    onRollDefense: function () {
      defensePopoverPromise.then(oPopover => oPopover.close())
      let checkData = this.getModel("check").getData();
      checkData.modifier = parseInt(checkData.modifier) || 0
      checkData.value = checkData.value - checkData.modifier
      + this.getWoundModifier("PA")
      - this.getEnergyModifier(true);
      return Roller.checkDefense(checkData).then((result) => {
        this.getModel("check").setProperty("/result", JSON.parse(result));

        if (!defenseResultDialogPromise) {
          defenseResultDialogPromise = Fragment.load({
            id: this.oView.getId(),
            name: "com.lonwyr.MyranorBot.fragment.RollDefenseResultDialog",
            controller: this
          }).then(oDialog => {
            this.oView.addDependent(oDialog)
            return oDialog
          })
        }
        defenseResultDialogPromise.then(function(oDialog) {
          oDialog.open()
        })
      })
    },
    closeDefenseResultDialog: function () {
      defenseResultDialogPromise.then(dialog => dialog.close());
    },
    formatFumbleRoll: function (results) {
      return results ? `[${results.join('+')}]` : '';
    }
  }
});
