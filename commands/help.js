
const config = require('./../config.json')
const issues = require('./issues')
const switchCommand = require('./switch')
const wurf = require('./wurf')
const at = require('./at')
const fk = require('./fk')
const pa = require('./pa')
const aw = require('./aw')
const taw = require('./taw')
const zfw = require('./zfw')

const messageReducer = (message, command) => message + '\n**' + config.prefix + command.name + '** ' + command.help

module.exports = {
  name: 'hilfe',
  description: 'provides the needed help',
  execute(msg, args) {
    if (args.length === 0) {
      const message = [issues, wurf, at, fk, pa, aw, switchCommand, taw, zfw].reduce(messageReducer, 'Der **Myranor Würfelsklave**.\n\n' +
      '**Farben** geben bei den Ergebnissen so gut es geht Auskunft:\n' +
      'Ein Simpler Wurf ohne Vergleichsmöglichkeit (**blau**) | Ein gelungener Wurf (**grün**) | Ein hervorragender Wurf (**dunkelgrün**) | Ein fehlgeschlagener Wurf (**grau**) | Ein Patzer (**rot**)\n' +
      'Folgende Befehle werden zur Zeit unterstützt:\n\n' +
      '**' + config.prefix + 'hilfe** *[command]* um genauere infos zu erhalten.')
      msg.channel.send(message)
    } else {
      const command = [issues, wurf, at, fk, pa, aw, switchCommand, taw, zfw].find((command) => command.name === args[0])
      if (command) {
        msg.channel.send(command.help + '\n\n' + command.detailedHelp)
      } else {
        msg.channel.send(`Kein Befehl mit dem namen ${args[0]} wurde gefunden`)
      }
    }
  }
}
