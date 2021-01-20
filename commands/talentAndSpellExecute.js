const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const cache = require('./../helper/cache')
const Discord = require('discord.js')

function compare(attr, roll, extremeCheckPenalty) {
    return Math.min(attr - extremeCheckPenalty - roll, 0)
}

function getAttribute(userId, roll, attributeArgument, defaultDescription, extremeCheckPenalty = 0) {
    if (!attributeArgument) return [NaN, roll, defaultDescription]

    const parsedArgument = parseInt(attributeArgument)
    const penalty = Number.isNaN(extremeCheckPenalty) ? 0 : extremeCheckPenalty
    if (Number.isInteger(parsedArgument)) return [parsedArgument, `${roll} /${attributeArgument - penalty}`, defaultDescription]

    const attributeValue = cache.getAttribute(userId, attributeArgument)
    return [attributeValue, `${roll} /${attributeValue - penalty}`, `${attributeArgument}`]
}

module.exports = {
    execute: async function (msg, args, config, checkName) {
        try {
            let name
            if (checkName) {
                const userId = msg.author.id
                if (!cache.checkCharacter(userId)) {
                    msg.reply('Bitte importiere erst einen Character aus der **Helden-Software**\nGehe einfach auf "Datei > Exportieren > Helden exportieren" und flüster ihn mir zu.')
                    return
                }

                name = cache.getName(userId)
                const getter = config.type === 'skill' ? cache.getSkill : cache.getSpell
                args.splice(3, 0, getter(userId, checkName))
            }

            const rolls = diceRoller.sum(20, 3).results
            const lucky = rolls.filter(roll => roll === 1).length >= 2
            const fumble = rolls.filter(roll => roll === 20).length >= 2


            let resultEmbed = new Discord.MessageEmbed()
            .setColor(colors.neutral)
            
            if (args.length < 3) {
                resultEmbed.setTitle(`${config.description ? config.description : config.title}-Probe`)
                .setDescription(`für <@${msg.author.id}>`)
            } else {
                resultEmbed.setDescription(`${config.description ? config.description : config.title}-Probe für <@${msg.author.id}>`)
            }

            const pointsProvided = Number.isInteger(parseInt(args[3]))
            let points = pointsProvided ? parseInt(args[3]) : 0
            const modifierProvided = Number.isInteger(parseInt(args[4])) && parseInt(args[4]) !== 0
            const modifier = modifierProvided ? parseInt(args[4]) : 0

            const extremeCheckPenalty = Math.max(modifier - points, 0)
            
            const [att1, att1Name, att1Description] = getAttribute(msg.author.id, rolls[0], args[0], "Attribute 1", extremeCheckPenalty)
            const [att2, att2Name, att2Description] = getAttribute(msg.author.id, rolls[1], args[1], "Attribute 2", extremeCheckPenalty)
            const [att3, att3Name, att3Description] = getAttribute(msg.author.id, rolls[2], args[2], "Attribute 3", extremeCheckPenalty)

            resultEmbed.addFields(
                { name: att1Name, value: att1Description, inline: true },
                { name: att2Name, value: att2Description, inline: true },
                { name: att3Name, value: att3Description, inline: true }
            )
    
            if (lucky) {
                resultEmbed.setTitle(`${name ? name + ' erzielt e' : 'E'}inhervorragendes Ergebnis!`)
                .setColor(colors.criticalSuccess)
            } else if (fumble) {
                resultEmbed.setTitle(`${name ? name + 'patzt!' : 'Patzer!'}`)
                .setColor(colors.criticalFailure)
            } else {
                const att1diff = compare(att1, rolls[0], extremeCheckPenalty)
                const att2diff = compare(att2, rolls[1], extremeCheckPenalty)
                const att3diff = compare(att3, rolls[2], extremeCheckPenalty)
                if (args.length >= 3 || checkName) {
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
                            resultEmbed.setTitle(`${name ? name + ' hat ' : ''}Erfolg: ${pointsLeft} ${config.abb}*`)
                            .setColor(colors.success)
                        } else {
                            resultEmbed.setTitle(`${name ? name + ' scheitert' : 'Gescheitert'} um ${-1 * pointsLeft} ${config.abb}`)
                            .setColor(colors.failure)
                        }
                    }
                }
            }

            msg.channel.send(resultEmbed)
        } catch (error) {
            msg.reply(error.message)
        }
    }
}