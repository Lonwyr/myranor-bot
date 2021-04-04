const random = require('random')
const cache = require('./cache')
const messageGenerator = require('./messageGenerator')
const Discord = require('discord.js')
const colors = require('./../helper/colors')

function sum(size=6, number=1, algebraic='+', modifier=0) {
  const results = Array.from(Array(number)).map(() => random.int(min=1, max=size))
  let sum = results.reduce((previous, current) => {return previous + current}, 0)

  const factor = algebraic === '+' ? 1 : -1
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

function roll3d20check(data) {
  const rolls = sum(20, 3).results
  const lucky = rolls.filter(roll => roll === 1).length >= 2
  const fumble = rolls.filter(roll => roll === 20).length >= 2
  
  let attributes = data.attributes
  const modifier = data.modifier || 0
  const value = data.value
  const extremeCheckPenalty = Math.max(modifier - value, 0)


  rolls.forEach((roll, index) => {
    const attribute = attributes[index]      
    if (attribute) {
      attribute.value = attribute.value - extremeCheckPenalty
      attribute.result = roll
      attribute.usedPoints = Math.min(attribute.value - attribute.result, 0)
    } else {
      attributes[index] = {
        result: roll
      }
    }
  })

  if (lucky || fumble) {
      return {
          rolls: rolls,
          status: lucky ? 'lucky' : 'fumble',
          attributes: attributes
      }
  }

  const usedPoints = attributes
      .map(attribute => attribute.usedPoints)
      .reduce((alreadyUsedPoints, currendUsedPoints) => alreadyUsedPoints + currendUsedPoints)

  let pointsLeft;
  if (modifier < 0) {
      const buffer = -1 * Math.min(modifier, 0)
      const usedPointsAfterBuffering = Math.min(buffer + usedPoints, 0)
      pointsLeft = value + usedPointsAfterBuffering
  } else if (value) {
      pointsLeft = Math.max(value - modifier, 0) + usedPoints
  } else {
    pointsLeft = usedPoints
  }

  let status
  if (attributes.every(attribute => attribute.value)) {
    status = pointsLeft >= 0 ? 'success' : 'fail'
  } else {
    status = 'neutral'
  }

  return {
      rolls: rolls,
      status: status,
      attributes: attributes,
      pointsLeft: pointsLeft
  }
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
    return algebraic == '+' ? size * amount + modifier : size * amount - modifier
  },
  rollSkillOrSpell: (checkData, checkType, userid) => {
    const checkResult = roll3d20check(checkData);

    return {
        message: messageGenerator.generate3d20message(checkResult, checkData, checkType, userid),
        checkResult: checkResult
    }
  }
}
