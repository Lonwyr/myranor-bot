
const config = require("./../config.json")

module.exports = {
  name: 'help',
  description: 'provides the needed help',
  execute(msg, args) {
    msg.channel.send('Der Myranor Würfelsklave.\n' +
    'Folgende Befehle werden zur Zeit unterstützt:\n' +
    '**' + config.prefix + 'help** um genau diese Nachricht zu lesen.')
  }
}
