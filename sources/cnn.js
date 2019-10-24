/* cnn.js */
const Event = require('../mongo')
const Cache = require('../cache')
const emitter = require('events').EventEmitter
const Parser = require('rss-parser')
const parser = new Parser()
const myEmitter = new emitter()

async function getCNN() {
    try {
        let feed = await parser.parseURL("http://rss.cnn.com/rss/cnn_latest.rss")
        for (let entry of feed.items) {
            let {title, contentSnippet, guid, isoDate} = entry
            let evt = new Event({url: guid, title: title, source: 'CNN'})
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
    getCNN()
    setInterval(getCNN, (1000*60))  // start with 1 minute refresh
}

module.exports = {
    poll: startPolling,
    sync: myEmitter,
    name: "CNN"
}
