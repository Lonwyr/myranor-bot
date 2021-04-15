const Discord = require("discord.js")
const config = require("./config.json")
const botCommands = require('./commands')
const charImporter = require('./helper/charImporter')
const charExporter = require('./helper/charExporter')
const cache = require('./helper/cache')
const initController = require('./helper/initController')

const bot = new Discord.Client()

async function getChannelById(channelid) {
    let channel = bot.channels.cache.get(channelid)
    if (!channel) {
        channel = await bot.channels.fetch(channelid)
    }
    return channel;
} 

module.exports = {
    init: function() {
        config.token = process.env.BOT_SECRET

        bot.commands = new Discord.Collection()

        bot.login(config.token)

        Object.keys(botCommands).map(key => {
        bot.commands.set(botCommands[key].name, botCommands[key])
        });

        bot.on("ready", async () => {
        bot.user.setActivity(config.prefix + 'hilfe', { type: 'WATCHING' })
        await cache.load()
        console.log("bot ready")
        })

        bot.on('message', msg => {
        try {
            // import
            if (msg.channel.type === 'dm' && msg.attachments.size > 0) {
            charImporter.import(msg)
            }

            const args = msg.content.split(/[ |\,]+/)
            const content = args.shift().toLowerCase()

            if (!content.startsWith(config.prefix)) return

            const command = content.slice(config.prefix.length) // remove the prelimiter

            if (!bot.commands.has(command)) {
                return
            }

            bot.commands.get(command).execute(msg, args)
        } catch (error) {
            console.error(error)
            msg.reply('there was an error trying to execute that command!')
        }
        })

        bot.on('messageReactionAdd', initController.onReaction)
    },
    sendDM: async function (userid, message) {
        let user = bot.users.cache.get(userid)
        if (!user) {
            user = await bot.users.fetch(userid)
        }
        user.send(message)
    },
    getChannel: async function (userid) {
        const channelid = await cache.getChannel(userid)
        if (channelid) {
            return getChannelById(channelid)
        } else {
            throw new Error("no channel set")
        }
    },
    sendChannelMessage: async function (channelid, message) {
        const channel = await getChannelById(channelid)
        channel.send(message)
    },
    getCharacter: function (userid) {
        const character = cache.getCharacter(userid)
        return charExporter.export(character)
    }
}