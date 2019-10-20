/* cache.js */
const got = require('got')
const redis = require('redis')
const {promisify} = require('util')

class Cache {
    constructor() {
        this._redis = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})

        // set up the redis library to work with our async/await code
        this._setex = promisify(this._redis.setex).bind(this._redis)
        this._exists = promisify(this._redis.exists).bind(this._redis)
    }

    async add(v) {
        try {
            v.url = await this._checkUrlRedirects(v)
            if (!v.url) {
                return false
            }
            let key = v.url     // this used to be hashed but then we can't dump cache to new connections
            if (! await this._exists(key)) {
                await this._setex(key, (60*60*24), 1)       // cache expires after a day
                return true
            }
        } catch(error) {
            return false
        }
    }

    async _checkUrlRedirects(v) {
        try {
            let check = await got.head(v.url, {followRedirect: true})
            return check.request.gotOptions.href
        } catch {
            // if for some reason we can't check for the redirects
            return ''
        }
    }
}

module.exports = new Cache()
