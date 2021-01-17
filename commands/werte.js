const cache = require('./../helper/cache')

module.exports = {
  name: 'werte',
  description: 'Saves values for users',
  help: '*<Abkürzung>=<Wert>* Speichert Werte, die man in taw und zfw nutzen kann.',
  detailedHelp: '**Erlaubte Werte** sind MU, KL, IN, CH, GE, FF, KO, KK.\nEinzugeben als MU=12 KL=10 ..\nMitgegebene Werte, die bereits vergeben waren, werden überschrieben.\n**Jeder Wert** kann **pro Benutzer nur einmal** vergeben werden.',
  execute: async function (msg, args) {
    try {
      await cache.store(msg.author.id, args)
      msg.reply('Werte gespeichert.')
    } catch (error) {
      console.error(error.message)
      msg.reply(error.message)
    }
  }
}
