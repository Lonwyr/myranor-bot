const diceRoller = require('./../helper/diceRoller')
const colors = require('./../helper/colors')
const meeleFumbles = require('./../data/meeleFumbles.json')
const Discord = require('discord.js')

module.exports = {
  execute: function (msg, args, config) {
    const data = {
      value: args[0] && parseInt(args[0]),
      type: config.type,
      tp: args[1],
      name: config.type === 'parry' ? 'Parade' : 'Ausweichen',
      sizeDifference: args[2] || 0
    }

    const result = diceRoller.rollDefense(data, msg.author.id)
    msg.channel.send(result.message)
  }
}