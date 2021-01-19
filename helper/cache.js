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
            await client.query(`
                INSERT INTO characters (userid, slot, character)
                VALUES('${userId}', '${slot}', '${charString}') 
                ON CONFLICT (userid, slot) 
                DO 
                UPDATE SET character = '${charString}'`)
                
            await client.query(`
                INSERT INTO activeslot (userid, slot)
                VALUES('${userId}', '${slot}') 
                ON CONFLICT (userid) 
                DO 
                UPDATE SET slot = '${slot}'`)
        } finally {
            client.release()
        }
        
        cache[userId] = char
    },
    load: async function () {
        const client = await pool.connect()
        console.info('Loading characters from DB')
        try {
            const result = await client.query(`
                SELECT c.userid, character FROM characters c inner join activeslot a ON c.userid = a.userid
                UNION
                SELECT userid, character FROM characters c WHERE slot = '1' AND userid NOT IN (SELECT userid FROM activeslot)
            `)
            for (row of result.rows) {
                cache[row.userid] = JSON.parse(row.character)
            }
            console.info('Characters loaded from DB')
        } finally {
            client.release()
        }
    },
    activateSlot: async function (userId, slot) {
        const client = await pool.connect()
        try {
            const result = await client.query(`
                SELECT userid, character
                FROM characters
                WHERE slot = '${slot}' AND userid = '${userId}'
            `)
           
            if (result.rows.length !== 1) {
                return
            }
            cache[userId] = JSON.parse(result.rows[0].character)

            await client.query(`
                INSERT INTO activeslot (userid, slot)
                VALUES('${userId}', '${slot}') 
                ON CONFLICT (userid)
                DO 
                UPDATE SET slot = '${slot}'`)

                return this.getName(userId)
        } finally {
            client.release()
        }
    },
    checkCharacter: function (userId) {
        return !!cache[userId]
    },
    getAttribute: function (userId, key) {
        if (cache[userId] && cache[userId].attributes[key]) {
            return cache[userId].attributes[key]
        } else {
            throw Error(`Wert ${key} for user ${userId} is not stored.`)
        }
    },
    getName: function (userId) {
        if (cache[userId]) {
            return cache[userId].name
        } else {
            throw Error(`No character for user ${userId} is stored.`)
        }
    },
    getSkill: function (userId, key) {
        if (cache[userId] && cache[userId].skills[key]) {
            return cache[userId].skills[key]
        } else {
            throw Error(`Skill ${key} for user ${userId} is not stored.`)
        }
    },
    getSpell: function (userId, key) {
        if (cache[userId] && cache[userId].spells[key]) {
            return cache[userId].spells[key]
        } else {
            throw Error(`Spell ${key} for user ${userId} is not stored.`)
        }
    },
}
