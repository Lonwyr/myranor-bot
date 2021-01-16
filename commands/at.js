const offenseExecute = require('./offenseExecute')
const meeleFumbles = require('./../data/meeleFumbles.json')

module.exports = {
  name: 'at',
  description: 'Rolls meele attack, damage plus confirmation rolls and target area',
  help: '*[AT-Wert] [Schadenswurf] [Größendifferenz]* Würfelt für dich deine Nachkampf-Attacke plus Bestätigungs-Würfe und Trefferzonen.',
  execute(msg, args) {
    const config = {
        title: 'Attacke',
        abb: 'AT',
        fumbles: meeleFumbles
    }
    offenseExecute.execute(msg, args, config)
  }
}
