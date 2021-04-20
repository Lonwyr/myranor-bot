const sum = require('./sum')

module.exports = function (data) {
  const roll = sum(20, 1).sum
  const confirmationRoll = roll === 1 || roll === 20 ? sum(20, 1).sum : undefined
  let result = {
    roll: roll,
    confirmationRoll: confirmationRoll
  }
  
  if (roll === 1 && confirmationRoll <= data.value) {
    result.status = 'lucky'
  } else if (roll === 20 && confirmationRoll > data.value) {
    result.status = 'fumble'
  } else {
    result.status = roll <= data.value ? 'success' : 'fail'
  }
  
  return result
}