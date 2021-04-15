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
    removeMeeleWeapon: function (event) {
      const activeSlot = this.getModel("settings").getProperty("/slots/activeSlot");
      const listItem = event.getParameter("listItem");
      const path = listItem.getBindingContext("combat").getPath();

      this.getModel("combat").removeWeapon(path, activeSlot);
    },
    openAttackPopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const attack = getProperty(clickEvent)
      const checkParameters = {
        name: attack.name,
        type: attack.type,
        value: parseInt(attack.at),
        tp: attack.tp,
        sizeDifference: this.getModel("combat").getProperty("/sizeDifference")
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
      attackPopoverPromise.then(oPopover => oPopover.close())
      return Roller.checkAttack(this.getModel("check").getData()).then((result) => {
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
    formatAttackResultDialogState: function (result) {
      if (["ciritcalHit", "potentialCriticalHit", "hit"].includes(result)) {
        return "Success";
      } else {
        return "Error";
      }
    },
    closeAttackResultDialog: function () {
      attackResultDialogPromise.then(dialog => dialog.close());
    }
  }
});
