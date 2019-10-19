const got = require("got")
const Event = require('../Event')
const emitter = require('events').EventEmitter

const myEmitter = new emitter()		// there has to be a better way but oh well

async function getTopHN() {
	const resp = await got('https://hacker-news.firebaseio.com/v0/newstories.json')
	let ids = JSON.parse(resp.body)
	let rqs = []
	for (let id of ids.slice(0, 10)) {
		rqs.push(got(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
	}
	let news = await Promise.all(rqs)	// might be an optimization here with when to parse data
	return news.map(e => {
		let {url, title, time} = JSON.parse(e.body)
		myEmitter.emit('event', new Event(url, title, {source: "hn", time: time}))
	})
}

module.exports = {
	poll: getTopHN,
	sync: myEmitter,
	name: "Hacker News"
}
