/* threatpost.js */
const Event = require('../mongo')
const Cache = require('../cache')
const emitter = require('events').EventEmitter
const Parser = require('rss-parser')
const parser = new Parser()
const myEmitter = new emitter()

async function getThreatPost() {
    try {
        let feed = await parser.parseURL("https://threatpost.com/feed/")
        for (let entry of feed.items) {
            let {title, contentSnippet, link, pubDate, categories} = entry
            let evt = new Event({url: link, title: title, source: "Threat Post",tags: categories})
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
    getThreatPost()
    setInterval(getThreatPost, (1000*60))  // start with 1 minute refresh
}

module.exports = {
    poll: startPolling,
    sync: myEmitter,
    name: "Threat Post"
}
