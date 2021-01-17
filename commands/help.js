
const config = require('./../config.json')
const issues = require('./issues')
const werte = require('./werte')
const wurf = require('./wurf')
const at = require('./at')
const fk = require('./fk')
const pa = require('./pa')
const aw = require('./aw')
const taw = require('./taw')
const zfw = require('./zfw')

const messageReducer = (message, command) => message + '\n**' + config.prefix + command.name + '** ' + command.help

module.exports = {
  name: 'help',
  description: 'provides the needed help',
  execute(msg, args) {
    const message = [issues, werte, wurf, at, fk, pa, aw, taw, zfw].reduce(messageReducer, 'Der **Myranor Würfelsklave**.\n' +
    'Folgende Befehle werden zur Zeit unterstützt:\n\n' +
    '**' + config.prefix + 'help** *[command]* um genauere infos zu erhalten diese Nachricht zu lesen.')

    msg.channel.send(message)
  }
}
