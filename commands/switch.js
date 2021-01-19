const cache = require('../helper/cache')

module.exports = {
  name: 'switch',
  description: 'switches the active character slot',
  help: 'switches the active character',
  execute: async function(msg, args) {
    const name = await cache.activateSlot(msg.author.id, args[0])
    if (name !== undefined) {
      msg.reply(`Charakter '${name}' in slot '${args[0]}' ist nun aktiv.`)
    } else {
      msg.reply(`Kein charakter wurde im slot '${args[0]}' gespeichert.`)
    }
  }
}
