const roll = require('./roll')
const rollExpression = require('./rollExpression')
const sum = require('./sum')
const trefferzonen = require('../../data/trefferzonen.json')
const meeleFumbles = require('../../data/meeleFumbles.json')

module.exports = function (data) {
    const defenseRoll = roll(20)
    const confirmationRoll = (defenseRoll === 1 || defenseRoll === 20) ? roll(20) : undefined

    let checkResultData = {
        defenseRoll: defenseRoll,
        confirmationRoll: confirmationRoll
    }
    
    const paValue = data.value

    if (defenseRoll === 20 && (confirmationRoll === 20 || (!Number.isInteger(paValue) || confirmationRoll > paValue))) {
        checkResultData.status = "criticalHit"
        let fumbleRoll = sum(6, 2)
        checkResultData.fumbleRoll = meeleFumbles.results.find(result => {
            return result.range.min <= fumbleRoll.sum && result.range.max >= fumbleRoll.sum
        })
        checkResultData.fumbleRoll.roll = fumbleRoll
    } else if (Number.isInteger(paValue)) {
        const defended = defenseRoll === 1 || (defenseRoll <= paValue)
        
        if (defended) {
            if (defenseRoll === 1 && confirmationRoll <= paValue) {
                checkResultData.status = "criticalDefended"
            } else {
                checkResultData.status = "defended"
            }

            if (data.tp) {
                checkResultData.damageRoll = rollExpression(data.tp)
            }
        } else {
            checkResultData.status = 'hit'
        }
    } else if (defenseRoll === 1) {
        checkResultData.status = 'potentialCriticalDefended'
    }

    return checkResultData
}