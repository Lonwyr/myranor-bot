const trefferzonen = require("./../data/trefferzonen.json")
const diceRoller = require("./../helper/diceRoller")

module.exports = {
  name: 'at',
  description: 'Rolls attack, damage plus confirmation rolls and target area',
  help: '*[AT-Wert] [Schadenswurf] [Größendifferenz]* Würfelt für dich deine Attacke plus Bestätigungs-Würfe und Trefferzonen.',
  execute(msg, args) {
    const attackRoll = diceRoller.roll(20)
    const confirmationRoll = (attackRoll === 1 || attackRoll === 20) ? diceRoller.roll(20) : undefined

    let message = ' greift an [' + attackRoll + (confirmationRoll ? ' >> ' + confirmationRoll + ']' : ']')

    if (args.length > 0) {
      const hit = attackRoll === 1 || (attackRoll <= args[0] && attackRoll !== 20)
      message = message + ' und **' + (hit ? 'könnte treffen' : 'verfehlt') + '**'

      const fumble = attackRoll === 20 && confirmationRoll > args[0]
      if (fumble) {
        let fumbleRoll = diceRoller.sum(6, 2)
        message = message + '\nPatzer [' + fumbleRoll.results.join(', ') + '] **' + fumbleRoll.sum + '**'
      }

      if (hit) {
        if (args.length > 1) {
          const RE_DAMAGE = /(?<amount>\d*)[W|w](?<size>\d?)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/;
          const matchObj = RE_DAMAGE.exec(args[1]);
          const amount = parseInt(matchObj.groups.amount) || 1
          const size = parseInt(matchObj.groups.size) || 6
          const algebraic = matchObj.groups.algebraic || "+"
          const modifier = parseInt(matchObj.groups.modifier) || 0
          let damageRoll = diceRoller.sum(size, amount, algebraic, modifier)

          message  = message + '\n[' + damageRoll.results.join(', ') + ']' + algebraic + modifier + ' für **' + damageRoll.sum + ' TP**'
        }
        
        const sizeDifference = args[2] !== undefined ? args[2] : "0"
        const hitTable = trefferzonen[sizeDifference]
        const zoneRoll = diceRoller.roll(20)
        let targetZone
        let targetZoneLimit = 21
        for (const [zone, limit] of Object.entries(hitTable)) {
          if (limit >= zoneRoll && limit < targetZoneLimit) {
            targetZone = zone
            targetZoneLimit = limit
          }
        }
        
        message = message + '\n[' + zoneRoll + '] auf **' + targetZone + ' **'
        
        if (targetZone === "Arme" || targetZone === "Beine") {
          message = message + (zoneRoll % 2 ? " (links)" : "(rechts)")
        }
      }
    }

    msg.reply(message) 
  }
}
