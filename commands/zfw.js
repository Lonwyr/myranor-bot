const talentAndSpellExecute = require('./talentAndSpellExecute')

module.exports = {
  name: 'zfw',
  description: 'Rolls a spell check',
  help: '*[Attribute1 Attribute2, Attribute3] [ZfW] [Modifikator]* Würfelt für dich eine Zauberprobe.',
  detailedHelp: '**Attribute** können als Zalen angegeben werden oder mit den gespeicherten Werten vom **werte** command.\n\n**Mehrere Optionen** stehen zur Verfügung:\n**zwf** wirft alle würfel und gibt die 3 Ergebnisse zurück.\n**zfw [Attribute1 Attribute2, Attribute3]** sagt, wieviel TaP* auszugeben sind.\n**zfw [Attribute1 Attribute2, Attribute3] [TaW]** sagt, ob es geschafft wurde und wieviel TaP* übrig sind.\n**zfw [Attribute1 Attribute2, Attribute3]** sagt, wieviel TaP* auszugeben sind.\n**zfw [Attribute1 Attribute2, Attribute3] [TaW] [Erschwernis/Erleichterung] rechnet die Erschwernis/Erleichterung noch mit ein.**',
  execute(msg, args) {
    const config = {
      title: 'Zauberprobe',
      value: 'ZfW',
      abb: 'ZfP'
    }
    talentAndSpellExecute.execute(msg, args, config)
  }
}
