/* cache.js */
const got = require('got')
const redis = require('redis')
const {promisify} = require('util')
const emitter = require('events').EventEmitter

const Event = require('./Event')

class Cache {
    constructor() {
        this._redis = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true})
        // set up the redis library to work with our async/await code
        this._setex = promisify(this._redis.setex).bind(this._redis)
        this._exists = promisify(this._redis.exists).bind(this._redis)
        this._scan = promisify(this._redis.scan).bind(this._redis)
        this._mget = promisify(this._redis.mget).bind(this._redis)
        // use the following to dump the cache on start up
        this.history = new emitter()
    }

    async add(v) {
        try {
            v.url = await this._checkUrlRedirects(v)
            if (!v.url) {
                return false
            }
            let key = v.url     // this used to be hashed but then we can't dump cache to new connections
            if (! await this._exists(key)) {
                await this._setex(key, (60*60*24), v.title)       // cache expires after a day
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

    async dumpCache() {
        let [cursor, keys] = await this._scan(0)
        while (cursor != 0) {
            (async () => {
                let vals = await this._mget(keys)
                let evts = vals.map((v,i) => {
                    return new Event(keys[i], v, {})
                })
                this.history.emit('history', evts)
            })()
            let [c, k] = await this._scan(cursor, ["count", "50"])
            cursor = c  // for some reason I couldn't get the destructure to work on reassign
            keys = k
        }
        return
    }
}

module.exports = new Cache()
