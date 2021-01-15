const random = require('random')

module.exports = {
  sum: (size=6, number=1, algebraic="+", modifier=0) => {
    const results = Array.from(Array(number)).map(() => random.int(min=1, max=size))
    let sum = results.reduce((previous, current) => {return previous + current}, 0)

    const factor = algebraic === "+" ? 1 : -1
    sum += (modifier * factor)

    return {
        results: results,
        sum: sum
    }
  },
  roll: (size) => random.int(min=1, max=size)
}
