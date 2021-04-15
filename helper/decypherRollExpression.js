module.exports = function (expression) {
    const RE_DICE = /(?<amount>\d*)[W|w|D|d](?<size>\d*)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/
    const matchObj = RE_DICE.exec(expression)
    const amount = parseInt(matchObj.groups.amount) || 1
    const size = parseInt(matchObj.groups.size) || 6
    const algebraic = matchObj.groups.algebraic || '+'
    const modifier = parseInt(matchObj.groups.modifier) || 0
    return [size, amount, algebraic, modifier]
  }