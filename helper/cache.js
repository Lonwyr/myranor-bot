let cache = {}

module.exports = {
    store: function (userId, args) {
        if (!cache[userId])
            cache[userId] = {}

        args.forEach((arg) => {
            [key, value] = arg.split(/\=/)

            if (key.match(/[a-zA-Z]+/g) && value.match(/\d+/g))
                cache[userId][key] = value
        })
    },
    get: function (userId, key) {
        if (!cache[userId] || !cache[userId][key]) 
            throw new Error('Wert nicht gespeichert oder ich habe es vergessen -.-')
        
        return cache[userId][key]
    }
}
