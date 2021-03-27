const cache = require('../helper/cache')
const meta = require('./../data/meta')
const talentAndSpellExecute = require('./talentAndSpellExecute')

let exportModules = {}

createCommand = (metatalent) => {
  return {
    name: metatalent.name,
    category: 'meta',
    metatalent: metatalent,
    description: `Rolls a meta-talent check.`,
    descriptionText: metatalent.description,
    help: `*[Modifikator]* Würfelt für dich eine Meta-Talent-Probe.`,
    detailedHelp: '',
    execute(msg, args) {
      const userId = msg.author.id
      const missingSkills = this.metatalent.skills.map(skill => {
        return skill.name
      }).filter(skillname => {
        return !cache.checkSkill(userId, skillname)
      })
    
      if (missingSkills.length > 0) {
        msg.reply(`Das Meta-Talent **${this.name}** ist für deinen Char nicht aktiviert.\nEs fehlt: ${missingSkills.join(', ')}`)
        return
      }
    
      let divisor = 0;
      let sum = metatalent.modifier || 0;
      let max = 100; // will be lowered with the first value
    
      for (const skill of metatalent.skills) {
        const skillValue = cache.getSkill(userId, skill.name)
        sum += skillValue
        divisor += skill.factor
        max = Math.min(max, skillValue*2)
      }

      for (const skill of metatalent.limits) {
        const skillValue = cache.getSkill(userId, skill.name)
        max = Math.min(max, skillValue*skill.factor)
      }
    
      const metaskillValue = Math.min(max, Math.round(sum / divisor))

      talentAndSpellExecute.execute(msg, metatalent.attributes.concat(args), this.name, this.descriptionText)
    }
  }
}

for (metatalent of meta.items) {
  exportModules[metatalent.name] = createCommand(metatalent)
}

module.exports = exportModules
