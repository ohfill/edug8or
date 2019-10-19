/* reddit.js */
const Event = require('../Event')
const Cache = require('../cache')
const emitter = require('events').EventEmitter
const Parser = require('rss-parser')
const html = require('node-html-parser').parse
const parser = new Parser()
const myEmitter = new emitter()

async function getReddit() {
    console.log('polling reddit...')
    try {
        let feed = await parser.parseURL("http://www.reddit.com/r/news+globalnews+politics.rss")
        for (let entry of feed.items) {
            let body = html(entry.content)
            let url = body.querySelector('span a').attributes.href       // this is real shakey and will probably break one day
            let {title} = entry
            let evt = new Event(url, title, {})
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
    getReddit()
    setInterval(getReddit, (1000*60))  // start with 1 minute refresh
}

module.exports = {
    poll: startPolling,
    sync: myEmitter,
    name: "Reddit"
}
