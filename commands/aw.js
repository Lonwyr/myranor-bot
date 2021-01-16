const defenseExecute = require('./defenseExecute')

module.exports = {
  name: 'aw',
  description: 'Rolls dodge',
  help: '*[AW-Wert]* Würfelt für dich dein Ausweichen plus Bestätigungs-Würfe bei einem Patzer.',
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
