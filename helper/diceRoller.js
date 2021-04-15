const messageGenerator = require('./messageGenerator')
const Discord = require('discord.js')
const rollAttack = require('./roller/attack')
const roll3d20check = require('./roller/3d20check')
const sum = require('./roller/sum')
const roll = require('./roller/roll')
const decypherRollExpression = require('./decypherRollExpression')
const rollExpression = require('./roller/rollExpression')

module.exports = {
  sum: sum,
  roll: roll,
  rollExpression: rollExpression,
  max: (expression) => {
    [size, amount, algebraic, modifier] = decypherRollExpression(expression)
    return algebraic == '+' ? size * amount + modifier : size * amount - modifier
  },
  rollSkillOrSpell: (checkData, checkType, userid) => {
    const checkResult = roll3d20check(checkData)
    return {
        message: messageGenerator.generate3d20message(checkResult, checkData, checkType, userid),
        checkResult: checkResult
    }
  },
  rollAttack: function (checkData, userid) {
    // no size difference in case of a non-meele attack
    if (checkData.type !== 'meele') {
      checkData.sizeDifference = 0;
    }
    if (checkData.modifier) {
      ckeckData.value = checkData.value - checkData.modifier
    }
    
    const checkResult = rollAttack(checkData)
    return {
        message: messageGenerator.generateAttackMessage(checkResult, checkData, userid),
        checkResult: checkResult
    }
  }
}
