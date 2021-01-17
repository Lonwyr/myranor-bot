let cache = {}
const allowListedValues = ['MU', 'KL', 'IN', 'CH', 'GE', 'FF', 'KO', 'KK']
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
    store: async function (userId, args) {
        if (!cache[userId])
            cache[userId] = {}

        for (const arg of args) {
            [key, value] = arg.split(/\=/)

            if (allowListedValues.includes(key) && value.match(/\d+/g)) {
                const client = await pool.connect()
                await client.query(`
                    INSERT INTO values (userid, key, value)
                    VALUES('${userId}', '${key}','${value}') 
                    ON CONFLICT (userId, key) 
                    DO 
                    UPDATE SET value = '${value}' `)
                client.release()
            } else {
                throw new Error('Wert nicht erlaubt.')
            }
        }
    },
    get: async function (userId, key) {
        if (allowListedValues.includes(key)) {
            const client = await pool.connect()
            const result = await client.query(`
                SELECT value FROM values WHERE userid = '${userId}' AND key = '${key}'`)
            client.release()
            if (!result.rowCount === 1) throw new Error(`Wert '${key}' war nicht gespeichert`)
            return result.rows[0].value
        } else {
            throw new Error('Wert nicht erlaubt.')
        }
    }
}
