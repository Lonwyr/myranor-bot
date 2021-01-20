const skills = require('./../data/skills')
const spells = require('./../data/spells')
const taw = require('./taw')
const zfw = require('./zfw')

let exportModules = {}

createCommand = (name, attributes, descriptionText, category) => {
  return {
    name: name,
    category: category,
    attributes: attributes,
    description: `Rolls a ${category} check.`,
    descriptionText: descriptionText,
    help: `*[TaW] [Modifikator]* Würfelt für dich eine ${category}.\nSollten nicht alle Attribute vorhanden sein, wird komplett ohne Attributeswerte gewürfelt.`,
    detailedHelp: '',
    execute(msg, args) {
      const specialization = !!(args[0] === '+')
      if (specialization) {
        args.splice(0, 1)
      }
      const command = this.category === 'taw' ? taw : zfw
      command.execute(msg, attributes.concat(args), this.name, this.descriptionText, specialization)
    }
  }
}

for (spell of spells.items) {
  for (prefix of ['e', 'w']) {
    const description = (prefix === 'e' ? 'Essenz: ' : 'Wesen: ') + spell.description
    exportModules[prefix + spell.name] = createCommand(prefix + spell.name, spell.attributes, description, 'zfw')
  }
}

for (skill of skills.items) {
  exportModules[skill.name] = createCommand(skill.name, skill.attributes, skill.description, 'taw')
}

module.exports = exportModules
