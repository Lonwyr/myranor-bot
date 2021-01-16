const diceRoller = require('../helper/diceRoller')
const Discord = require('discord.js')

module.exports = {
  name: 'issues',
  description: 'Info for feedback',
  help: '*Gibt Informationen, wie man Bugs melden kann oder einfach nur Danke sagen.',
  execute(msg, args) {
    const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Hinterlasse Feedback oder melde Bugs auf GitHub')
    .setURL('https://github.com/Lonwyr/myranor-bot/issues')
    .setAuthor('Christian V.', 'https://avatars3.githubusercontent.com/u/6439391?s=460&u=1a59cd1d5faacf3a8d820276df23d6fe43ac4c3c&v=4', '')
    .setDescription('Github of the Bot you are just takling to')
    .addField('oder schreib mich an', '<@219427709908942848>')

    msg.channel.send(exampleEmbed)
  }
}
