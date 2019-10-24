const got = require("got")
const Event = require('../mongo')
const Cache = require('../cache')

const emitter = require('events').EventEmitter

const myEmitter = new emitter()		// there has to be a better way but oh well

async function getTopHN() {
	try {
		const resp = await got('https://hacker-news.firebaseio.com/v0/newstories.json')
		let ids = JSON.parse(resp.body)
		for (let id of ids.slice(0, 50)) {		// really need to trial and error this one (also vs top/hot)
			// it might make sense to just leave the top X and then cache will handle actual new things after 
			// a small mess at start-up
			_processItem(
				got(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
			)
		}
	} catch {
		// pass, we don't care about failures
	}
}

async function _processItem(item) {
	let res = await item
	try {
		let {url, title} = JSON.parse(res.body)
		let evt = new Event({url: url, title: title, source: "Hacker News"})
		if (await Cache.add(evt)) {
			myEmitter.emit('event', evt)
		}
	} catch {
		// console.log('> failed parse for', res.body, res.requestUrl)
		// looks like sometimes the api just does not return anything
	}
}

function startPolling() {
	getTopHN()
	setInterval(getTopHN, (1000*60))	// start with 1 minute refresh
}

module.exports = {
	poll: startPolling,
	sync: myEmitter,
	name: "Hacker News"
}
