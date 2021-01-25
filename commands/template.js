const defenseExecute = require('./defenseExecute')

module.exports = {
  name: 'template',
  description: 'Provides the export tempalte',
  help: 'Gibt dir eine Datei, die man editieren kann. **Flüster** mir einfach die ausgefüllte Datei zurück.',
  detailedHelp: '',
  execute(msg, args) {
    msg.reply("Hier ist dein **Template**.\nFüll es aus, *optional* kannst du nicht aktivierte Talente löschen.\n**Flüster** es mir zurück. Gibst du 1, 2 oder 3 an, schiebe ich es in einen entsprechenden Slot.", {
      files: [
        "./data/import.json"
      ]
    });
  }
}
