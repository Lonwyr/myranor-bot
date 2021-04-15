const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const trefferzonen = require('./../data/trefferzonen.json')
const Discord = require('discord.js')

module.exports = {
    execute: function (msg, args, config) {
        const data = {
            value: args[0] && parseInt(args[0]),
            type: config.type,
            tp: args[1],
            name: config.type === 'meele' ? 'AT' : 'FK',
            sizeDifference: args[2] || 0
        }

        const result = diceRoller.rollAttack(data, msg.author.id)
        msg.channel.send(result.message)
    }
}
