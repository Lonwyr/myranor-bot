const offenseExecute = require('./offenseExecute')
const meeleFumbles = require('./../data/meeleFumbles.json')

module.exports = {
  name: 'at',
  description: 'Rolls meele attack, damage plus confirmation rolls and target area',
  help: '*[AT-Wert] [Schadenswurf] [Größendifferenz]* Würfelt für dich deine Nachkampf-Attacke.',
  detailedHelp: 'Bei einem Treffer wird auch die Trefferzone und der Schaden, falls angegeben, gewürfelt.\n' + 
  'Bei einer 1 oder 20 wird wird er Bestätigungs-Wurf gemacht und bei einem Patzer die Patzer-Tabelle gewürfelt.',
  execute(msg, args) {
    const config = {
        abb: 'AT',
        fumbles: meeleFumbles
    }
    offenseExecute.execute(msg, args, config)
  }
}
