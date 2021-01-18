const talentAndSpellExecute = require('./talentAndSpellExecute')
const skills = require('./../data/skills')

const skillNames = skills.items.map(skill => skill.name).join(', ')

module.exports = {
  name: 'taw',
  description: 'Rolls a skill check',
  help: '*[Attribute1 Attribute2, Attribute3] [TaW] [Modifikator]* Würfelt für dich eine Talentprobe.\n\tEin **spezielles Talent** kann auch direkt mit seinem Namen gewürfelt werden, wenn die Attribute mit dem Befehl **wert** vorher gespeichert wurden. Bsp: **/stoffefärben** oder **/sinnesschärfe 5 3** mit dem TaW und der Erschwernis.',
  detailedHelp: '**Attribute** können als Zahlen angegeben werden oder mit den gespeicherten Werten vom **werte** command.\n**TaW** ist eine Zahl\n**Modifikatoren** sind die Erschwernis (positiv) oder die Erleichterung (negativ)\n\n**Mehrere Optionen** stehen zur Verfügung:\n\t*taw* - wirft alle würfel und gibt die 3 Ergebnisse zurück.\n\t*taw [Attribute1 Attribute2, Attribute3]* - sagt, wieviel TaP* auszugeben sind.\n\t*taw [Attribute1 Attribute2, Attribute3] [TaW]* - sagt, ob es geschafft wurde und wieviel TaP* übrig sind.\n\t*taw [Attribute1 Attribute2, Attribute3]* - sagt, wieviel TaP* auszugeben sind.\n\t*taw [Attribute1 Attribute2, Attribute3] [TaW] [Erschwernis/Erleichterung]* - rechnet die Erschwernis/Erleichterung noch mit ein.\n**Erlaubte Talente** sind zu viele für eine Nachricht :) - einfach alles zusammen schreiben und ohne / siehe Beispiele.',
  execute(msg, args) {
    const config = {
      title: 'Talentprobe',
      value: 'TaW',
      abb: 'TaP'
    }
    talentAndSpellExecute.execute(msg, args, config)
  }
}
