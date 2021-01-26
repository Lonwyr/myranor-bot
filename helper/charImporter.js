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
        if (attributesAbb) attributesJson[attributesAbb] = parseInt(attribute._attributes.value) + parseInt(attribute._attributes.mod)
    }

    return attributesJson
}

function extractSkillsAndSpells(list) {
    let json = {}

    if (list) {
        for (item of list) {
            let name = item._attributes.name.replace(/[\ |\/|:]/gm, '').toLowerCase()
            name = name.replace(/elementar\((.*?)\)/gm, '$1') // elemental spells
            name = name.replace(/liturgiekenntnis\:\ .*/gm, 'liturgiekenntnis') // Ritual- und Liturgiekenntnis
            const value = parseInt(item._attributes.value)
            if (!name.startsWith('lesenschreiben') && !name.startsWith('sprachenkennen')) {
                json[name] = parseInt(value)
            }
        }
    }

    return json
}

module.exports = {
    import: function (msg) {
        let slot = 1

        if (msg.content) {
            slot = parseInt(msg.content)
            if (Number.isNaN(slot) || slot < 1 || slot > 3) {
                msg.reply("Sorry bitte nenn mir einen gültigen Slot (**1**, **2** oder **3**)")
                return
            }

            slot = parseInt(msg.content)
        }

        const userId = msg.author.id
        const url = msg.attachments.toJSON()[0].url
        if (!url.endsWith('.xml') && !url.endsWith('.json')) throw new Error('no XML or JSON provided')

        request.get(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let charJson

                if (url.endsWith('.xml')) {
                    const charString = convert.xml2json(body, {compact: true, spaces: 2})
                    const char = JSON.parse(charString).helden.held
                    const attributes = char.eigenschaften.eigenschaft
                    const skills = char.talentliste.talent
                    const spells = char.zauberliste.zauber

                    charJson = {
                        name: char._attributes.name,
                        attributes: extractAttributes(attributes),
                        skills: extractSkillsAndSpells(skills)
                    }

                    charJson.spells = extractSkillsAndSpells(spells)
                } else {
                    charJson = JSON.parse(body)
                }

                cache.store(userId, charJson, slot)
                
            msg.reply(`Charakter is gespeichert in **Slot ${slot}**.\nIch wärm die Würfel schon mal vor!`)
            } else {
                throw error
            }
        })
    }
}