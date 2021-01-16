const defenseExecute = require('./defenseExecute')

module.exports = {
  name: 'pa',
  description: 'Rolls defense with weapons',
  help: '*[PA-Wert]* Würfelt für dich deine Parade plus Bestätigungs-Würfe bei einem Patzer.',
  execute(msg, args) {
    const config = {
      title: 'Parrieren',
      color: '#27AE60',
      success: 'Parriert',
      criticalSuccess: 'Glückliche Parade',
      failure: 'Getroffen'
    }
    defenseExecute.execute(msg, args, config)
  }
}
