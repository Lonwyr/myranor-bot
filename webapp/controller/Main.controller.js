sap.ui.define([
  "com/lonwyr/MyranorBot/controller/BaseController",
  "sap/m/GroupHeaderListItem",
  "com/lonwyr/MyranorBot/utils/Roller"
], function(
    Controller,
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

  function getProperty (clickEvent) {
    const bindingContext = clickEvent.getSource().getBindingContext("character");
    return bindingContext.getProperty();
  }

  function getAttributes(clickEvent, checkAttributes) {
    const attributes = clickEvent.getSource().getBindingContext("character").getModel().getProperty("/attributes");
    return checkAttributes.map(checkAttribute => {
      return {
        name: checkAttribute,
        value: attributes.find(attribute => attribute.name === checkAttribute).value
      }
    });
  }

  return Controller.extend("com.lonwyr.MyranorBot.controller.Main", {
    formatAttributeName: function (attribute) {
      return this.getResourceBundle("i18n").getText(attribute);
    },
    getGroupHeader: function (group) {
      return new GroupHeaderListItem({
				title: group.key,
				upperCase: false
			});
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
      const attribute = getProperty(clickEvent);
      return Roller.checkAttribute(attribute);
    },
    onRollSkill: function (clickEvent) {
      const skill = getProperty(clickEvent);
      const checkParameters = {
        id: skill.id,
        name: skill.name,
        value: skill.value,
        modifier: 0,
        attributes: getAttributes(clickEvent, skill.attributes)
      };
      return Roller.checkSkill(checkParameters);
    },
    onRollSpell: function (clickEvent) {
      const spell = getProperty(clickEvent);
      const checkParameters = {
        id: spell.id,
        name: spell.name,
        value: spell.value,
        modifier: 0,
        attributes: getAttributes(clickEvent, spell.attributes)
      };
      return Roller.checkSpell(checkParameters);
    }
  });
});
