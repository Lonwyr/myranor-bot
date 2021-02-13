const defenseExecute = require('./defenseExecute')

module.exports = {
  name: 'pa',
  description: 'Rolls defense with weapons',
  help: '*[PA-Wert]* Würfelt für dich deine Parade.',
  detailedHelp: 'Bei einer 1 oder 20 wird wird er Bestätigungs-Wurf gemacht und bei einem Patzer die Patzer-Tabelle gewürfelt.',
  execute(msg, args) {
    const config = {
      title: 'Parade',
      color: '#27AE60',
      success: 'Parriert',
      criticalSuccess: 'Glückliche Parade',
      failure: 'Getroffen'
    }
    defenseExecute.execute(msg, args, config)
  }
}
