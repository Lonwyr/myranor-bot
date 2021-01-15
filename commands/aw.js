const diceRoller = require("../helper/diceRoller")

module.exports = {
  name: 'aw',
  description: 'Rolls dodge',
  help: '*[AW-Wert]* Würfelt für dich dein Ausweichen plus Bestätigungs-Würfe bei einem Patzer.',
  execute(msg, args) {
    const defenseRoll = diceRoller.roll(20)
    const confirmationRoll = (defenseRoll === 20) ? diceRoller.roll(20) : undefined

    let message = ' pariert [' + defenseRoll + (confirmationRoll ? ' >> ' + confirmationRoll + ']' : ']')

    if (args.length > 0) {
      const success = defenseRoll === 1 || (defenseRoll <= args[0] && defenseRoll !== 20)
      message = message + ' und **' + (success ? 'weicht aus' : 'wird getroffen') + '**'

      const fumble = defenseRoll === 20 && confirmationRoll > args[0]
      if (fumble) {
        let fumbleRoll = diceRoller.sum(6, 2)
        message = message + '\nPatzer [' + fumbleRoll.results.join(', ') + '] **' + fumbleRoll.sum + '**'
      }
    }

    msg.reply(message) 
  }
}
