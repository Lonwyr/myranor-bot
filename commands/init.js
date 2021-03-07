const initController = require('../helper/initController')

module.exports = {
  name: 'init',
  description: '',
  help: 'Erstellt im Kanal eine **Initiative-Tabelle**.\n\tKann genutzt werden mit **/init <Wert>**, **/init set <Name> <Wert>** und **/init remove <name>**.\n\tAntworten mit ☠️ entfernt seinen Char/Nutzernamen.',
  detailedHelp: '',
  execute(msg, args) {
    initController.onInit(msg, args)
  }
}
