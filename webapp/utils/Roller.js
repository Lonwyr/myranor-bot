sap.ui.define([
  "com/lonwyr/MyranorBot/utils/HttpHelper"
], function(
    HttpHelper
) {
    "use strict";
  
    return {
        checkAttribute: function (properties) {
            return HttpHelper.checkAttribute(properties);
        },
        checkSkill: function (properties) {
            return HttpHelper.checkSkill(properties);
        },
        checkSpell: function (properties) {
            return HttpHelper.checkSpell(properties);
        },
        checkAttack: function (properties) {
            return HttpHelper.checkAttack(properties);
        },
        checkDefense: function (properties) {
            return HttpHelper.checkDefense(properties);
        }
    }
})


