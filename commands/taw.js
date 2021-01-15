const diceRoller = require("./../helper/diceRoller")

function compare(attr, roll, extremeCheckPenalty) {
  return Math.min(attr - extremeCheckPenalty - roll, 0)
}

module.exports = {
  name: 'taw',
  description: 'Rolls a skill check',
  help: '*[Attribute1 Attribute2, Attribute3] [TaW] [Modifikator]* Würfelt für dich eine Talentprobe.',
  execute(msg, args) {
    const rolls = diceRoller.sum(20, 3).results
    const lucky = rolls.filter(roll => roll === 1).length >= 2
    const fumble = rolls.filter(roll => roll === 20).length >= 2

    let message = ' versucht sein Glück [' + rolls.join(', ') + ']'

    if (lucky) message = message + " und erzielt ein **hervorragendes Ergebnis**"
    if (fumble) message = message + " und **patzt**"

    if (!lucky && !fumble && args.length > 2) {
      const att1 = parseInt(args[0])
      const att2 = parseInt(args[1])
      const att3 = parseInt(args[2])

      const taw = parseInt(args[3]) || 0
      const modifier = parseInt(args[4]) || 0

      const extremeCheckPenalty = Math.max(modifier - taw, 0)
  
      const att1diff = compare(att1, rolls[0], extremeCheckPenalty)
      const att2diff = compare(att2, rolls[1], extremeCheckPenalty)
      const att3diff = compare(att3, rolls[2], extremeCheckPenalty)

      const tawProvided = args.length > 3 && !extremeCheckPenalty

      if (!tawProvided) {
        const diffSum = (att1diff + att2diff + att3diff) * -1
        message = message + '\nbenötigt **' + diffSum + '** TaP zum ausgleichen'
      } else {
        const buffer = -1 * Math.min(modifier, 0)
        const bufferLeft = buffer + att1diff + att2diff + att3diff
        const tap = taw + Math.min(bufferLeft, 0)
        if (tap >= 0) message = message + '\nmit **Erfolg** und **' + tap + ' TaP* **'
        else message = message + '\nund **scheitert** um **' + tap + ' TaP* **'
      }
    }

    msg.reply(message)
  }
}
