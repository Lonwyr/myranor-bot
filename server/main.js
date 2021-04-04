const authentication = require('./authentication')
const botHandler = require('./../botHandler')
const cache = require('./../helper/cache')
const diceRoller = require('./../helper/diceRoller')

function validateUserToken(req, res) {
    const usertoken = req.body && req.body.usertoken
    const valid = authentication.validateUsertoken(usertoken)
    if (!valid) {
        res.status(403)
        res.send()
    } else {
        return true
    }
}

module.exports = {
    handleRequest: (req, res) => {
        debugger
        res.send("ok")

    },
    validateUsertoken: (req, res) => {
        const validUser = validateUserToken(req, res)
        if (validUser) {
            res.send()
        }
    },
    getCharacter: (req, res) => {
        const validUser = validateUserToken(req, res)
        if (validUser) {
            const userid = authentication.getUserId(req.headers.usertoken)
            const character = botHandler.getCharacter(userid)
            res.send(character)
        }
    },
    checkAttribute: (req, res) => {
        const validUser = validateUserToken(req, res)
        if (validUser) {
            const userid = authentication.getUserId(req.headers.usertoken)
            botHandler.sendDM(userid, "hi")
            res.send("ok")
        }
    },
    checkSkill: async (req, res) => {
        const validUser = validateUserToken(req, res)
        if (validUser) {
            const userid = authentication.getUserId(req.headers.usertoken)
            const skillData = req.body
            const result = diceRoller.rollSkillOrSpell(skillData, "skill", userid)
            const channelData = await cache.getChannel(userid)
            if (!channelData) {
                res.status = 409
                res.send("No channel locked")
                return
            }
            botHandler.sendChannelMessage(channelData.channelid, result.message)
            res.send(result.checkResult)
        }
    },
    checkSpell: (req, res) => {
        const validUser = validateUserToken(req, res)
        if (validUser) {
            const userid = authentication.getUserId(req.headers.usertoken)
            botHandler.sendDM(userid, "hi")
            res.send("ok")
        }
    }
}