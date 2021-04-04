sap.ui.define([
  "com/lonwyr/MyranorBot/controller/BaseController",
  "com/lonwyr/MyranorBot/utils/HttpHelper"
], function(
  Controller,
  HttpHelper
  ) {
  "use strict";

  return Controller.extend("com.lonwyr.MyranorBot.controller.Main", {
    onInit: function () {
      // do not trigger the Base init to navigate to the login
    },
    loadData: function () {
      const inputValue = this.byId("tokeninput").getValue();
      HttpHelper.validateUserToken(inputValue).then(result => {
        HttpHelper.setUserToken(inputValue);
        this.onNavBack();
      }).then(() => {
        return HttpHelper.getCharacter();
    }).then(character => {
      this.getModel('character').setData(character);
    }).catch(() => {
      this.byId('loginFailed').setVisible(true);
    });;
    }
  });
});
