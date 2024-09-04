require('dotenv').config()
const Redis = require('ioredis')

const redis = new Redis({
    port: 18357,
    host: process.env.REDIS_HOST,
    username: "default",
    password: process.env.REDIS_PASSWORD,
    db: 0,
})

module.exports = redis