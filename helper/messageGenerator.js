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
  if (checkData.modifier > 0) {
      modifierString = ` (erschwert um ${checkData.modifier})`
  } else if (checkData.modifier < 0) {
    modifierString = ` (erleichtert um ${-1 * checkData.modifier})`
  }
  const pointsDescription = checkData.value ? `mit ${valueAbb} ${checkData.value}${modifierString}` : ''
  let resultEmbed = new Discord.MessageEmbed()
      .setDescription(`${checkName}-Probe${checkData.specialization ? ' (mit Spezialisierung)' : ''} ${pointsDescription} für <@${userid}>`)


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
        break
    case 'fumble':
        resultEmbed.setTitle(`${name} patzt!`)
          .setColor(colors.criticalFailure)
        break
    case 'fail':
        resultEmbed.setTitle(`${name} scheitert um ${-1 * checkResult.pointsLeft} ${pointsAbb}`)
          .setColor(colors.failure)
        break
    case 'success':
        resultEmbed.setTitle(`${name} hat Erfolg: ${checkResult.pointsLeft} ${pointsAbb}*`)
          .setColor(colors.success)
        break
    default:
        resultEmbed.setTitle('3W20 Probe')
          .setColor(colors.neutral)
        break
  }

  return resultEmbed
}

function generateAttackMessage(checkResult, checkData, userid) {
  let modifierString = ''
  if (checkData.modifier > 0) {
      modifierString = ` (erschwert um ${checkData.modifier})`
  } else if (checkData.modifier < 0) {
    modifierString = ` (erleichtert um ${-1 * checkData.modifier})`
  }

  let resultEmbed = new Discord.MessageEmbed()
    .setDescription(`${checkData.name}${modifierString} für <@${userid}>`)

  const abb = checkData.type === 'meele' ? 'AT' : 'FK'    
  const atDescription = Number.isInteger(checkData.value) ? '/' + checkData.value : abb + '-Wert'

  if (checkResult.confirmationRoll) {
    resultEmbed.addFields(
      { name: checkResult.attackRoll, value: atDescription, inline: true },
      { name: checkResult.confirmationRoll, value: 'Prüfwurf' }
    )
  } else {
      resultEmbed.addField(checkResult.attackRoll, atDescription)
  }

  if (checkResult.damageRoll) {
    const re = /[+-]\d*/g
    const mod = checkData.tp.match(re)[0]
    const modString = mod ? ' ' + mod : ''
    const damageRoll = checkResult.damageRoll
    resultEmbed.addField(`${damageRoll.sum} TP`, `[${damageRoll.results.join('+')}]${modString}`, true)
    
  }

  if (checkResult.hitZoneName) {
    const sizeDiffText = checkData.sizeDifference ? `; Größendifferenz: ${checkData.sizeDifference}` : ''
    resultEmbed.addField(checkResult.hitZoneName, `[${checkResult.hitZoneRoll}] Trefferzone${sizeDiffText}`, true)
  }

  const name = cache.checkCharacter(userid) ? cache.getName(userid) : ''

  switch (checkResult.status) {
    case 'criticalHit':
        resultEmbed.setTitle(`${name} trifft mit einer glücklichen Attacke!`)
          .setColor(colors.criticalSuccess)
        break
    case 'potentialCriticalHit':
        resultEmbed.setTitle(`${name} trifft potentiell mit einer glücklichen Attacke!`)
          .setColor(colors.criticalSuccess)
        break
    case 'criticalMiss':
        resultEmbed.setTitle(`${name} patzt!`)
          .setColor(colors.criticalFailure)
          .addField(`${checkResult.fumbleRoll.title}: ${checkResult.fumbleRoll.description}`, ' [' + checkResult.fumbleRoll.roll.results.join('+') + '] Patzer-Wurf')
        break
    case 'miss':
        resultEmbed.setTitle(`${name} verfehlt`)
          .setColor(colors.failure)
        break
    case 'hit':
        resultEmbed.setTitle(`${name} trifft`)
          .setColor(colors.success)
        break
    default:
        resultEmbed.setTitle('Attacke')
          .setColor(colors.neutral)
        break
  }

  return resultEmbed
}

module.exports = {
  generate3d20message: generate3d20message,
  generateAttackMessage: generateAttackMessage
}
