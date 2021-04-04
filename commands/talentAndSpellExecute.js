const diceRoller = require('./../helper/diceRoller')
const cache = require('./../helper/cache')

function getAttribute(userId, attributeArgument) {
    const parsedArgument = parseInt(attributeArgument)
    if (Number.isInteger(parsedArgument)) {
        return {
            value: parsedArgument
        }
    }
    return {
        value: cache.getAttribute(userId, attributeArgument),
        name: attributeArgument
    }
}

module.exports = {
    execute: async function (msg, args, config, checkName) {
        try {
            const userid = msg.author.id
            let attributes = []
            if (args.length >= 3) {
                attributes = args.slice(0,3).map(value => getAttribute(userid, value))
            }

            let value
            let modifier
            if (checkName) {
                value = config.type === 'skill' ? cache.getSkill(userid, checkName) : cache.getSpell(userid, checkName)
                modifier = parseInt(args[3]) || 0
            } else {
                value = parseInt(args[3]) || 0
                modifier = parseInt(args[4]) || 0
            }

            const result = diceRoller.rollSkillOrSpell({
                name: checkName ? config.description : config.title,
                attributes: attributes,
                value: value,
                modifier: modifier,
            }, config.type, msg.author.id)
            msg.channel.send(result.message)
        } catch (error) {
            msg.reply(error.message)
        }
    }
}