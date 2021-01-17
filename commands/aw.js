const defenseExecute = require('./defenseExecute')

module.exports = {
  name: 'aw',
  description: 'Rolls dodge',
  help: '*[AW-Wert]* Würfelt für dich dein Ausweichen plus Bestätigungs-Würfe bei einem Patzer.',
  detailedHelp: 'Bei einer 1 oder 20 wird wird er Bestätigungs-Wurf gemacht und bei einem Patzer die Patzer-Tabelle gewürfelt.',
  execute(msg, args) {
    const config = {
      title: 'Ausweichen',
      color: '#27AE60',
      success: 'Ausgewichen',
      criticalSuccess: 'Glückliches Ausweichen',
      failure: 'Getroffen'
    }
    defenseExecute.execute(msg, args, config)
  }
}
