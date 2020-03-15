const got = require("got")
const Event = require('../mongo')
const Cache = require('../cache')

const emitter = require('events').EventEmitter

const myEmitter = new emitter()		// there has to be a better way but oh well

async function getNYT() {
	try {
		const resp = await got(`https://api.nytimes.com/svc/news/v3/content/all/all.json?api-key=${process.env.NYT}`)
		let results = JSON.parse(resp.body).results
		results = results.filter(r =>	// http://api.nytimes.com/svc/news/v3/content/section-list.json
			["Briefing",
			"Business",
			"Climate",
			"Corrections",
			"Education",
			"Health",
			"Job Market",
			"Science",
			"Technology",
			"U.S.",
			"Universal",
			"World",
			"Your Money"].includes(r.section)
		)
		for (let result of results.slice(0, 50)) {	// it returns 500, just take the 50 most recent
			let evt = new Event({
				url: result.url,
				title: result.title,
				tags: result.des_facet,
				source: "NY Times"
			})
			_processItem(evt)
		}
	} catch {
		// pass, we don't care about failures
	}
}

async function _processItem(item) {
    if (await Cache.add(item)) {
        myEmitter.emit('event', item)
    }
}
function startPolling() {
	getNYT()
	setInterval(getNYT, (1000*60))	// start with 1 minute refresh
}

module.exports = {
	poll: startPolling,
	sync: myEmitter,
	name: "New York Times"
}
