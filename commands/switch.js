const cache = require('../helper/cache')

module.exports = {
  name: 'switch',
  description: 'switches the active character slot',
  help: '**slot 1** **slot 2** und **Slot** wechselt den charakter-slot. Ohne Wert verrate ich dir den aktuell Aktiven Charakter.',
  execute: async function(msg, args) {
    const userId = msg.author.id
    const slot = args[0]
    if (!slot) {
      msg.reply(`Charakter '${cache.getName(userId)}' ist aktiv.`)
      return
    }

    const name = await cache.activateSlot(userId, slot)
    if (name !== undefined) {
      msg.reply(`Charakter '${name}' in slot '${slot}' ist nun aktiv.`)
    } else {
      msg.reply(`Kein charakter wurde im slot '${slot}' gespeichert.`)
    }
  }
}
