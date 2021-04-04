console.log("Starting")

const botHandler = require("./botHandler.js")
const expressHandler = require("./expressHandler.js")

botHandler.init()
expressHandler.init()