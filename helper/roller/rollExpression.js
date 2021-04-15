const decypherRollExpression = require('./../decypherRollExpression')
const sum = require('./sum')

module.exports = function (expression) {
    [size, amount, algebraic, modifier] = decypherRollExpression(expression)
    return sum(size, amount, algebraic, modifier)
  }