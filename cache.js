/* cache.js */
const got = require('got')

const Event = require('./mongo')

class Cache {
    async add(v) {
        try {
            v.url = await this._checkUrlRedirects(v)
            if (!v.url) {
                return false
            }
            await v.save()      // since we set unique on url this will handle some dups
            return true
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
            return v
        }
    }

    async dumpCache() {
        return Event.dump()
    }
}

module.exports = new Cache()
