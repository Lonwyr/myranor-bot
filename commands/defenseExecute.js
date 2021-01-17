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
    if (args.length === 0) {
      resultEmbed.setTitle(config.title)
      .setDescription(`Für <@${msg.author.id}>`)
  } else {
      resultEmbed.setDescription(`${config.title} für <@${msg.author.id}>`)
  }

    const defenseValue = parseInt(args[0])

    const defenseDescription = Number.isInteger(defenseValue) ? '/' + defenseValue : config.title + '-Wert'

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
        .setTitle('Patzer' + (confirmationRoll > Math.min(defenseValue, 19) ? '' : '?'))
        .setColor(colors.criticalFailure)
      } else {
        resultEmbed.setTitle(config.failure)
        .setColor(colors.failure)
      }
    } else if (Number.isInteger(defenseValue)) {
      const defended = defenseRoll === 1 || (defenseRoll <= defenseValue)
      
      if (defended) {
        if (defenseRoll === 1 && confirmationRoll <= defenseValue) {
            resultEmbed.setTitle(config.criticalSuccess)
            .setColor(colors.criticalSuccess)
        } else {
            resultEmbed.setTitle(config.success)
            .setColor(colors.success)
        }      
        
      } else {
        resultEmbed.setTitle(config.failure)
        .setColor(colors.failure)
      }
    } else if (defenseRoll === 1) {
      resultEmbed.setTitle(config.potentialCriticalSucess)
      .setColor(colors.criticalSuccess)
    }

    msg.channel.send(resultEmbed)
  }
}