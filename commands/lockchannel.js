const cache = require('../helper/cache')

module.exports = {
  name: 'lockchannel',
  description: 'locks the channel for posting checks from the app',
  help: '',
  execute: async function(msg) {
    const userId = msg.author.id
    const channelId = msg.channel.id
    
    await cache.setChannel(userId, channelId)

    msg.reply(`Dieser Channel ist nun das Ziel von Würfen aus der App.`)

    const pw = cache.createAppPassword(userId)

    msg.author.send(`dein Passwort: ${pw}`)
  }
}
