const messageGenerator = require('./messageGenerator')
const Discord = require('discord.js')
const rollAttack = require('./roller/attack')
const rollDefense = require('./roller/defense')
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
    const checkResult = rollAttack(checkData)
    return {
        message: messageGenerator.generateAttackMessage(checkResult, checkData, userid),
        checkResult: checkResult
    }
  },
  rollDefense: function (checkData, userid) {
    const checkResult = rollDefense(checkData)
    return {
        message: messageGenerator.generateDefenseMessage(checkResult, checkData, userid),
        checkResult: checkResult
    }
  }
}
