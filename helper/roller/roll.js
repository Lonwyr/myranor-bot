const random = require('random')

module.exports = function (size) {
    return random.int(min=1, max=size)
}