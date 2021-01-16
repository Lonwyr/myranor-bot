const diceRoller = require('../helper/diceRoller')

module.exports = {
  name: 'issues',
  description: 'Info for feedback',
  help: '*Gibt Informationen, wie man Bugs melden kann oder einfach nur Danke sagen.',
  execute(msg, args) {
    const message = ''
    msg.reply(message) 
  }
}
