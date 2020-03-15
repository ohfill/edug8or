/* reddit.js */
const Event = require('../mongo')
const Cache = require('../cache')
const emitter = require('events').EventEmitter
const Parser = require('rss-parser')
const html = require('node-html-parser').parse
const parser = new Parser()
const myEmitter = new emitter()

async function getCNBC() {
    try {
        let feed = await parser.parseURL("https://www.cnbc.com/id/15837362/device/rss/rss.html")
        let entries = feed.items.sort((a,b) => a.pubDate < b.pubDate)
        for (let entry of entries) {
            let url = entry.link
            let {title} = entry
            let evt = new Event({url: url, title: title, source: "CNBC"})
            _processItem(evt)
        }
    } catch {
        // pass, failures don't really matter
    }
}

async function _processItem(item) {
    if (await Cache.add(item)) {
        myEmitter.emit('event', item)
    }
}

function startPolling() {
    getCNBC()
    setInterval(getCNBC, (1000*60))  // start with 1 minute refresh
}

module.exports = {
    poll: startPolling,
    sync: myEmitter,
    name: "CNBC"
}
