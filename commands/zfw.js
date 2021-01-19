const talentAndSpellExecute = require('./talentAndSpellExecute')
const spells = require('./../data/spells')

const spellNames = spells.items.map(spell => spell.name).join(', ')

module.exports = {
  name: 'zfw',
  description: 'Rolls a spell check',
  help: '*[Attribute1 Attribute2, Attribute3] [ZfW] [Modifikator]* Würfelt für dich eine Zauberprobe.\n\tEin **spezieller Zauber** kann auch direkt mit seinem Namen gewürfelt werden, wenn die Attribute mit dem Befehl **wert** vorher gespeichert wurden. Bsp: **/dämonisch** oder **/carafei 8 -2** mit dem ZfW und der Erleichterung.',
  detailedHelp: '**Attribute** können als Zahlen angegeben werden oder mit den gespeicherten Werten vom **werte** command.\n**ZfW** ist eine Zahl\n**Modifikatoren** sind die Erschwernis (positiv) oder die Erleichterung (negativ)\n\n**Mehrere Optionen** stehen zur Verfügung:\n\t*zfw* - wirft alle würfel und gibt die 3 Ergebnisse zurück.\n\t*zfw [Attribute1 Attribute2, Attribute3]* - sagt, wieviel ZfP* auszugeben sind.\n\t*zfw [Attribute1 Attribute2, Attribute3] [ZfW]* - sagt, ob es geschafft wurde und wieviel ZfP* übrig sind.\n\t*zfw [Attribute1 Attribute2, Attribute3]* - sagt, wieviel ZfP* auszugeben sind.\n\t*zfw [Attribute1 Attribute2, Attribute3] [ZfW] [Erschwernis/Erleichterung]* - rechnet die Erschwernis/Erleichterung noch mit ein.\n**Erlaubte Zauber**\n\t' + spellNames,
  execute(msg, args, spellName, description) {
    const config = {
      title: 'Zauber',
      value: 'ZfW',
      abb: 'ZfP',
      type: 'spell',
      description: description
    }
    talentAndSpellExecute.execute(msg, args, config, spellName)
  }
}
