const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const Discord = require('discord.js')

module.exports = {
  name: 'wurf',
  description: 'Rolls a check',
  help: 'Würfelt die Würfel.',
  detailedHelp: 'Standard wird 1W20 gewürfelt.\nBeispiele: 2W6+4 3w20-2 d10 w6+4.',
  execute(msg, args) {
    let resultEmbed = new Discord.MessageEmbed()
    .setColor(colors.neutral)
    .setDescription(`Für <@${msg.author.id}>`)

    if (args.length > 0) {
      const RE_DICE = /(?<amount>\d*)[W|w|D|d](?<size>\d*)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/
      const matchObj = RE_DICE.exec(args[0])
      const amount = parseInt(matchObj.groups.amount) || 1
      const size = parseInt(matchObj.groups.size) || 6
      const algebraic = matchObj.groups.algebraic || '+'
      const modifier = parseInt(matchObj.groups.modifier) || 0
      const roll = diceRoller.sum(size, amount, algebraic, modifier)

      resultEmbed.addField(roll.sum, '[' + roll.results.join('+') + ']' + algebraic + modifier, true)
      .setTitle('Würfelwurf '+ args[0])
    } else {
      const roll = diceRoller.sum(20, 1)
      resultEmbed.addField(roll.sum, '[' + roll.results.join('+') + ']', true)
      .setTitle('Würfelwurf 1W20')
    }
    
    msg.channel.send(resultEmbed)
  }
}
