/* cache.js */
const got = require('got')

class Cache {
    constructor() {
        this._cache = new Set()
    }

    // first attempt at making a cache that we can use quickly
    async add(v) {
        v.url = await this._checkUrlRedirects(v)
        if (!this._cache.has(v.url)) {
            this._cache.add(v.url)
            return true
        } else {
            return false
        }
    }

    async _checkUrlRedirects(v) {
        let check = await got.head(v.url, {followRedirect: true})
        return check.request.gotOptions.href
    }
}

module.exports = new Cache()
