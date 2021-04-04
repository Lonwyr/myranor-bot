const skills = require('./../data/skills')
const spells = require('./../data/spells')

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
    return Object.keys(attributes).map(attributeName => {
        return {
            name: attributeName,
            value: attributes[attributeName]
        }
    })
}

function extractSkills(characterSkills) {
    var objects = []
    for (var name in characterSkills) {
        var dataEntry = skills.items.find(skillDataObject => skillDataObject.name === name)
        if (dataEntry) {
            objects.push({
                id: name,
                category: dataEntry.category,
                name: dataEntry.description,
                attributes: dataEntry.attributes,
                value: characterSkills[name]
            })
        }
    }
    return objects
}

function extractSpells(characterSpells) {
    var objects = []
    for (var name in characterSpells) {
        const category = name[0] === 'e' ? "Essenz" : "Wesen"
        var dataEntry = spells.items.find(spellDataObject => spellDataObject.name === name.substring(1))
        if (dataEntry) {
            objects.push({
                id: name,
                name: dataEntry.description,
                category: category,
                attributes: dataEntry.attributes,
                value: characterSpells[name]
            })
        }
    }
    return objects
}

module.exports = {
    export: function (character) {
        let characterExport = {
            name: character.name,
            attributes: extractAttributes(character.attributes),
            skills: extractSkills(character.skills),
            spells: extractSpells(character.spells)
        }

        return characterExport
    }
}