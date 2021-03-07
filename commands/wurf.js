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
      const diceExpression = args[0];
      // check for a single d20 with theshold
      if (parseInt(diceExpression).toString() === diceExpression) {  
        roll1d20Check(resultEmbed, diceExpression)
      } else {
        const RE_DICE = /(?<amount>\d*)[W|w|D|d](?<size>\d*)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/
        const matchObj = RE_DICE.exec(diceExpression)
        const amount = parseInt(matchObj.groups.amount) || 1
        const size = parseInt(matchObj.groups.size) || 6
        const algebraic = matchObj.groups.algebraic || '+'
        const modifier = parseInt(matchObj.groups.modifier) || 0
        const roll = diceRoller.sum(size, amount, algebraic, modifier)

        resultEmbed.addField(roll.sum, `[${roll.results.join('+')}]${modifier !== 0 ? algebraic + modifier : ''}`, true)
        .setTitle('Würfelwurf '+ diceExpression)
      }
    } else {
      const roll = diceRoller.sum(20, 1)
      resultEmbed.addField(roll.sum, 'W20', true)
      .setTitle('Würfelwurf 1W20')
    }
    
    msg.channel.send(resultEmbed)
  }
}
function roll1d20Check(resultEmbed, diceExpression) {
  const value = parseInt(diceExpression)
  const rollResult = diceRoller.sum(20, 1).sum
  const confirmationRoll = (rollResult === 1 || rollResult === 20) ? diceRoller.roll(20) : undefined

  resultEmbed.addField(rollResult, 'W20', true)
    .setTitle('Würfelwurf 1W20')
  
  if (confirmationRoll) {
    resultEmbed.addField(confirmationRoll, 'Bestätigung', true)
  }

  if (rollResult === 1 && confirmationRoll <= value) {
    resultEmbed.setColor(colors.criticalSuccess)
  } else if (rollResult === 20 && confirmationRoll > value) {
    resultEmbed.setColor(colors.criticalFailure)
  } else if (rollResult <= value) {
    resultEmbed.setColor(colors.success)
  } else {
    resultEmbed.setColor(colors.failure)
  }
}
