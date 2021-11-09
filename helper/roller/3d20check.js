const sum = require('./sum')

module.exports = function (data) {
    const rolls = sum(20, 3).results
    const lucky = rolls.filter(roll => roll === 1).length >= 2
    const fumble = rolls.filter(roll => roll === 20).length >= 2
    
    let attributes = data.attributes
    const modifier = data.modifier || 0
    const value = data.value + (data.specialization ? 2 : 0)
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

    if (status === 'success') {
      pointsLeft += data.ritualCasting ? 7 : 0;
    }
  
    return {
        rolls: rolls,
        status: status,
        attributes: attributes,
        pointsLeft: pointsLeft
    }
  }