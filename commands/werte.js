const cache = require('./../helper/cache')

module.exports = {
  name: 'werte',
  description: 'Saves values for users',
  help: '**EXPERIMENT** *<Abkürzung>=<Wert>* Speichert Werte, die man in taw und zfw nutzen kann.',
  execute(msg, args) {
    try {
      cache.store(msg.author.id, args)
      msg.reply('Werte gespeichert bis der Bot sie vergisst - noch keine DB da :)')
    } catch (error) {
      msg.reply(error.message)
    }
  }
}
