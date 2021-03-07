const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const trefferzonen = require('./../data/trefferzonen.json')
const Discord = require('discord.js')

module.exports = {
    execute: function (msg, args, config) {
        const attackRoll = diceRoller.roll(20)
        const confirmationRoll = (attackRoll === 1 || attackRoll === 20) ? diceRoller.roll(20) : undefined
        
        let resultEmbed = new Discord.MessageEmbed()
        .setColor(colors.neutral)
        if (args.length === 0) {
            resultEmbed.setTitle(config.title)
            .setDescription(`Für <@${msg.author.id}>`)
        } else {
            resultEmbed.setDescription(`Attacke für <@${msg.author.id}>`)
        }
        const atValue = parseInt(args[0])

        const atDescription = Number.isInteger(atValue) ? '/' + atValue : config.abb + '-Wert'

        if (confirmationRoll) {
            resultEmbed.addFields(
                { name: attackRoll, value: atDescription, inline: true },
                { name: confirmationRoll, value: 'Prüfwurf', inline: true }
            )
        } else {
            resultEmbed.addField(attackRoll, atDescription)
        }

        if (attackRoll === 20) {
            if (confirmationRoll === 20 || (!Number.isInteger(atValue) || confirmationRoll > atValue)) {
                let fumbleRoll = diceRoller.sum(6, 2)
                const fumbleResult = config.fumbles.results.find(result => {
                    return result.range.min <= fumbleRoll.sum && result.range.max >= fumbleRoll.sum
                })
                resultEmbed.addField(fumbleRoll.sum, ' [' + fumbleRoll.results.join('+') + '] Patzer-Wurf')
                resultEmbed.addField(fumbleResult.title, fumbleResult.description)
                .setTitle('Patzer' + (confirmationRoll === 20 || Number.isInteger(atValue) ? "" : "?"))
                .setColor(colors.criticalFailure)
            } else {
                resultEmbed.setTitle('Attacke verfehlt')
                .setColor(colors.failure)
            }
        } else if (Number.isInteger(atValue)) {
        const hit = attackRoll === 1 || (attackRoll <= atValue)
        
        if (hit) {
            if (attackRoll === 1 && confirmationRoll <= atValue) {
                resultEmbed.setTitle('Glückliche Attacke!')
                .setColor(colors.criticalSuccess)
            } else {
                resultEmbed.setTitle('erfolgreiche Attacke')
                .setColor(colors.success)
            }

            if (args.length > 1) {
                const RE_DAMAGE = /(?<amount>\d*)[W|w|D|d](?<size>\d*)(?<algebraic>[\+|\-]?)(?<modifier>\d*)/;
                const matchObj = RE_DAMAGE.exec(args[1])
                const amount = parseInt(matchObj.groups.amount) || 1
                const size = parseInt(matchObj.groups.size) || 6
                const algebraic = matchObj.groups.algebraic || '+'
                const modifier = parseInt(matchObj.groups.modifier) || 0
                const damageRoll = diceRoller.sum(size, amount, algebraic, modifier)

                resultEmbed.addField(`${damageRoll.sum} TP`, `[${damageRoll.results.join('+')}]${modifier !== 0 ? algebraic + modifier : ''}`, true)
            }
            
            const sizeDifference = args[2] !== undefined ? args[2] : '0'
            const hitTable = trefferzonen[sizeDifference]
            const zoneRoll = diceRoller.roll(20)
            let targetZone
            let targetZoneLimit = 21
            for (const [zone, limit] of Object.entries(hitTable)) {
                if (limit >= zoneRoll && limit < targetZoneLimit) {
                    targetZone = zone
                    targetZoneLimit = limit
                }
            }
            
            let zoneMessage = targetZone
            if (targetZone === 'Arme' || targetZone === 'Beine') {
                zoneMessage = zoneMessage + (zoneRoll % 2 ? ' (links)' : ' (rechts)')
            } 
            resultEmbed.addField(zoneMessage, `[${zoneRoll}] Trefferzone; Größendifferent: ${sizeDifference}`, true)
        } else {
            resultEmbed.setTitle('Attacke verfehlt')
            .setColor(colors.failure)
        }
        } else if (attackRoll === 1) {
            resultEmbed.setTitle('potentiell geglücklte Attacke?')
            .setColor(colors.criticalSuccess)
        }

        msg.channel.send(resultEmbed)
    }
}
