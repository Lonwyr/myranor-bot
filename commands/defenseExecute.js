const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const meeleFumbles = require('./../data/meeleFumbles.json')
const Discord = require('discord.js')

module.exports = {
    execute: function (msg, args, config) {
        
    const defenseRoll = diceRoller.roll(20)
    const confirmationRoll = (defenseRoll === 1 || defenseRoll === 20) ? diceRoller.roll(20) : undefined
    
    let resultEmbed = new Discord.MessageEmbed()
      .setColor(colors.neutral)
      .setTitle(config.title)
      .setAuthor(msg.author.username)

    const defenseValue = parseInt(args[0])

    const defenseDescription = config.title + '-Wert' + (Number.isInteger(defenseValue) ? ': ' + defenseValue : '')

    if (confirmationRoll) {
      resultEmbed.addFields(
        { name: defenseRoll, value: defenseDescription, inline: true },
        { name: confirmationRoll, value: "Prüfwurf", inline: true }
      )
    } else {
      resultEmbed.addField(defenseRoll, defenseDescription)
    }

    if (defenseRoll === 20) {
      if (!Number.isInteger(defenseValue) || confirmationRoll > defenseValue) {
        let fumbleRoll = diceRoller.sum(6, 2)
        const fumbleResult = meeleFumbles.results.find(result => {
          return result.range.min <= fumbleRoll.sum && result.range.max >= fumbleRoll.sum
        })

        resultEmbed.addField(fumbleRoll.sum, ' [' + fumbleRoll.results.join('+') + '] Patzer-Wurf')
        .addField(fumbleResult.title, fumbleResult.description)
        .setDescription('Patzer' + (confirmationRoll > defenseValue ? '' : '?'))
        .setColor(colors.criticalFailure)
      } else {
        resultEmbed.setDescription(config.failure)
        .setColor(colors.failure)
      }
    } else if (Number.isInteger(defenseValue)) {
      const defended = defenseRoll === 1 || (defenseRoll <= defenseValue)
      
      if (defended) {
        if (defenseRoll === 1 && confirmationRoll <= defenseValue) {
            resultEmbed.setDescription(config.criticalSuccess)
            .setColor(colors.criticalSuccess)
        } else {
            resultEmbed.setDescription(config.success)
            .setColor(colors.success)
        }      
        
      } else {
        resultEmbed.setDescription(config.failure)
        .setColor(colors.failure)
      }
    } else if (defenseRoll === 1) {
      resultEmbed.setDescription(config.potentialCriticalSucess)
      .setColor(colors.criticalSuccess)
    }

    msg.channel.send(resultEmbed)
  }
}