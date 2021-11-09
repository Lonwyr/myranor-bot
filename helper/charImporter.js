const convert = require('xml-js')
const request = require('request')
const cache = require('./cache')
const { ReactionManager } = require('discord.js')

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

const energies = [{
    name: "Lebensenergie",
    abb: "LeP",
    components: ["KO", "KO", "KK"],
    factor: 0.5
}, {
    name: "Ausdauer",
    abb: "AuP",
    components: ["MU", "KO", "GE"],
    factor: 0.5
}, {
    name: "Astralenergie",
    abb: "AsP",
    components: ["MU", "IN", "CH"],
    factor: 0.5
}]

function extractStats(char, charJson) {
    let stats = {}

    energies.forEach(function (energy) {
        const energyEntry = char.eigenschaften.eigenschaft.find(attribute => attribute._attributes.name === energy.name)
        const basis = energy.components
            .map(component => charJson.attributes[component])
            .reduce((a,b) => a + b) * energy.factor
        const mod = parseInt(energyEntry._attributes.mod)
        stats[energy.abb] = Math.round(basis + mod)
    })

    return stats
}

function extractSkillsAndSpells(list, extractAttributes) {
    let json = {}

    if (list) {
        for (item of list) {
            let name = item._attributes.name.replace(/[\ |\/|:]/gm, '').toLowerCase()
            name = name.replace(/elementar\((.*?)\)/gm, '$1') // elemental spells
            name = name.replace(/liturgiekenntnis\:\ .*/gm, 'liturgiekenntnis') // Ritual- und Liturgiekenntnis
            const value = parseInt(item._attributes.value)
            if (!name.startsWith('lesenschreiben') && !name.startsWith('sprachenkennen')) {
                if (!extractAttributes) {
                    json[name] = parseInt(value)
                } else {
                    json[name] = {
                        value: parseInt(value),
                        name: item._attributes.name,
                        representation: item._attributes.repraesentation,
                        attributes: item._attributes.probe.replace(/[()]/gm, '').split('/')
                    }
                }

            }
        }
    }

    return json
}

function extractInstructions(list) {
    let sfs = []
    const instructionSf = list.find(sf => sf._attributes.name === "Instruktion")
    if (instructionSf) {
        const instructionSfNames = instructionSf.auswahl.map(instruction => instruction._attributes.name.replace("/", " "))
        sfs = sfs.concat(instructionSfNames)
    }
    const influxtionSf = list.map(sf => sf._attributes.name).filter(sfName => sfName.startsWith("Influxion"))
    sfs = sfs.concat(influxtionSf)

    return sfs
}

function extractSpontaneousCasting(list) {
    const parametersMap = {
        Reichweite: 'range',
        Struktur: 'structure',
        Wirkungsdauer: 'maxDuration',
        Zauberdauer: 'castingTime',
        Zielobjekt: 'targets',
        Influxion: 'influxion',
        Instruktion: 'instruction',
        Invokation: 'invocation',
        Inspiration: 'inspiration',
        Dämonisch: 'demonic',
        Elementar: 'elemental',
        Naturwesen: 'spirits',
        Stellar: 'stellar',
        Totenwesen: 'specter'
                
    }

    let spontaneousCasting = {
        categories: {
            inspiration: false,
            invocation: false,
            instruction: false,
            influxion: false
        },
        parameters: {
            range: 0,
            castingTime: 0,
            maxDuration: 0,
            structure: 0,
            targets: 0
        },
        invocation: {
            demonic: 0,
            elemental: 0,
            spirits: 0,
            stellar: 0,
            specter: 0
        },
        inspiration: {
            demonic: 0,
            elemental: 0,
            spirits: 0,
            stellar: 0,
            specter: 0
        }
    }
    const spontaneousCastingSf = list.find(sf => sf._attributes.name === "Spontanzauberer")
    if (spontaneousCastingSf) {
        spontaneousCastingSf.auswahl
            .map(selection => selection._attributes.name)
            .forEach(category => {
                spontaneousCasting.categories[parametersMap[category]] = true
            })
    }

    const spontaneousCastingParameterSf = list.find(item => item._attributes.name === "Spontanzaubererei")
    if (spontaneousCastingParameterSf) {
        spontaneousCastingParameterSf.auswahl.forEach(parameterSf => {
            const parameterName = parametersMap[parameterSf.wahl[1]._attributes.value]
            spontaneousCasting.parameters[parameterName] = parseInt(parameterSf.wahl[0]._attributes.value)
        })
    }

    const geniusSummoningSfs = list.find(item => item._attributes.name === "Geniusbeschwörung")
    if (geniusSummoningSfs) {
        geniusSummoningSfs.auswahl.forEach(geniusSummoningSf => {
            const sphere = parametersMap[geniusSummoningSf.wahl[0]._attributes.value]
            const discipline = parametersMap[geniusSummoningSf.wahl[1]._attributes.value]
            spontaneousCasting[discipline][sphere] = 1
        })
    }

    const archonSummoningSfs = list.find(item => item._attributes.name === "Geniusbeschwörung")
    if (archonSummoningSfs) {
        archonSummoningSfs.auswahl.forEach(archonSummoningSf => {
            const sphere = parametersMap[archonSummoningSf.wahl[0]._attributes.value]
            const discipline = parametersMap[archonSummoningSf.wahl[1]._attributes.value]
            spontaneousCasting[discipline][sphere] = 2
        })
    }

    return spontaneousCasting
}

const aventuricRepresentations = [
    "Magier",
    "Hexe"
]

function filterSpells(spells, aventuric) {
    return spells.filter(spell => {
        const containedInAventuricRepresentations = aventuricRepresentations.includes(spell._attributes.repraesentation)
        return containedInAventuricRepresentations === aventuric
    })
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
                try {
                if (!error && response.statusCode == 200) {
                    let charJson

                    if (url.endsWith('.xml')) {
                        const charString = convert.xml2json(body, {compact: true, spaces: 2})
                        const char = JSON.parse(charString).helden.held
                        const attributes = char.eigenschaften.eigenschaft
                        const skills = char.talentliste.talent
                        const spells = char.zauberliste.zauber || []
                        const aventuricSpells = filterSpells(spells, true)
                        const myranicSpells = filterSpells(spells, false)
                        const sf = char.sf.sonderfertigkeit

                        charJson = {
                            name: char._attributes.name,
                            attributes: extractAttributes(attributes),
                            skills: extractSkillsAndSpells(skills),
                            spells: extractSkillsAndSpells(myranicSpells),
                            ritualcasting: !!sf.find(s => s._attributes.name === "Großbeschwörung"),
                            aventuricSpells: extractSkillsAndSpells(aventuricSpells, true),
                            instructions: extractInstructions(sf),
                            spontaneousCasting: extractSpontaneousCasting(sf)
                        }

                        charJson.stats = extractStats(char, charJson)

                    } else {
                        charJson = JSON.parse(body)
                    }

                    cache.store(userId, charJson, slot)
                    
                msg.reply(`Charakter ist gespeichert in **Slot ${slot}**.\nIch wärm die Würfel schon mal vor!`)
                } else {
                    throw error
                }
            } catch (error) {
                console.log(error)
                msg.reply(`Charakter konnte nicht gespeichert werden.\n${error.message}`)
            }
        })
    }
}