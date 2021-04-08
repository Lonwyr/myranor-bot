sap.ui.define([
  "com/lonwyr/MyranorBot/controller/BaseController",
  "com/lonwyr/MyranorBot/utils/HttpHelper"
], function(
  Controller,
  HttpHelper
  ) {
  "use strict";

  const loginTokenKey = 'com.lonwyr.myranorBot.loginToken';

  function validateTokenAndLoadCharacter(token) {
    return HttpHelper.validateUserToken(token).then(result => {
      HttpHelper.setUserToken(token);
      this.onNavBack();
    }).then(() => {
      window.localStorage.setItem(loginTokenKey, token);
      return HttpHelper.getCharacter();
    }).then(character => {
      this.getModel('character').setData(character);
    });
  };

  return Controller.extend("com.lonwyr.MyranorBot.controller.Login", {
    onInit: function () {
      const loginToken = window.localStorage.getItem(loginTokenKey);
      if (loginToken) {
        validateTokenAndLoadCharacter.call(this, loginToken).catch(() => {
          window.localStorage.removeItem(loginTokenKey)
        })
      }
      // do not trigger the Base init to navigate to the login
    },
    loadData: function () {
      const inputValue = this.byId("tokeninput").getValue();
      validateTokenAndLoadCharacter.call(this, inputValue).catch(() => {
        this.byId('loginFailed').setVisible(true);
      });
    }
  });
});
