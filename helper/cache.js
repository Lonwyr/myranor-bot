let cache = {}
const allowListedValues = ['MU', 'KL', 'IN', 'CH', 'GE', 'FF', 'KO', 'KK']
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = {
    store: async function (userId, char, slot) {
        const charString = JSON.stringify(char)

        const client = await pool.connect()
        try {
            const insertCharacterQuery = {
                text: `INSERT INTO characters (userid, slot, character)
                VALUES($1, $2, $3) 
                ON CONFLICT (userid, slot) 
                DO 
                UPDATE SET character = $3`,
                values: [userId, slot, charString]
            }
            await client.query(insertCharacterQuery)
                
            const actiaveSlotQuery = {
                text: `INSERT INTO activeslot (userid, slot)
                VALUES($1, $2) 
                ON CONFLICT (userid) 
                DO 
                UPDATE SET slot = $2`,
                values: [userId, slot]
            }
            await client.query(actiaveSlotQuery)
        } finally {
            client.release()
        }
        
        cache[userId] = char
    },
    setChannel: async function (userId, channelId) {
        const client = await pool.connect()
        try {                
            const setChannelQuery = {
                text: `INSERT INTO activeslot (userid, channelId)
                VALUES($1, $2) 
                ON CONFLICT (userid) 
                DO 
                UPDATE SET channelId = $2`,
                values: [userId, channelId]
            }
            await client.query(setChannelQuery)
        } finally {
            client.release()
        }
    },
    createAppPassword: async function (userId) {
        const client = await pool.connect()
        const password = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        try {                
            const setPasswordQuery = {
                text: `INSERT INTO activeslot (userid, appPassword)
                VALUES($1, $2) 
                ON CONFLICT (userid) 
                DO 
                UPDATE SET appPassword = $2`,
                values: [userId, password]
            }
            await client.query(setPasswordQuery)
            return password
        } finally {
            client.release()
        }
    },
    getUserIdByAppPassword: async function (password) {
        const client = await pool.connect()
        try {                
            const getUserIdByAppPasswordQuery = {
                text: `SELECT userid
                FROM activeslot
                WHERE appPassword = $1`,
                values: [password]
            }
            const result = await client.query(getUserIdByAppPasswordQuery)
            return result.rows.length && result.rows[0].userid
        } finally {
            client.release()
        }
    },
    getChannel: async function (userId) {
        const client = await pool.connect()
        try {                
            const getChannelQuery = {
                text: `SELECT channelId
                FROM activeslot
                WHERE userid = $1`,
                values: [userId]
            }
            const result = await client.query(getChannelQuery)
            return result.rows.length && result.rows[0].channelid
        } finally {
            client.release()
        }
    },
    load: async function () {
        const client = await pool.connect()
        console.info('Loading characters from DB')
        try {
            const result = await client.query(`SELECT c.userid, character FROM characters c inner join activeslot a ON c.userid = a.userid and c.slot = a.slot`)
            for (row of result.rows) {
                cache[row.userid] = JSON.parse(row.character)
            }
            console.info('Characters loaded from DB')
        } finally {
            client.release()
        }
    },
    getSlotInfo: async function (userId) {
        const client = await pool.connect()
        try {
            const getSlots = {
                text: `
                    SELECT slot
                    FROM characters
                    WHERE userid = $1
                `,
                values: [userId]
            }
            const getSlotsResult = await client.query(getSlots)
          
            const getActiveSlot = {
                text: `
                    SELECT slot
                    FROM activeslot
                    WHERE userid = $1`,
                values: [userId]
            }
            const getActiveSlotResult = await client.query(getActiveSlot)

            return {
                activeSlot: getActiveSlotResult.rows && getActiveSlotResult.rows[0].slot,
                usedSlots: getSlotsResult.rows.map(row => row.slot),
                availableSlots: [1,2,3]
            }
        } finally {
            client.release()
        }
    },
    activateSlot: async function (userId, slot) {
        const client = await pool.connect()
        try {
            const getActiveCharacter = {
                text: `
                    SELECT userid, character
                    FROM characters
                    WHERE slot = $1 AND userid = $2
                `,
                values: [slot, userId]
            }
            const result = await client.query(getActiveCharacter)
           
            if (result.rows.length !== 1) {
                return
            }
            cache[userId] = JSON.parse(result.rows[0].character)

            const activateSlotQuery = {
                text: `
                    INSERT INTO activeslot (userid, slot)
                    VALUES($1, $2) 
                    ON CONFLICT (userid)
                    DO 
                    UPDATE SET slot = $2`,
                values: [userId, slot]
            }
            await client.query(activateSlotQuery)

            return this.getName(userId)
        } finally {
            client.release()
        }
    },
    checkCharacter: function (userId) {
        return !!cache[userId]
    },
    getCharacter: function (userId) {
        if (cache[userId]) {
            return cache[userId]
        } else {
            console.log(`Character for ${userId} is not stored.`)
            throw Error(`Character for ${userId} is not stored.`)
        }
    },
    getAttribute: function (userId, key) {
        if (cache[userId] && cache[userId].attributes[key] !== undefined) {
            return cache[userId].attributes[key]
        } else {
            console.log(`Attribute ${key} for user ${userId} is not stored.`)
            throw Error(`Wert **${key}** ist mir für deinen Char nicht bekannt.`)
        }
    },
    getName: function (userId) {
        if (cache[userId]) {
            return cache[userId].name
        } else {
            console.log(`No character for user ${userId} is stored.`)
            throw Error(`Du hast noch keinen Charakter gespeichert. **Flüster ihn mir einfach zu**.`)
        }
    },
    checkSkill: function (userId, key) {
        return !!cache[userId].skills[key]
    },
    getSkill: function (userId, key) {
        if (cache[userId] && cache[userId].skills[key] !== undefined) {
            return cache[userId].skills[key]
        } else {
            console.log(`Skill ${key} for user ${userId} is not stored.`)
            throw Error(`Das Talent **${key}** ist für deinen Char nicht aktiviert.`)
        }
    },
    getSpell: function (userId, key) {
        if (cache[userId] && cache[userId].spells[key] !== undefined) {
            return cache[userId].spells[key]
        } else {
            console.log(`Spell ${key} for user ${userId} is not stored.`)
            throw Error(`Der Zauber **${key}** ist für deinen Char nicht aktiviert.`)
        }
    },
}
