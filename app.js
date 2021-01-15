
console.log("Starting")

const Discord = require("discord.js")
const config = require("./config.json")
const botCommands = require('./commands')

config.token = process.env.BOT_SECRET

const bot = new Discord.Client()
bot.commands = new Discord.Collection()


console.log("use bot token: " + config.token)

bot.login(config.token)

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key])
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/)
  const content = args.shift().toLowerCase()
  console.info(`Called command: ${content}`)

  if (!content.startsWith(config.prefix)) return

  const command = content.slice(1)

  if (!bot.commands.has(command)) return

  try {
    bot.commands.get(command).execute(msg, args)
  } catch (error) {
    console.error(error)
    msg.reply('there was an error trying to execute that command!')
  }
});

/*
client.on("message", (message) => {
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	console.log("command received: " + message.content)
	
	if (message.content.startsWith(config.prefix + "ping")) {
		message.channel.send("pong!");
	} else
	if (message.content.startsWith(config.prefix + "foo")) {
		message.channel.send("bar!");
	}
})*/
