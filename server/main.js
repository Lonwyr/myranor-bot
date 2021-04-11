const botHandler = require('./../botHandler')
const cache = require('./../helper/cache')
const diceRoller = require('./../helper/diceRoller')

async function getUserIdByUserToken(req, res) {
    const usertoken = req.body && req.body.token || req.headers.usertoken
    const userid = await cache.getUserIdByAppPassword(usertoken)
    if (!userid) {
        res.status(403)
        res.send()
    } else {
        return userid
    }
}

module.exports = {
    handleRequest: (req, res) => {
        debugger
        res.send("ok")

    },
    validateUsertoken: async (req, res) => {
        const userid = await getUserIdByUserToken(req, res)
        if (userid) {
            res.send()
        }
    },
    start: async (req, res) => {
        const userid = await getUserIdByUserToken(req, res)
        if (userid) {
            const character = botHandler.getCharacter(userid)
            const channel = await botHandler.getChannel(userid)
            res.send({
                character: character,
                settings: {
                    slots: await cache.getSlotInfo(userid),
                    channel: `${channel.guild.name} - ${channel.name}`
                }
            })
        }
    },
    checkAttribute: async (req, res) => {
        const userid = await getUserIdByUserToken(req, res)
        if (userid) {
            botHandler.sendDM(userid, "hi")
            res.send("ok")
        }
    },
    checkSkill: async (req, res) => {
        const userid = await getUserIdByUserToken(req, res)
        if (userid) {
            const skillData = req.body
            const result = diceRoller.rollSkillOrSpell(skillData, "skill", userid)
            const channelid = await cache.getChannel(userid)
            if (!channelid) {
                res.status = 409
                res.send("No channel locked")
                return
            }
            botHandler.sendChannelMessage(channelid, result.message)
            res.send(result.checkResult)
        }
    },
    checkSpell: async (req, res) => {
        const userid = await getUserIdByUserToken(req, res)
        if (userid) {
            botHandler.sendDM(userid, "hi")
            res.send("ok")
        }
    }
}