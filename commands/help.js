
const config = require("./../config.json")
const at = require('./at')
const pa = require('./pa')
const aw = require('./aw')

const messageReducer = (message, command) => message + '\n**' + config.prefix + command.name + '** ' + command.help

module.exports = {
  name: 'help',
  description: 'provides the needed help',
  execute(msg, args) {
    const message = [at, pa, aw].reduce(messageReducer, 'Der **Myranor Würfelsklave**.\n' +
    'Folgende Befehle werden zur Zeit unterstützt:\n\n' +
    '**' + config.prefix + 'help** um genau diese Nachricht zu lesen.')

    msg.channel.send(message)
  }
}
