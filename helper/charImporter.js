
const convert = require('xml-js')
const request = require('request')
const cache = require('./cache')

const attributeAbbs = {
    "Mut": "MU",
    "Klugheit": "KL",
    "Intuition": "IN",
    "Charisma": "CH",
    "Fingerfertigkeit": "FF",
    "Gewandtheit": "GE",
    "Konstitution": "KO",
    "Körperkraft": "KK"
}

function extractAttributes(attributes) {
    let attributesJson = {}

    for (attribute of attributes) {
        const attributesAbb = attributeAbbs[attribute._attributes.name]
        if (attributesAbb) attributesJson[attributesAbb] = parseInt(attribute._attributes.value)
    }

    return attributesJson
}

function extractSkillsAndSpells(list) {
    let json = {}

    for (item of list) {
        const name = item._attributes.name.replace(/[\ |\/|:]/gm, '').toLowerCase()
        const value = parseInt(item._attributes.value)
        if (!name.startsWith('lesenschreiben') && !name.startsWith('sprachenkennen')) {
            json[name] = parseInt(value)
        }
    }

    return json
}

module.exports = {
    import: function (msg) {
        const userId = msg.author.id
        const url = msg.attachments.toJSON()[0].url
        if (!url.endsWith('.xml')) throw new Error('no XML provided')

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const charString = convert.xml2json(body, {compact: true, spaces: 2})
                const char = JSON.parse(charString).helden.held
                const attributes = char.eigenschaften.eigenschaft            
                const skills = char.talentliste.talent
                const spells = char.zauberliste.zauber

                let charJson = {
                    name: char._attributes.name,
                    attributes: extractAttributes(attributes),
                    skills: extractSkillsAndSpells(skills),
                    spells: extractSkillsAndSpells(spells)
                }

                cache.store(userId, charJson)
                
            msg.reply('Got it! Ich wärm die Würfel schon mal vor!')
            } else {
                throw error
            }
        })
    }
}