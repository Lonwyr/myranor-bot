const Discord = require('discord.js')
const colors = require('./colors')
const cache = require('./cache')

let activeInitatives = {}

function setActiveInitative (message) {
  activeInitatives[message.channel.id] = {
    message: message,
    participants: {}
  }
}

function getActiveInitative (channelId) {
  return activeInitatives[channelId]
}

function initStop(channelId) {
  delete activeInitatives[channelId]
}

function startInit(message) {
  let resultEmbed = new Discord.MessageEmbed()
  .setColor(colors.neutral)
  .setTitle("Initiative")

  return message.channel.send(resultEmbed).then(async resultMessage => {
    //await resultMessage.react('🎲')
    await resultMessage.react('☠️')
    //await resultMessage.react('🛑')
    setActiveInitative(resultMessage)
  })
}

async function getInit(message) {
  if (!activeInitatives[message.channel.id]) {
    await startInit(message)
  }

  return activeInitatives[message.channel.id]
}

async function setParticipant(message, name, initValue) {
  let init = await getInit(message)
  init.participants[name] = initValue
  postInit(message)
}

async function removeParticipant(message, name) {
  let init = await getInit(message)
  if (init.participants[name]) {
    delete init.participants[name]
    postInit(message)
  }
}
async function postInit(message) {
  const activeInitiative = await getInit(message)

  let participantsToPost = []
  for (const participant in activeInitiative.participants) {
    participantsToPost.push({
      name: participant,
      value: activeInitiative.participants[participant]
    })
  }
  participantsToPost = participantsToPost.sort((a,b) => {
    if (a.value < b.value) {
      return 1
    }

    if (a.value > b.value) {
      return -1
    }

    return 0
  })

  let resultEmbed = new Discord.MessageEmbed()
    .setColor(colors.neutral)
    .setTitle("Initiative")
  for (const participant of participantsToPost) {
    resultEmbed.addField(participant.name, participant.value)
  }

  activeInitiative.message.delete()

  return message.channel.send(resultEmbed).then(async resultMessage => {
    //await resultMessage.react('🎲')
    await resultMessage.react('☠️')
    //await resultMessage.react('🛑')
    activeInitiative.message = resultMessage
  })
}

module.exports = {
  onInit: async function (message, args) {
    const channelId = message.channel.id;

    switch (args.length) {
      case 0:
        startInit(message)
        break
      case 1:
        const initValueOrCommand = args[0]

        // direct setting an initative
        if (!isNaN(initValueOrCommand)) {
          const name = cache.checkCharacter(message.author.id) ? cache.getName(message.author.id) : msg.author.username
          setParticipant(message, name, parseInt(initValueOrCommand))
          return
        }
        
        switch (initValueOrCommand) {
          case 'start':
            startInit(message)
            break
          case 'stop':
            initStop(message)
            break
        }
        break
      case 2:
        if (args[0] === 'remove') {
          removeParticipant(message, args[1])
        }

        if (!isNaN(args[1])) {
          setParticipant(message, args[0], parseInt(args[1]))
        }
        break
      case 3:
        if (args[0] === 'set' && !isNaN(args[2])) {
          setParticipant(message, args[1], parseInt(args[2]))
        }
        break
    }
  },
  onReaction: function (reaction, user) {
    const channelId = reaction.message.channel.id
    if (getActiveInitative(channelId) && getActiveInitative(channelId).message === reaction.message) {
      if (reaction.emoji.name === '☠️') {
        const name = cache.checkCharacter(user.id) ? cache.getName(user.id) : user.username
        removeParticipant(reaction.message, name)
      }
    }
  }
}

  // TODOS: update the init list, add rolling and rerolling