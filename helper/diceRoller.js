const random = require('random')

function sum(size=6, number=1, algebraic="+", modifier=0) {
  const results = Array.from(Array(number)).map(() => random.int(min=1, max=size))
  let sum = results.reduce((previous, current) => {return previous + current}, 0)

  const factor = algebraic === "+" ? 1 : -1
  sum += (modifier * factor)

  return {
      results: results,
      sum: sum
  }
}
function extractProperties(expression) {
  const RE_DICE = /(?<amount>\d*)[W|w|D|d](?<size>\d*)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/
  const matchObj = RE_DICE.exec(expression)
  const amount = parseInt(matchObj.groups.amount) || 1
  const size = parseInt(matchObj.groups.size) || 6
  const algebraic = matchObj.groups.algebraic || '+'
  const modifier = parseInt(matchObj.groups.modifier) || 0
  return [size, amount, algebraic, modifier]
}

module.exports = {
  sum: sum,
  roll: (size) => random.int(min=1, max=size),
  rollExpression: (expression) => {
    [size, amount, algebraic, modifier] = extractProperties(expression)
    return sum(size, amount, algebraic, modifier)
  },
  max: (expression) => {
    [size, amount, algebraic, modifier] = extractProperties(expression)
    return algebraic == "+" ? size * amount + modifier : size * amount - modifier
  }
}
