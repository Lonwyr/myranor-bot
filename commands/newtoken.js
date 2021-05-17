const cache = require('../helper/cache')

module.exports = {
  name: 'newtoken',
  description: 'creates a new token for the app',
  help: 'Generiert ein neues Token für die App.',
  execute: async function(msg) {
    const userId = msg.author.id
    const pw = await cache.createAppPassword(userId)
    msg.author.send(`Du kannst nun die App ${process.env.url}/index.html nutzten. Dein Token: ${pw}`)
  }
}
