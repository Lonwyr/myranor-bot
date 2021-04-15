const roll = require('./roll')
const rollExpression = require('./rollExpression')
const sum = require('./sum')
const trefferzonen = require('./../../data/trefferzonen.json')
const meeleFumbles = require('./../../data/meeleFumbles.json')
const rangedFumbles = require('./../../data/rangedFumbles.json')

module.exports = function (data) {
    const attackRoll = roll(20)
    const confirmationRoll = (attackRoll === 1 || attackRoll === 20) ? roll(20) : undefined

    let checkResultData = {
        attackRoll: attackRoll,
        confirmationRoll: confirmationRoll
    }
    
    const atValue = data.value

    if (attackRoll === 20 && (confirmationRoll === 20 || (!Number.isInteger(atValue) || confirmationRoll > atValue))) {
        checkResultData.status = "criticalMiss"
        let fumbleRoll = sum(6, 2)
        const fumbles = data.type === "meele" ? meeleFumbles : rangedFumbles;
        checkResultData.fumbleRoll = fumbles.results.find(result => {
            return result.range.min <= fumbleRoll.sum && result.range.max >= fumbleRoll.sum
        })
        checkResultData.fumbleRoll.roll = fumbleRoll
    } else if (Number.isInteger(atValue)) {
        const hit = attackRoll === 1 || (attackRoll <= atValue)
        
        if (hit) {
            if (attackRoll === 1 && confirmationRoll <= atValue) {
                checkResultData.status = "criticalHit"
            } else {
                checkResultData.status = "hit"
            }

            if (data.tp) {
                checkResultData.damageRoll = rollExpression(data.tp)
            }
            
            const sizeDifference = data.sizeDifference || '0'
            const hitTable = trefferzonen[sizeDifference]
            const zoneRoll = roll(20)
            let targetZone
            let targetZoneLimit = 21
            for (const [zone, limit] of Object.entries(hitTable)) {
                if (limit >= zoneRoll && limit < targetZoneLimit) {
                    targetZone = zone
                    targetZoneLimit = limit
                }
            }
            
            let zoneMessage = targetZone
            if (targetZone === 'Arme' || targetZone === 'Beine') {
                zoneMessage = zoneMessage + (zoneRoll % 2 ? ' (links)' : ' (rechts)')
            }
            checkResultData.hitZoneRoll = zoneRoll
            checkResultData.hitZoneName = zoneMessage
        } else {
            checkResultData.status = 'miss'
        }
    } else if (attackRoll === 1) {
        checkResultData.status = 'potentialCriticalHit'
    }

    return checkResultData
}