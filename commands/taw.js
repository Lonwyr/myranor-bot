const talentAndSpellExecute = require("./talentAndSpellExecute")

module.exports = {
  name: 'taw',
  description: 'Rolls a skill check',
  help: '*[Attribute1 Attribute2, Attribute3] [TaW] [Modifikator]* Würfelt für dich eine Talentprobe.',
  execute(msg, args) {
    talentAndSpellExecute.execute(msg, args, "TaP")
  }
}
