const offenseExecute = require('./offenseExecute')
const rangedFumbles = require('./../data/rangedFumbles.json')

module.exports = {
  name: 'fk',
  description: 'Rolls ranged attack, damage plus confirmation rolls and target area',
  help: '*[FK-Wert] [Schadenswurf] [Größendifferenz]* Würfelt für dich deine Fernkampf-Attacke.',
  detailedHelp: 'Bei einem Treffer wird auch die Trefferzone und der Schaden, falls angegeben, gewürfelt.\n' + 
  'Bei einer 1 oder 20 wird wird er Bestätigungs-Wurf gemacht und bei einem Patzer die Patzer-Tabelle gewürfelt.',
  execute(msg, args) {
    const config = {
        abb: 'FK',
        title: 'Fernkampfangriff',
        fumbles: rangedFumbles
    }
    offenseExecute.execute(msg, args, config)
  }
}
