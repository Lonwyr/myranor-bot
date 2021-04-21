sap.ui.define([
  "sap/ui/core/Fragment",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Fragment,
    Roller
  ) {
  "use strict";

  let attributePopoverPromise;
  let attributeResultDialogPromise;

  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("character")
    return bindingContext.getProperty()
  }

  return {
    formatAttributeTitle: function (attribute) {
      return this.getResourceBundle().getText(attribute);
    },
    openAttributePopover: function (clickEvent) {
      const button = clickEvent.getSource()
      const attribute = getProperty(clickEvent)
      const checkParameters = {
        name: attribute.name,
        value: parseInt(attribute.value),
        modifier: 0
      }
      this.getModel("check").setData(checkParameters)

      // create popover
			if (!attributePopoverPromise) {
				attributePopoverPromise = Fragment.load({
					id: this.oView.getId(),
					name: "com.lonwyr.MyranorBot.fragment.RollAttributePopover",
					controller: this
				}).then(oPopover => {
					this.oView.addDependent(oPopover)
					return oPopover
				})
			}
			attributePopoverPromise.then(function(oPopover) {
				oPopover.openBy(button)
			})
    },
    onRollAttribute: function () {
      attributePopoverPromise.then(oPopover => oPopover.close());
      let checkData = this.getModel("check").getData();
      checkData.modifier = parseInt(checkData.modifier) || 0
      checkData.value = checkData.value - checkData.modifier
      return Roller.checkAttribute(checkData).then((result) => {
        this.getModel("check").setProperty("/result", JSON.parse(result));

        if (!attributeResultDialogPromise) {
          attributeResultDialogPromise = Fragment.load({
            id: this.oView.getId(),
            name: "com.lonwyr.MyranorBot.fragment.RollAttributeResultDialog",
            controller: this
          }).then(oDialog => {
            this.oView.addDependent(oDialog)
            return oDialog
          })
        }
        attributeResultDialogPromise.then(function(oDialog) {
          oDialog.open()
        })
      })
    },
    closeAttributeResultDialog: function () {
      attributeResultDialogPromise.then(dialog => dialog.close());
    }
  }
});
