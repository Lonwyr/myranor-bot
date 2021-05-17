const cache = require('../helper/cache')

module.exports = {
  name: 'lockchannel',
  description: 'locks the channel for posting checks from the app',
  help: 'Setzt den Channel in dem die Würfel-App ihre Ergebnisse postet. Außerdem wird beim ersten Aufruf ein Token für den Login generiert. Später kann dieser mit **/newtoken** neu generiert werden.',
  execute: async function(msg) {
    const userId = msg.author.id
    const channelId = msg.channel.id

    await cache.setChannel(userId, channelId)
    
    msg.react('✅')

    const pwExists = await cache.checkUserId(userId)
    if (!pwExists) {
      const pw = await cache.createAppPassword(userId)
      msg.author.send(`Du kannst nun die App ${process.env.url}/index.html nutzten. Dein Token: ${pw}`)
    }
  }
}
