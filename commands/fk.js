const offenseExecute = require('./offenseExecute')
const rangedFumbles = require('./../data/rangedFumbles.json')
const Discord = require('discord.js')

module.exports = {
  name: 'fk',
  description: 'Rolls ranged attack, damage plus confirmation rolls and target area',
  help: '*[FK-Wert] [Schadenswurf] [Größendifferenz]* Würfelt für dich deine Fernkampf-Attacke plus Bestätigungs-Würfe und Trefferzonen.',
  execute(msg, args) {
    const config = {
        title: 'Attacke',
        abb: 'FK',
        fumbles: rangedFumbles
    }
    offenseExecute.execute(msg, args, config)
  }
}
