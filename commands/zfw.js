const talentAndSpellExecute = require('./talentAndSpellExecute')

module.exports = {
  name: 'zfw',
  description: 'Rolls a spell check',
  help: '*[Attribute1 Attribute2, Attribute3] [ZfW] [Modifikator]* Würfelt für dich eine Zauberprobe.',
  execute(msg, args) {
    const config = {
      title: 'Zauberprobe',
      value: 'ZfW',
      abb: 'ZfP'
    }
    talentAndSpellExecute.execute(msg, args, config)
  }
}
