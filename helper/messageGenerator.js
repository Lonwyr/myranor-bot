const cache = require('./../helper/cache')
const Discord = require('discord.js')
const colors = require('./../helper/colors')

function generate3d20message(checkResult, checkData, checkType, userid) {
  const attribute1 = checkResult.attributes[0];
  const attribute2 = checkResult.attributes[1];
  const attribute3 = checkResult.attributes[2];

  const valueAbb = checkType === 'skill' ? 'TaW' : 'ZfW'
  const pointsAbb = checkType === 'skill' ? 'TaP' : 'ZfP'

  const checkName = checkData.name || (checkType === 'skill' ? 'Talent' : 'Zauber')
  let modifierString = ''
  if (checkData.modifier) {
      const modifierDescription = checkData.modifier > 0 ? 'erschwert' : 'erleichtert'
      modifierString = ` (${modifierDescription} um ${checkData.modifier})`
  }
  const pointsDescription = checkData.value ? `mit ${valueAbb} ${checkData.value}${modifierString}` : ''
  let resultEmbed = new Discord.MessageEmbed()
      .setColor(colors.neutral)
      .setDescription(`${checkName}-Probe${checkData.specialization ? ' (mit ' + config.specialization-Spezialisierung+ ')' : ''} ${pointsDescription} für <@${userid}>`)


  function createField(result, value, attributeName) {
    let fieldData = {
      name: result,
      value: attributeName || 'Attribut',
      inline: true
    }

    if (value) {
      fieldData.name += `/${value}`
    }

    return fieldData
  }

  // attribute results
  resultEmbed.addFields(
    createField(attribute1.result, attribute1.value,  attribute1.name),
    createField(attribute2.result, attribute2.value,  attribute2.name),
    createField(attribute3.result, attribute3.value,  attribute3.name)
  )

  const name = cache.checkCharacter(userid) ? cache.getName(userid) : ''

  switch (checkResult.status) {
    case 'lucky':
        resultEmbed.setTitle(`${name} erzielt ein hervorragendes Ergebnis!`)
          .setColor(colors.criticalSuccess)
        break;
    case 'fumble':
        resultEmbed.setTitle(`${name} patzt!`)
          .setColor(colors.criticalFailure)
        break;
    case 'fail':
        resultEmbed.setTitle(`${name} scheitert um ${-1 * checkResult.pointsLeft} ${pointsAbb}`)
          .setColor(colors.failure)
        break;
    case 'success':
        resultEmbed.setTitle(`${name} hat Erfolg: ${checkResult.pointsLeft} ${pointsAbb}*`)
          .setColor(colors.success)
        break;
    case 'neutral':
        resultEmbed.setTitle('3W20 Probe')
          .setColor(colors.neutral)
        break;
  }

  return resultEmbed
}

module.exports = {
  generate3d20message: generate3d20message
}
