const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const cache = require('./../helper/cache')
const Discord = require('discord.js')

function compare(attr, roll, extremeCheckPenalty) {
    return Math.min(attr - extremeCheckPenalty - roll, 0)
}

function getAttribute(userId, attributeArgument, defaultDescription) {
    if (!attributeArgument) return [NaN, defaultDescription]

    const parsedArgument = parseInt(attributeArgument)
    if (Number.isInteger(parsedArgument)) return [parsedArgument, `/${attributeArgument}`]

    const attributeValue = cache.get(userId, attributeArgument)
    return [attributeValue, `${attributeArgument} (${attributeValue})`]
}

module.exports = {
    execute: function (msg, args, config) {
        const rolls = diceRoller.sum(20, 3).results
        const lucky = rolls.filter(roll => roll === 1).length >= 2
        const fumble = rolls.filter(roll => roll === 20).length >= 2


        let resultEmbed = new Discord.MessageEmbed()
        .setColor(colors.neutral)
        
        if (args.length < 3) {
            resultEmbed.setTitle(config.title)
            .setDescription(`Für <@${msg.author.id}>`)
        } else {
            resultEmbed.setDescription(`${config.title} für <@${msg.author.id}>`)
        }  

        try {
            const [att1, att1Description] = getAttribute(msg.author.id, args[0], "Attribute 1")
            const [att2, att2Description] = getAttribute(msg.author.id, args[1], "Attribute 2")
            const [att3, att3Description] = getAttribute(msg.author.id, args[2], "Attribute 3")

            const pointsProvided = Number.isInteger(parseInt(args[3]))
            let points = pointsProvided ? parseInt(args[3]) : 0
            const modifierProvided = Number.isInteger(parseInt(args[4])) && parseInt(args[4]) !== 0
            const modifier = modifierProvided ? parseInt(args[4]) : 0

            const extremeCheckPenalty = Math.max(modifier - points, 0)

            const att1diff = compare(att1, rolls[0], extremeCheckPenalty)
            const att2diff = compare(att2, rolls[1], extremeCheckPenalty)
            const att3diff = compare(att3, rolls[2], extremeCheckPenalty)

            const att1ModifiedValue = att1 - extremeCheckPenalty
            const att2ModifiedValue = att2 - extremeCheckPenalty
            const att3ModifiedValue = att3 - extremeCheckPenalty
            resultEmbed.addFields(
                { name: rolls[0], value: att1Description, inline: true },
                { name: rolls[1], value: att2Description, inline: true },
                { name: rolls[2], value: att3Description, inline: true }
            )
    
            if (lucky) {
                resultEmbed.setTitle('Ein hervorragendes Ergebnis!')
                .setColor(colors.criticalSuccess)
            } else if (fumble) {
                resultEmbed.setTitle('Patzer!')
                .setColor(colors.criticalFailure)
            } else if (args.length >= 3) {
                if (pointsProvided) {
                    const pointsTitle = points + (modifierProvided ? ` (${modifier})` : '')
                    const modifierDescription = modifier > 0 ? 'Erschwernis' : 'Erleichterung'
                    const pointsDescription = config.value + (modifierProvided ? ' (' + modifierDescription +')' : '')
                    resultEmbed.addField(pointsTitle, pointsDescription)
                }

                if (extremeCheckPenalty > 0) points = 0

                if (args.length === 3) {
                    const diffSum = (att1diff + att2diff + att3diff) * -1
                    if (diffSum === 0) {
                        resultEmbed.setTitle('Alle Punkte übrig')
                    } else {
                        resultEmbed.setTitle(`benötigt ${diffSum} ${config.abb} zum Ausgleichen`)
                        .setColor(colors.failure)
                    }
                } else {
                    const buffer = -1 * Math.min(modifier, 0)
                    const bufferLeft = buffer + att1diff + att2diff + att3diff
                    const pointsLeft = Math.max(points - Math.max(modifier, 0), 0) + Math.min(bufferLeft, 0)

                    if (pointsLeft >= 0) {
                        resultEmbed.setTitle(`Erfolg: ${pointsLeft} ${config.abb}*`)
                        .setColor(colors.success)
                    } else {
                        resultEmbed.setTitle(`Gescheitert: um ${-1 * pointsLeft} ${config.abb}`)
                        .setColor(colors.failure)
                    }
                }
            }

            msg.channel.send(resultEmbed)
        } catch (error) {
            msg.reply(error.message)
        }
    }
}