const skills = require('./../data/skills')
const spells = require('./../data/spells')
const taw = require('./taw')
const zfw = require('./zfw')

let exportModules = {}

createCommand = (name, attributes, category) => {
  return {
    name: name,
    category: category,
    attributes: attributes,
    description: `Rolls a ${category} check.`,
    help: `*[TaW] [Modifikator]* Würfelt für dich eine ${category}.\nSollten nicht alle Attribute vorhanden sein, wird komplett ohne Attributeswerte gewürfelt.`,
    detailedHelp: '',
    execute(msg, args) {
      const command = this.category === 'taw' ? taw : zfw
      command.execute(msg, attributes.concat(args))
    }
  }
}

for (spell of spells.items) {
  exportModules[spell.name] = createCommand(spell.name, spell.attributes, 'zfw')
}

for (skill of skills.items) {
  exportModules[skill.name] = createCommand(skill.name, skill.attributes, 'taw')
}

module.exports = exportModules
