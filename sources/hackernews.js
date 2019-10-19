const got = require("got")
const Event = require('../Event')
const Cache = require('../cache')

const emitter = require('events').EventEmitter

const myEmitter = new emitter()		// there has to be a better way but oh well

async function getTopHN() {
	console.log('polling hn...')
	const resp = await got('https://hacker-news.firebaseio.com/v0/newstories.json')
	let ids = JSON.parse(resp.body)
	let rqs = []
	for (let id of ids.slice(0, 10)) {		// really need to trial and error this one (also vs top/hot)
		// it might make sense to just leave the top X and then cache will handle actual new things after 
		// a small mess at start-up
		_processItem(
			got(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
		)
	}
}

async function _processItem(item) {
	let res = await item
	let {url, title, time} = JSON.parse(res.body)
	let evt = new Event(url, title, {sourc: "hn", time: time})
	if (await Cache.add(evt)) {
		myEmitter.emit('event', evt)
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
