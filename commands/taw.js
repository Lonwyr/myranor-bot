const talentAndSpellExecute = require('./talentAndSpellExecute')

module.exports = {
  name: 'taw',
  description: 'Rolls a skill check',
  help: '*[Attribute1 Attribute2, Attribute3] [TaW] [Modifikator]* Würfelt für dich eine Talentprobe.',
  detailedHelp: '**Attribute** können als Zalen angegeben werden oder mit den gespeicherten Werten vom **werte** command.\n\n**Mehrere Optionen** stehen zur Verfügung:\n**zwf** wirft alle würfel und gibt die 3 Ergebnisse zurück.\n**zfw [Attribute1 Attribute2, Attribute3]** sagt, wieviel TaP* auszugeben sind.\n**zfw [Attribute1 Attribute2, Attribute3] [TaW]** sagt, ob es geschafft wurde und wieviel TaP* übrig sind.\n**zfw [Attribute1 Attribute2, Attribute3]** sagt, wieviel TaP* auszugeben sind.\n**zfw [Attribute1 Attribute2, Attribute3] [TaW] [Erschwernis/Erleichterung] rechnet die Erschwernis/Erleichterung noch mit ein.**',
  execute(msg, args) {
    const config = {
      title: 'Talentprobe',
      value: 'TaW',
      abb: 'TaP'
    }
    talentAndSpellExecute.execute(msg, args, config)
  }
}
