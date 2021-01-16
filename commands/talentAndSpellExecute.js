const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const Discord = require('discord.js')

function compare(attr, roll, extremeCheckPenalty) {
    return Math.min(attr - extremeCheckPenalty - roll, 0)
}

module.exports = {
    execute: function (msg, args, config) {
        const rolls = diceRoller.sum(20, 3).results
        const lucky = rolls.filter(roll => roll === 1).length >= 2
        const fumble = rolls.filter(roll => roll === 20).length >= 2

        let resultEmbed = new Discord.MessageEmbed()
        .setColor(colors.neutral)
        .setTitle(config.title)
        .setAuthor(msg.author.username)

        const att1 = parseInt(args[0])
        const att2 = parseInt(args[1])
        const att3 = parseInt(args[2])

        let points = parseInt(args[3]) || 0
        const modifier = parseInt(args[4]) || 0

        const extremeCheckPenalty = Math.max(modifier - points, 0)

        const att1diff = compare(att1, rolls[0], extremeCheckPenalty)
        const att2diff = compare(att2, rolls[1], extremeCheckPenalty)
        const att3diff = compare(att3, rolls[2], extremeCheckPenalty)

        const pointsProvided = args.length > 3 && !extremeCheckPenalty

        if (pointsProvided) {
            resultEmbed.addField(points, config.value)
            if (Number.isInteger(modifier)) resultEmbed.addField(modifier, 'Erleichterung / Erschwernis')
        } else if (extremeCheckPenalty > 0) {
            points = 0
        }

        const att1ModifiedValue = att1 - extremeCheckPenalty
        const att2ModifiedValue = att2 - extremeCheckPenalty
        const att3ModifiedValue = att3 - extremeCheckPenalty
        resultEmbed.addFields(
            { name: rolls[0], value: Number.isInteger(att1) ? 'Wert: ' + att1ModifiedValue : 'Attribut 1', inline: true },
            { name: rolls[1], value: Number.isInteger(att2) ? 'Wert: ' + att2ModifiedValue : 'Attribut 2', inline: true },
            { name: rolls[2], value: Number.isInteger(att3) ? 'Wert: ' + att3ModifiedValue : 'Attribut 3', inline: true }
        )
 
        if (lucky) {
            resultEmbed.setDescription('Ein hervorragendes Ergebnis!')
            .setColor(colors.criticalSuccess)
        } else if (fumble) {
            resultEmbed.setDescription('Patzer!')
            .setColor(colors.criticalFailure)
        } else if (args.length > 2) {
            if (args.length === 3) {
                const diffSum = (att1diff + att2diff + att3diff) * -1
                const resultMessage = diffSum === 0 ? 'mit allen Punkten übrig' : 'benötigt ' + diffSum + ' ' + config.abb + ' zum Ausgleichen'
                resultEmbed.setDescription(resultMessage)
            } else {
                const buffer = -1 * Math.min(modifier, 0)
                const bufferLeft = buffer + att1diff + att2diff + att3diff
                const pointsLeft = Math.max(points - Math.max(modifier, 0), 0) + Math.min(bufferLeft, 0)

                if (pointsLeft >= 0) {
                    resultEmbed.setDescription('mit Erfolg und ' + pointsLeft + ' ' + config.abb + '*')
                    .setColor(colors.success)
                } else {
                    resultEmbed.setDescription('Gescheitert um ' + (-1 * pointsLeft) + ' ' + config.abb)
                    .setColor(colors.failure)
                }
            }
        }

        msg.channel.send(resultEmbed)
    }
}